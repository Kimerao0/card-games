# STEP 7 — Eliminare polling e getGameState: GameRoom aggiornata solo via WebSocket

## Obiettivo

Ora che GameRoom/index.tsx:

- fa `joinGameRoom(gameId)` su mount
- si sottoscrive a `game:state-updated`, `game:started`, `game:player-joined`, `game:deleted`

...dobbiamo completare la migrazione eliminando:

- `useGetGameStateQuery` (che oggi pollava `GET /games/:id/state`)
- tutta la logica di polling intervals (`Created`/`Ready`)
- l'aspettativa che "il polling riallinea" in `handlePlay` (non serve piu)

Lo stato live della partita (`IGameStateDto`) deve arrivare solo da:

- `state.gameSocket.gameState` (Redux)

---

## 7.1 — Rimuovere polling e useGetGameStateQuery

**File:** `ui/src/pages/GameRoom/components/useGameRoomState.ts` [MODIFY]

### A) Modifica import RTK Query

**Prima:**

```ts
import {
  useGetGameHandQuery,
  useGetGamePlayersQuery,
  useGetGameQuery,
  useGetGameStateQuery,
  usePlayCardMutation,
} from "@/store/api/gamesApi";
```

**Dopo:**

```ts
import {
  useGetGameHandQuery,
  useGetGamePlayersQuery,
  useGetGameQuery,
  usePlayCardMutation,
} from "@/store/api/gamesApi";
```

### B) Rimuovere state locali di polling

Subito dopo `currentUser`, rimuovi:

```ts
const [pollingInterval, setPollingInterval] = useState(0);
const [statePollingInterval, setStatePollingInterval] = useState(0);
```

### C) Rimuovere polling da useGetGameQuery

**Prima:**

```ts
const {
  data: game,
  isLoading: isLoadingGame,
  isError,
} = useGetGameQuery(gameId, { pollingInterval });
```

**Dopo:**

```ts
const {
  data: game,
  isLoading: isLoadingGame,
  isError,
} = useGetGameQuery(gameId);
```

> `GET /games/:id` viene fatto una sola volta. Serve solo per metadata iniziale (`Created`/`Ready`, `isUserInGame`, `maxPlayers`).

### D) Eliminare useGetGameStateQuery

Rimuovi completamente:

```ts
const { data: gameState } = useGetGameStateQuery(gameId, {
  skip: !isGameActive || !game?.isUserInGame,
  pollingInterval: statePollingInterval,
});
```

### E) Eliminare useEffect che cambia gli intervalli

Rimuovi completamente:

```ts
useEffect(() => {
  if (game?.status === "Created") {
    setPollingInterval(5000);
    setStatePollingInterval(0);
    return;
  }
  if (game?.status === "Ready") {
    setPollingInterval(0);
    setStatePollingInterval(5000);
    return;
  }
  if (game?.status === "Scoring") {
    setPollingInterval(0);
    setStatePollingInterval(0);
    return;
  }
  setPollingInterval(0);
  setStatePollingInterval(0);
}, [game?.status]);
```

---

## 7.2 — Leggere gameState dal Redux slice socket

**File:** `ui/src/pages/GameRoom/components/useGameRoomState.ts` [MODIFY]

### A) Aggiungere selector

Dopo `currentUser = useAppSelector(selectCurrentUser)`, aggiungi:

```ts
const socketGameState = useAppSelector((state) => state.gameSocket.gameState);
const socketGameStatus = useAppSelector((state) => state.gameSocket.gameStatus);
```

### B) Sostituire tutti gli usi di gameState con socketGameState

Nel file, tutti i memo/effect che leggono `gameState` devono usare `socketGameState`:

- `isMyTurn` memo
- `currentTurnSeat` memo
- `tableCards` memo
- `capturedCounts` memo
- scopa notification effect (usa `scopasByUser`)
- `scoreResult: gameState?.scoreResult`

---

## 7.3 — Gestire isReady / isScoring senza polling

Al momento calcoli:

```ts
const isReady = game?.status === "Ready";
const isScoring = game?.status === "Scoring";
```

