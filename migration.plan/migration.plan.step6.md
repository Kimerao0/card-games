# STEP 6 — Collegare GameRoom al socket (join room + event listeners)

## Obiettivo

Quando l'utente entra nella pagina di una partita:

- il client entra nella room socket della partita (`game:join-room`)
- riceve snapshot immediato dello stato
- riceve aggiornamenti realtime (`game:state-updated`)
- quando lascia la pagina → leave room + unsubscribe

---

## 6.1 — Importare socket service e slice actions

**File:** `ui/src/pages/GameRoom/index.tsx` [MODIFY]

**Aggiungere import:**

```ts
import { joinGameRoom, leaveGameRoom } from "@/services/socketService";
import {
  onGameStateUpdated,
  onGameStarted,
  onGamePlayerJoined,
  onGameDeleted,
} from "@/services/socketService";

import {
  setGameState,
  setGameStatus,
  setPlayersCount,
} from "@/store/slices/gameSocketSlice";
```

---

## 6.2 — Join room quando il componente monta

Dentro il `useEffect` principale della pagina.

```ts
useEffect(() => {
  if (!gameId) return;

  joinGameRoom(gameId);

  return () => {
    leaveGameRoom(gameId);
  };
}, [gameId]);
```

**Perché serve:**

- Con WebSocket il server non sa chi deve ricevere gli eventi finché il client non si iscrive alla room.
- Entrare nella room significa: `socket.join("game:<gameId>")` — così il server può fare broadcast solo ai giocatori di quella partita.

**Perché prima non serviva:**

- Con polling ogni client interrogava direttamente `GET /games/:id/state`, quindi il server non doveva sapere chi era interessato.

---

## 6.3 — Registrare i listener degli eventi socket

Sempre in `GameRoom.tsx`.

```ts
const dispatch = useAppDispatch();

useEffect(() => {
  const unsubState = onGameStateUpdated((state) => {
    dispatch(setGameState(state));
  });

  const unsubStarted = onGameStarted(() => {
    dispatch(setGameStatus("Ready"));
  });

  const unsubPlayerJoined = onGamePlayerJoined((details) => {
    dispatch(setPlayersCount(details.playersCount));
  });

  const unsubDeleted = onGameDeleted(() => {
    navigate("/");
  });

  return () => {
    unsubState();
    unsubStarted();
    unsubPlayerJoined();
    unsubDeleted();
  };
}, [dispatch]);
```

---

## 6.4 — Cosa fanno questi eventi

### `game:state-updated`

Evento principale del gameplay.

**Arriva quando:**

- qualcuno gioca una carta
- partita appena partita (post deal)
- snapshot dopo join

**Aggiorna:**

- `state.gameSocket.gameState`

### `game:started`

Arriva quando entra il 4° giocatore.

**Serve per:**

- far passare la UI da waiting room → game table

### `game:player-joined`

Arriva quando un giocatore entra nella partita.

**Serve per aggiornare:**

- `playersCount` nella waiting room

### `game:deleted`

Arriva quando il creator cancella la partita.

**Il client deve:**

- `navigate("/")`

---

## 6.5 — Snapshot iniziale

Ricorda: quando chiami `joinGameRoom(gameId)`, il server esegue:

```ts
client.emit("game:state-updated", snapshot);
```

Quindi non serve più chiamare `GET /games/:id/state` per inizializzare lo stato.

---

## 6.6 — Pulizia listener (importantissimo)

Ogni `onGameX` ritorna una funzione unsubscribe.

**Nel cleanup:**

```ts
unsubState();
unsubStarted();
unsubPlayerJoined();
unsubDeleted();
```

**Questo evita:**

- memory leak
- doppie callback
- eventi duplicati dopo navigazioni

---

## Output dello Step 6 (Definition of Done)

- [ ] entrando nella GameRoom: viene chiamato `joinGameRoom`
- [ ] leaving page: viene chiamato `leaveGameRoom`
- [ ] `game:state-updated` aggiorna Redux
- [ ] `game:started` cambia status
- [ ] `game:player-joined` aggiorna `playersCount`
- [ ] `game:deleted` fa redirect
- [ ] nessun listener resta attivo dopo unmount

---

## Cosa manca ancora (Step 7)

Adesso la GameRoom riceve eventi, ma il codice ancora probabilmente:

- usa RTK Query polling
- chiama ancora `GET /games/:id/state`

Nel prossimo step faremo:

**STEP 7 — Rimuovere completamente il polling**

- eliminare `getGameState` polling
- mantenere solo:
  - `getGame` (waiting room metadata)
  - `getPlayers`
  - `getHand`
- gameplay sincronizzato solo via WebSocket

Questo è il punto in cui l'architettura passa definitivamente da polling → realtime.
