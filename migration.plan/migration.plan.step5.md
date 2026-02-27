# STEP 5 — Frontend: gameSocketSlice + integrazione auth (connect/disconnect)

## Obiettivo dello Step 5

- Avere uno slice Redux dedicato agli eventi realtime del gioco (stato partita, playersCount, status)
- Collegare `connectSocket(token)` a login/register e a re-hydration (refresh)
- Collegare `disconnectSocket()` e cleanup allo logout
- Preparare un punto unico dove GameRoom, in step successivo, potrà leggere lo stato realtime

---

## 5.1 — Creare gameSocketSlice.ts

**File:** `ui/src/store/slices/gameSocketSlice.ts` [CREATE]

**Stato:**

- `gameState: IGameStateDto | null`
- `playersCount: number | null`
- `gameStatus: TGameStatus | null`

**Actions (reducers):**

- `setGameState(state)`
- `setPlayersCount(count)`
- `setGameStatus(status)`
- `clearGameSocketState()`

> Nota: anche se `gameState` contiene già `status`, tenere `gameStatus` separato è comodo per:
>
> - waiting room che non ha ancora `gameState`
> - gestire `game:started` in modo semplice

---

## 5.2 — Registrare lo slice nello store

**File:** `ui/src/store/index.ts` [MODIFY]

**Aggiungi:**

```ts
import { gameSocketReducer } from "@/store/slices/gameSocketSlice";
```

```ts
reducer: { ..., gameSocket: gameSocketReducer }
```

**Perché:**

- GameRoom nel prossimo step leggerà `state.gameSocket.gameState` ecc.

**Definition of Done:**

- [ ] build TypeScript ok
- [ ] store include `gameSocket`

---

## 5.3 — Disconnettere socket e ripulire state su logout (listenerMiddleware)

**File:** `ui/src/store/index.ts` [MODIFY]

Hai già un listener su `logout()` che:

- resetta RTK Query cache

Ora aggiungi anche:

- `disconnectSocket()`
- `dispatch(clearGameSocketState())`

**Esempio concettuale (adatta al tuo listener esistente):**

```ts
import { disconnectSocket } from "@/services/socketService";
import { clearGameSocketState } from "@/store/slices/gameSocketSlice";
import { logout } from "@/store/slices/authSlice";

listenerMiddleware.startListening({
  actionCreator: logout,
  effect: async (_action, listenerApi) => {
    disconnectSocket();
    listenerApi.dispatch(clearGameSocketState());

    // codice già esistente:
    // listenerApi.dispatch(baseApi.util.resetApiState());
  },
});
```

**Perché serve:**

- evitare socket "zombie" dopo logout
- evitare che un nuovo login veda stati della partita precedente

**Perché prima non serviva:**

- polling non manteneva connessioni persistenti
- RTK Query cache reset bastava

---

## 5.4 — Connettere socket su login/register (RTK Query authApi.ts)

**File:** `ui/src/store/api/authApi.ts` [MODIFY]

Nel tuo progetto, login e register hanno `onQueryStarted` che dispatcha `setCredentials`.
Dopo aver ottenuto `data.accessToken`, fai:

```ts
connectSocket(data.accessToken);
```

**Esempio concettuale:**

```ts
import { connectSocket } from '@/services/socketService';

onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
  const { data } = await queryFulfilled;
  dispatch(setCredentials(data));
  connectSocket(data.accessToken);
},
```

**Perché serve:**

- quando l'utente fa login, da quel momento deve ricevere eventi realtime

**Perché prima non serviva:**

- il client iniziava a pollare solo entrando nelle pagine gioco; non serviva una connessione globale

---

## 5.5 — Connettere socket su refresh / re-hydration (AuthInitializer)

**File:** `ui/src/components/AuthInitializer.tsx` [MODIFY]

Quando AuthInitializer re-idrata l'utente (token in sessionStorage, user null):

- chiama `connectSocket(token)`

**Dove metterlo:**

- nello stesso punto dove oggi fai `dispatch(setCredentials(...))` dopo `GET /users/profile`

**Perché serve:**

- dopo refresh, Redux è vuoto ma il token esiste: dobbiamo riaprire il socket automaticamente

**Perché prima non serviva:**

- polling ripartiva automaticamente perché RTK Query rifaceva le query appena entravi in pagina

---

## Output dello Step 5 (Definition of Done)

Lo step 5 è completato quando:

- [ ] `gameSocketSlice` creato e registrato nello store
- [ ] su `logout()`:
- [ ] socket disconnesso
- [ ] `gameSocket` ripulito
- [ ] RTK Query cache reset come prima
- [ ] su login/register:
- [ ] socket connesso con token
- [ ] su refresh (AuthInitializer):
- [ ] socket riconnesso con token