Questo va aggiornato: `game` (da `useGetGameQuery`) ormai non e piu aggiornato in tempo reale.

**Regola nuova:**

- `game` serve solo per metadata e guard (`isUserInGame`, `maxPlayers`, `id`, ecc.)
- lo status "live" deve venire dal socket: `socketGameStatus` oppure `socketGameState?.status`

```ts
const effectiveStatus =
  socketGameState?.status ?? socketGameStatus ?? game?.status;
const isReady = effectiveStatus === "Ready";
const isScoring = effectiveStatus === "Scoring";
const isGameActive = isReady || isScoring;
```

---

## 7.4 — Query HTTP che restano e quando farle partire

### getHand

Attualmente dipende da `isReady`:

```ts
const { data: handDto, isLoading: isLoadingHand } = useGetGameHandQuery(
  gameId,
  {
    skip: !isReady || !game?.isUserInGame,
  },
);
```

Questa e ancora giusta, ma ora `isReady` viene dal socket (`effectiveStatus`).

### getPlayers

Attualmente:

```ts
const { data: players } = useGetGamePlayersQuery(gameId, {
  skip: !isGameActive,
});
```

Ok: la fetch players parte quando diventa `Ready` o `Scoring`.

---

## 7.5 — handlePlay: rimuovere "polling riallinea"

Nel catch:

**Prima:**

```ts
} catch {
  // polling riallinea
}
```

**Dopo:**

```ts
} catch {
  // lo stato si riallinea quando il server emette game:state-updated
}
```

Non cambia comportamento, ma evita confusione.

---

## 7.6 — Aggiornare le guardie di rendering in GameRoom/index.tsx

**File:** `ui/src/pages/GameRoom/index.tsx` [MODIFY]

`GameRoom/index.tsx` ora fa subscribe + dispatch sullo slice (step 6), ma la logica di rendering usa ancora `game.status` (dal `useGetGameQuery` HTTP, chiamato una sola volta). Poiché `game` non viene più aggiornato via polling, `game.status` resta fermo al valore iniziale (es. `Created`). Bisogna usare `effectiveStatus` dal hook.

### A) Esporre effectiveStatus e effectivePlayersCount dal hook

In `useGameRoomState.ts`, aggiungere all'interfaccia `GameRoomState`:

```ts
readonly effectiveStatus: string | undefined;
readonly effectivePlayersCount: number | null;
```

E nel return del hook:

```ts
effectiveStatus,
effectivePlayersCount: socketPlayersCount,
```

### B) Sostituire game.status con effectiveStatus nel rendering

**Prima:**

```tsx
if (game.status === 'Created') {
  return <WaitingRoom playersCount={game.playersCount} ... />;
}
if (game.status === 'Scoring') { ... }
if (game.status === 'Ready') { ... }
```

**Dopo:**

```tsx
if (effectiveStatus === 'Created') {
  return <WaitingRoom playersCount={effectivePlayersCount ?? game.playersCount} ... />;
}
if (effectiveStatus === 'Scoring') { ... }
if (effectiveStatus === 'Ready') { ... }
```

> `game` (da HTTP) serve ancora solo per metadata statico (`isUserInGame`, `maxPlayers`, `id`). Lo status live deve sempre venire da `effectiveStatus`.

---

## 7.7 — Cosa NON cambiare (in questi file)

- `Playroom` continua a ricevere i props derivati da `useGameRoomState`.

---

## Output dello Step 7 (Definition of Done)

- [ ] `useGetGameStateQuery` rimosso
- [ ] nessun `pollingInterval` / `statePollingInterval`
- [ ] `gameState` arriva da `state.gameSocket.gameState`
- [ ] `isReady`/`isScoring` derivati da socket (`effectiveStatus`)
- [ ] `getHand` e `getPlayers` continuano via HTTP, ma "triggerati" dallo status socket
- [ ] `GameRoom/index.tsx` usa `effectiveStatus` (non `game.status`) per tutte le guardie di rendering
- [ ] `WaitingRoom` mostra `effectivePlayersCount` (dal socket) con fallback a `game.playersCount`
- [ ] UI aggiornata realtime senza polling
