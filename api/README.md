# Card Games API

Backend per la piattaforma di giochi di carte italiani (Scopone Scientifico, Tresette).

## Stack

- **NestJS v11** con Express
- **TypeScript 5.7** (ES2023, module nodenext)
- **PostgreSQL 16** con TypeORM
- **JWT** per autenticazione (bcrypt per hashing password)
- **Jest** per testing

## Setup

### Prerequisiti

- Node.js 20+
- Yarn
- Docker (per PostgreSQL)

### Database

Avvia PostgreSQL con Docker Compose:

```bash
docker compose up -d
```

Questo crea un container PostgreSQL con:
- **User:** postgres
- **Password:** postgres
- **Database:** cardgames
- **Porta:** 5432

### Variabili d'ambiente

Crea un file `.env` nella cartella `api/`:

```env
APP_MESSAGE_PREFIX=Config Missing
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=cardgames
DB_SYNC=1
JWT_SECRET=DEV_SECRET_CHANGE_ME
JWT_EXPIRES_IN=1h
```

> **Nota:** `DB_SYNC=1` abilita la sincronizzazione automatica dello schema. Non usare in produzione.

### Installazione e avvio

```bash
yarn install
yarn start:dev
```

Il server parte sulla porta 3000.

## Struttura del progetto

```
src/
├── main.ts                        # Entry point (porta 3000, CORS, ValidationPipe)
├── app.module.ts                  # Root module
├── app.controller.ts              # GET / → "Hello World!"
├── app.service.ts
├── config/
│   ├── config.types.ts            # ConfigType interface + schema di validazione Joi
│   ├── app.config.ts              # Configurazione applicazione
│   ├── auth.config.ts             # Configurazione JWT
│   ├── database.config.ts         # Configurazione TypeORM/PostgreSQL
│   └── typed-config.service.ts    # Wrapper tipizzato per ConfigService
├── auth/
│   ├── auth.module.ts             # Modulo autenticazione (JwtModule)
│   ├── auth.controller.ts         # POST /auth/register
│   └── auth.service.ts            # Logica registrazione e firma JWT
└── users/
    ├── users.module.ts            # Modulo utenti
    ├── users.service.ts           # CRUD utenti
    ├── user.entity.ts             # Entity TypeORM
    └── create-user.dto.ts         # DTO con validazione
```

## API Endpoints

### `GET /`

Health check. Ritorna `"Hello World!"`.

### `POST /auth/register`

Registra un nuovo utente e ritorna un JWT token.

**Request body:**

```json
{
  "email": "mario@example.com",
  "name": "Mario Rossi",
  "password": "Password1!"
}
```

**Validazione password:**
- Minimo 6 caratteri
- Almeno 1 lettera maiuscola
- Almeno 1 numero
- Almeno 1 carattere speciale

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**JWT payload:** `{ sub: <user-id>, email: <user-email> }`

**Errori:**
- `400` — Validazione fallita
- `409` — Email gia in uso

## Database

### Entity `User`

| Colonna        | Tipo         | Note                      |
|----------------|--------------|---------------------------|
| `id`           | UUID         | Primary key, auto-generato |
| `email`        | varchar(255) | Unico, indicizzato         |
| `name`         | varchar(100) |                           |
| `passwordHash` | varchar(255) | Bcrypt, 10 salt rounds     |
| `createdAt`    | timestamp    | Auto-impostato             |
| `updatedAt`    | timestamp    | Auto-impostato             |

## Comandi

```bash
yarn start:dev       # Dev server con watch mode
yarn build           # Compila in dist/
yarn start:prod      # Avvia build compilato
yarn lint            # ESLint con auto-fix
yarn format          # Prettier
yarn test            # Unit test
yarn test:watch      # Test in watch mode
yarn test:cov        # Test con coverage
yarn test:e2e        # Test end-to-end
```

## Configurazione

Le variabili d'ambiente sono validate all'avvio tramite Joi (`config/config.types.ts`):

| Variabile            | Obbligatoria | Default          | Descrizione                              |
|----------------------|--------------|------------------|------------------------------------------|
| `APP_MESSAGE_PREFIX` | No           | `Config Missing` | Prefisso messaggi applicazione           |
| `DB_HOST`            | No           | `localhost`      | Host PostgreSQL                          |
| `DB_PORT`            | No           | `5432`           | Porta PostgreSQL                         |
| `DB_USER`            | Si           |                  | Username PostgreSQL                      |
| `DB_PASSWORD`        | Si           |                  | Password PostgreSQL                      |
| `DB_DATABASE`        | Si           |                  | Nome database                            |
| `DB_SYNC`            | Si           |                  | `1` per sync schema, `0` per disabilitare |
| `JWT_SECRET`         | Si           |                  | Secret per firma JWT                     |
| `JWT_EXPIRES_IN`     | Si           |                  | Durata token (es. `1h`, `30m`)           |
