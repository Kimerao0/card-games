# STEP 4 — Frontend: install socket.io-client + creare socketService.ts

## Obiettivo dello Step 4

Preparare il client a ricevere eventi realtime dal server, ma senza ancora toccare GameRoom (quello sarà step successivo). Qui vogliamo solo costruire il layer di connessione e ascolto.

---

## 4.1 — Installare dipendenza

**File:** `ui/package.json`

Da `ui/`:

```bash
yarn add socket.io-client
```

**Definition of Done:**

- `socket.io-client` presente in `dependencies`
- build/lint non si rompono

---

## 4.2 — Creare socketService.ts (singleton)

**File:** `ui/src/services/socketService.ts` [CREATE]

**Perché serve adesso:**

Con WS, la connessione deve essere condivisa (una sola) e non ricreata ad ogni componente.

Serve un punto centrale dove:

- connettere/disconnettere in base ad auth
- evitare "double connect"
- centralizzare gli event names
- gestire subscribe/unsubscribe in modo pulito

**Perché prima non serviva:**

- Con polling, ogni pagina/feature poteva chiamare RTK Query e basta: nessuna connessione persistente.
- Non esistevano listener da registrare/rimuovere.

**Implementazione proposta (workshop-friendly):**

Crea un singleton con:

- `connectSocket(token: string)`
- `disconnectSocket()`
- `joinGameRoom(gameId: string)`
- `leaveGameRoom(gameId: string)`
- `onGameStateUpdated(handler)` → ritorna `unsubscribe()`
- `onGamePlayerJoined(handler)` → ritorna `unsubscribe()`
- `onGameStarted(handler)` → ritorna `unsubscribe()`
- `onGameDeleted(handler)` → ritorna `unsubscribe()`

> Nota: qui uso `http://localhost:3000` perché è il tuo baseUrl attuale.

## 4.3 — Sanity check rapido

Avvia ui e api.

Login → (step successivo collegherà `connectSocket` al login, ma puoi già testare manualmente da console se vuoi)

**Build deve passare:**

```bash
cd ui
yarn build
```

---

## Output dello Step 4 (Definition of Done)

Lo step 4 è completato quando:

- [ ] `socket.io-client` installato
- [ ] `ui/src/services/socketService.ts` creato
- [ ] espone `connectSocket`/`disconnectSocket`/`joinGameRoom`/`leaveGameRoom` + `onX` con unsubscribe
- [ ] build UI passa
