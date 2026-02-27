# STEP 3 — Attach Socket.IO to Nest (IoAdapter in main.ts)

## Obiettivo dello step

Abilitare Socket.IO sullo stesso server/porta dell'API HTTP (es. `http://localhost:3000`), così:

- Il client può fare `io('http://localhost:3000', { auth: { token } })`
- Il backend può gestire sia REST che WS sullo stesso runtime

Questo step non cambia logica gioco: rende solo "attivo" lo stack WS a runtime.

---

## 3.1 — Verifica dipendenze

Assicurati che in `api/package.json` ci siano:

- `@nestjs/platform-socket.io`
- `@nestjs/websockets`
- `socket.io`

---

## 3.2 — Modifica `api/src/main.ts`

**File:** `api/src/main.ts` [MODIFY]

### A) Import

Aggiungi:

```ts
import { IoAdapter } from "@nestjs/platform-socket.io";
```

### B) Registra adapter

Dopo aver creato l'app Nest (e prima di `listen()`), registra l'adapter:

```ts
app.useWebSocketAdapter(new IoAdapter(app));
```

### C) Posizione consigliata nel file

Schema tipico (pseudocodice):

```ts
const app = await NestFactory.create(AppModule);

app.enableCors({ ... }); // se già lo usi per HTTP

app.useWebSocketAdapter(new IoAdapter(app));

await app.listen(port, '0.0.0.0');
```

> **Nota:** il CORS per socket.io lo gestisci già nel `@WebSocketGateway({ cors: ... })`, quindi qui non devi "fare cose strane": basta la riga `useWebSocketAdapter`.

---

## 3.3 — Avvio e smoke test

**Avvia server:**

```bash
cd api
yarn start:dev
```

**Cosa verificare:**

- Il server parte senza eccezioni legate a websockets/platform-socket.io
- Nessun errore tipo "cannot read property of undefined" o injection problems (quelli erano più da step 2/3 vecchi)

---

## 3.4 — Test manuale minimo (senza ancora frontend)

Hai due opzioni "semplici" per il workshop:

### Opzione A: test con frontend (quando ci arrivi)

Quando implementerai il client, questo step lo validi subito perché vedrai la connessione socket stabilirsi.

### Opzione B: test "grezzo" subito (solo server)

Aggiungi temporaneamente un log in `handleConnection` del gateway:

```ts
// dentro handleConnection, dopo auth ok
console.log("WS connected", client.id, client.data.userId);
```

Poi prova a connetterti con uno script node minimale (anche in una cartella temp), tipo:

```js
// node test-ws.js
const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", { auth: { token: "PASTE_JWT" } });

socket.on("connect", () => console.log("connected", socket.id));
socket.on("connect_error", (err) => console.log("connect_error", err.message));
```

Se:

- token valido → `connected` + log server
- token invalido → `connect_error` (o disconnect rapido)

> Questo è opzionale: se preferisci evitare extra file, rimanda la validazione allo step client.

---

## Output dello Step 3 (Definition of Done)

Lo step 3 è completato quando:

- [ ] `main.ts` registra `IoAdapter`
- [ ] `yarn start:dev` parte
- [ ] Il gateway riceve connessioni (anche solo tramite test rapido o più avanti col client)
