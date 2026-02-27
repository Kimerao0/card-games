# Migration Plan: HTTP Polling → WebSocket (socket.io) + Switch to Express

## Overview

L'app attuale utilizza HTTP polling per mantenere sincronizzato lo stato del gioco:

- `GET /games/:id` durante la waiting room (`Created`)
- `GET /games/:id/state` durante la partita (`Ready`)

Questo genera:

- Traffico inutile
- Latenza (fino a diversi secondi)
- Complessità lato client

Obiettivo della migrazione:

- Eliminare completamente il polling
- Usare WebSocket (socket.io) per push realtime
- Mantenere HTTP per azioni e fetch iniziali
- Semplificare l'integrazione passando da Fastify a Express (solo per il workshop)

---

## Scope

### REST rimane per:

- Login / Register
- Creazione partita
- Join partita (HTTP)
- Fetch mano iniziale
- Fetch lista giocatori
- `POST /games/:id/play`

### WebSocket gestisce:

- Player joined
- Game started
- Game state updated
- Game deleted

## Architecture After Migration

```
Client                               Server
  |                                     |
  |--POST /auth/login---------->|       | (HTTP)
  |<--{ token }-----------------|       |
  |                                     |
  |--socket.io connect--------->|       | auth: { token }
  |                                     |
  |--POST /games--------------->|       | (HTTP)
  |--GET /games/:id/join------->|       | (HTTP)
  |--GET /games/:id/hand------->|       | (HTTP)
  |--GET /games/:id/players---->|       | (HTTP)
  |                                     |
  |--emit("game:join-room")---->|       | subscribe room
  |<--emit("game:state-updated")|       | snapshot immediato
  |                                     |
  |<--emit("game:player-joined")|       |
  |<--emit("game:started")------|       |
  |                                     |
  |--POST /games/:id/play------>|       | (HTTP)
  |<--200 OK--------------------|       |
  |<--emit("game:state-updated")|       |
```

---

## Implementation Steps

---

### Step 1 — Install WebSocket dependencies

**File:** `api/package.json`

```bash
yarn add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

### Step 2 — Create GameGateway

**File:** `api/src/games/game.gateway.ts`

**Responsibilities:**

- `@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })`
- Verify JWT on connection
- Manage room subscription
- Emit events

**Required Methods:**

`handleConnection`:

- Extract `client.handshake.auth.token`
- Verify via `JwtService`
- Store `{ userId, email }` in `client.data`
- Disconnect if invalid

`handleDisconnect`:

- No-op

**Subscribe Messages:**

`game:join-room`:

- `client.join("game:${gameId}")`
- Fetch current `GameStateDto`
- `client.emit('game:state-updated', stateDto)` (snapshot)

`game:leave-room`:

- `client.leave("game:${gameId}")`

**Emit Helpers:**

- `emitPlayerJoined(gameId, payload)`
- `emitGameStarted(gameId)`
- `emitGameStateUpdated(gameId, state)`
- `emitGameDeleted(gameId)`

All use:

```ts
this.server.to(`game:${gameId}`).emit(...)
```

---

### Update GamesModule

**File:** `api/src/games/games.module.ts`

- Add `GameGateway` to providers
- Ensure `JwtService` available
- Import `JwtModule` or `AuthModule`

---

### Step 3 — Attach IoAdapter (Express)

**File:** `api/src/main.ts`

```ts
import { IoAdapter } from "@nestjs/platform-socket.io";

app.useWebSocketAdapter(new IoAdapter(app));
```

Socket shares port 3000.

---

### Step 4 — Update GamesService (Emit After Commit)

**File:** `api/src/games/games.service.ts`

**Inject:**

```ts
private readonly gateway: GameGateway
```

**`joinGame()`:**

After saving participant:

```ts
this.gateway.emitPlayerJoined(gameId, detailsDto);
```

If 4th player joined:

```ts
this.gateway.emitGameStarted(gameId);
this.gateway.emitGameStateUpdated(gameId, stateDto);
```

**`playCard()`:**

Pattern:

```ts
const stateDto = await this.dataSource.transaction(async (manager) => {
  // DB updates
  return builtStateDto;
});

// OUTSIDE transaction
this.gateway.emitGameStateUpdated(gameId, stateDto);
```

> Never emit inside transaction.

**`deleteGame()`:**

```ts
this.gateway.emitGameDeleted(gameId);
```

---

### Step 5 — Install frontend socket client

**File:** `ui/package.json`

```bash
yarn add socket.io-client
```

---

### Create socketService.ts

**File:** `ui/src/services/socketService.ts`

Singleton managing one socket instance.

**API:**

- `connectSocket(token)`
- `disconnectSocket()`
- `joinGameRoom(gameId)`
- `leaveGameRoom(gameId)`
- `onGameStateUpdated(handler)`
- `onGamePlayerJoined(handler)`
- `onGameStarted(handler)`
- `onGameDeleted(handler)`

Guard against double-connect.

---

### Step 6 — Create gameSocketSlice

**File:** `ui/src/store/slices/gameSocketSlice.ts`

**State:**

```ts
{
  gameState: IGameStateDto | null,
  playersCount: number | null,
  gameStatus: TGameStatus | null
}
```

**Reducers:**

- `setGameState`
- `setPlayersCount`
- `setGameStatus`
- `clearGameSocketState`

Add reducer in `store/index.ts`.

---

### Step 7 — Auth Integration + sessionStorage

**Files:**

- `authApi.ts`
- `store/index.ts`
- `AuthInitializer.tsx`

**Actions:**

- **On login/register success:** `connectSocket(accessToken);`
- **On logout:** `disconnectSocket();` + `dispatch(clearGameSocketState());`
- **On refresh (AuthInitializer):** After rehydrating credentials: `connectSocket(token);`

Token source: `sessionStorage`

---

### Step 8 — Update GameRoom

**Remove:**

- Polling logic
- `useGetGameStateQuery`
- `pollingInterval` states

**Add:**

- On mount: `joinGameRoom(gameId);`
- On unmount: `leaveGameRoom(gameId);`

**Subscriptions:**

- `onGameStateUpdated` → `dispatch setGameState`
- `onGamePlayerJoined` → update `playersCount`
- `onGameStarted` → set status `Ready` + `refetchHand` + `refetchPlayers`
- `onGameDeleted` → `navigate('/')`

`gameState` now read from Redux slice.

`useGetGameQuery` called once (no polling).

---

### Step 9 — Remove getGameState endpoint

**File:** `ui/src/store/api/gamesApi.ts`

- Remove `getGameState`
- Keep other endpoints unchanged

---

## Critical Files Summary

**Backend:**

- `api/package.json`
- `api/src/main.ts`
- `api/src/games/game.gateway.ts`
- `api/src/games/games.module.ts`
- `api/src/games/games.service.ts`

**Frontend:**

- `ui/package.json`
- `ui/src/services/socketService.ts`
- `ui/src/store/slices/gameSocketSlice.ts`
- `ui/src/store/index.ts`
- `ui/src/store/api/gamesApi.ts`
- `ui/src/store/api/authApi.ts`
- `ui/src/components/AuthInitializer.tsx`
- `ui/src/pages/GameRoom/index.tsx`

---

## Definition of Done

- [ ] 4 client aprono la stessa partita
- [ ] Il 4° join cambia stato → tutti ricevono `game:started`
- [ ] Una carta giocata aggiorna tutti i client in tempo reale
- [ ] Refresh pagina mantiene stato corretto (snapshot on join)
- [ ] Logout disconnette il socket
- [ ] Nessuna chiamata polling residua nel GameRoom
