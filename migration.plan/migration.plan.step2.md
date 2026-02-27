# STEP 2 — Create GameGateway (socket.io)

## Obiettivo dello step

Creare un gateway NestJS che:

- Accetta connessioni socket.io solo se il JWT è valido
- Permette ai client di iscriversi a una room per partita (`game:<gameId>`)
- Invia subito al client la snapshot dello stato (`game:state-updated`) quando entra nella room
- Espone metodi "helper" (`emitGameStateUpdated`, `emitGameStarted`, …) che chiamerai dallo `GamesService` nello step 5

**File:** `api/src/games/game.gateway.ts`

---

## 2.1 — Decorator e classe base

```ts
@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
```

- Verify JWT on connection
- Manage room subscription
- Emit events

---

## 2.2 — Required Methods

### `handleConnection`

- Extract `client.handshake.auth.token`
- Verify via `JwtService`
- Store `{ userId, email }` in `client.data`
- Disconnect if invalid

### `handleDisconnect`

- No-op

---

## 2.3 — Subscribe Messages

### `game:join-room`

- `client.join("game:${gameId}")`
- Fetch current `GameStateDto`
- `client.emit('game:state-updated', stateDto)` (snapshot immediato)

### `game:leave-room`

- `client.leave("game:${gameId}")`

---

## 2.4 — Emit Helpers

Metodi che il `GamesService` chiamerà nello step 5:

- `emitPlayerJoined(gameId, payload)`
- `emitGameStarted(gameId)`
- `emitGameStateUpdated(gameId, state)`
- `emitGameDeleted(gameId)`

Tutti usano:

```ts
this.server.to(`game:${gameId}`).emit(...)
```

---

## 2.5 — Controllo compilazione

```bash
cd api
yarn build
```

> **Nota:** a questo punto il build potrebbe fallire per dipendenze DI non ancora registrate nel modulo (`JwtService`, `Repository<Game>`). È atteso — lo step 3 risolve il wiring.

---

## Output dello Step 2 (Definition of Done)

Lo step 2 è completato quando:

- [ ] `api/src/games/game.gateway.ts` esiste con la classe `GameGateway`
- [ ] Il gateway ha `handleConnection` con verifica JWT
- [ ] Il gateway ha `@SubscribeMessage('game:join-room')` e `@SubscribeMessage('game:leave-room')`
- [ ] I metodi emit helper (`emitPlayerJoined`, `emitGameStarted`, `emitGameStateUpdated`, `emitGameDeleted`) sono implementati
- [ ] `yarn build` passa (o fallisce solo per DI mancante, risolto nello step 3)
