# STEP 1 — Install backend packages (passo per passo)

## Obiettivo dello Step 1

Aggiungere al backend le dipendenze necessarie per:

- Usare i WebSocket in NestJS (`@nestjs/websockets`)
- Usare l'adapter socket.io ufficiale (`@nestjs/platform-socket.io`)
- Includere il runtime socket.io server (`socket.io`)

Questo step non introduce ancora alcun codice di business: serve solo a mettere a posto il progetto per poter creare il Gateway nello step successivo.

---

## 1.1 — Verifica prerequisiti (prima di installare)

Assicurati di eseguire i comandi dentro `api/` (non nella root).

Da root:

```bash
cd api
```

---

## 1.2 — Installa le dipendenze

Sempre in `api/`:

```bash
yarn add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Cosa stai aggiungendo:**

- **`@nestjs/websockets`**: decorators e primitives (`@WebSocketGateway`, `@SubscribeMessage`, lifecycle hooks)
- **`@nestjs/platform-socket.io`**: integrazione Nest ↔ socket.io (server, adapter)
- **`socket.io`**: implementazione server socket.io

---

## 1.3 — Verifica aggiornamenti su package.json e lockfile

Dopo l'install:

- `api/package.json` deve contenere le nuove dipendenze
- `yarn.lock` (in root del monorepo o dove lo tenete) deve aggiornarsi

Controlla che le dipendenze siano finite sotto `dependencies` (non `devDependencies`).

Esempio atteso (indicativo):

```json
{
  "dependencies": {
    "@nestjs/websockets": "...",
    "@nestjs/platform-socket.io": "...",
    "socket.io": "..."
  }
}
```

---

## 1.4 — Sanity check: build + avvio

Ora verifica che il backend sia ancora sano.

**Build:**

```bash
yarn build
```

**Avvio dev:**

```bash
yarn start:dev
```

**Risultato atteso:**

- Il server parte normalmente
- Nessun errore di import / TypeScript / Nest injection (in questo step non abbiamo ancora scritto codice, quindi devono essere 0 problemi nuovi)

Se qualcosa esplode qui, tipicamente è:

- Conflitto versione Nest
- Lockfile inconsistente
- Workspace install eseguita nel posto sbagliato (root vs package)

---

## 1.5 — "Micro test" (facoltativo ma consigliato per workshop)

Questo step è utile per ridurre "sorprese" nello step 2 (quando scriverete il Gateway).

Aggiungi temporaneamente (solo per verificare compilation) un import in un file qualsiasi del backend, tipo in `src/app.module.ts`:

```ts
import { WebSocketGateway } from "@nestjs/websockets";
```

Poi ricompila (`yarn build`). Se compila, significa che risoluzione moduli e types sono ok.

> Puoi anche rimuoverlo subito dopo: era solo un check.

---

## Output dello Step 1 (Definition of Done)

Lo step 1 è completato quando:

- [ ] `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` sono installati in `api/`
- [ ] `yarn build` in `api/` passa
- [ ] `yarn start:dev` parte senza errori
- [ ] `package.json` e lockfile sono aggiornati coerentemente
