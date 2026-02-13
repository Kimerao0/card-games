# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (`ui/`)

- `yarn dev` — Start Vite dev server with HMR
- `yarn build` — Type-check con `tsc -b` poi build con Vite
- `yarn lint` — Run ESLint
- `yarn format` — Run Prettier

### Backend (`api/`)

- `yarn start:dev` — Start NestJS in watch mode (porta default: 3000)
- `yarn build` — Compila in `dist/`
- `yarn start:prod` — Avvia il build compilato (`node dist/main`)
- `yarn lint` — Run ESLint con auto-fix
- `yarn format` — Run Prettier
- `yarn test` — Unit test (Jest, file `*.spec.ts` in `src/`)
- `yarn test:watch` — Test in watch mode
- `yarn test:cov` — Test con coverage report
- `yarn test:e2e` — Test end-to-end (config in `test/jest-e2e.json`)

## Architecture

Piattaforma per giochi di carte italiani (Scopone Scientifico, Tresette). Monorepo con due package: `ui/` (frontend) e `api/` (backend).

### Backend — `api/`

**Stack:** NestJS v11, TypeScript 5.7, Express, PostgreSQL (TypeORM), JWT auth, Jest.

**Struttura:** Moduli NestJS con dependency injection. Entry point in `api/src/main.ts`, ascolta su porta 3000. CORS abilitato per `localhost:5173`. Global `ValidationPipe` con `transform: true` e `whitelist: true`.

```
api/src/
├── main.ts                        # Entry point (porta 3000, CORS, ValidationPipe)
├── app.module.ts                  # Root module (ConfigModule, TypeOrmModule, AuthModule, UsersModule)
├── app.controller.ts              # GET / → "Hello World!"
├── app.service.ts
├── config/
│   ├── config.types.ts            # ConfigType interface + Joi validation schema
│   ├── app.config.ts              # AppConfig (messagePrefix da APP_MESSAGE_PREFIX)
│   ├── auth.config.ts             # AuthConfig (jwt.secret, jwt.expiresIn)
│   ├── database.config.ts         # TypeORM PostgreSQL config
│   └── typed-config.service.ts    # Typed wrapper per ConfigService
├── auth/
│   ├── auth.module.ts             # Importa UsersModule, configura JwtModule
│   ├── auth.controller.ts         # POST /auth/register
│   └── auth.service.ts            # Registration flow: check email, hash password, sign JWT
└── users/
    ├── users.module.ts            # Registra User entity
    ├── users.service.ts           # CRUD utenti (findOneByEmail, createUser, verifyPassword)
    ├── user.entity.ts             # Entity: id(UUID), email, name, passwordHash, createdAt, updatedAt
    └── create-user.dto.ts         # Validazione: email, name, password (min 6, uppercase, digit, special char)
```

**Configurazione:** Env vars validate con Joi in `config/config.types.ts`. Variabili richieste: `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNC`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Vedi `api/docker-compose.yaml` per PostgreSQL locale.

**Auth flow:** Solo registrazione (`POST /auth/register`). Controlla unicità email, hash bcrypt (10 rounds), firma JWT con payload `{ sub: user.id, email: user.email }`. Passport e JWT strategy installati ma non ancora configurati (nessun guard per rotte protette).

**Database:** PostgreSQL 16 via Docker. TypeORM con `autoLoadEntities: true`, `synchronize` controllato da `DB_SYNC` env var.

**TypeScript:** target ES2023, module `nodenext`, decorator support abilitato (`experimentalDecorators`, `emitDecoratorMetadata`). `strictNullChecks: true` ma `noImplicitAny: false`.

**Test:** Jest con `ts-jest`. Unit test in `src/**/*.spec.ts`, E2E test in `test/` con supertest.

### Frontend — `ui/`

Frontend React 19 + TypeScript + Vite.

**Stack:** React 19, Redux Toolkit (`ui/src/store/`), MUI v7 (`ui/src/theme/`), React Router v7, Emotion for styled components.

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

**Card system:** Uses a 40-card Napoletane deck. Card data types in `ui/src/dtos/Card.ts` (`ICard` interface with id/value/color, `TCardColors` type). Static card data (image imports, labels, full deck array) in `ui/src/constants/cardsData.ts`. Card images in `ui/src/assets/cards/napoletane/`. Cards identified by numeric id (1-40), grouped in suits of 10: denari (diamonds 1-10), coppe (hearts 11-20), spade (spades 21-30), bastoni (clubs 31-40).

**Routing:** Defined in `ui/src/App.tsx`. Routes: `/` (Home), `/giochi/scopone-scientifico`, `/giochi/tresette`, `/dev` (Playroom dev view), `*` (NotFound).

**Playroom layout:** `ui/src/pages/Playroom/` contains the game table UI. `CardsField` renders a 4-player table (top/left/right opponents show card backs, bottom shows current player's hand sorted by suit then value). `PlayerCard` handles card display with click-to-play CSS transition animation.

**Page components** are organized as `ui/src/pages/<PageName>/index.tsx`.

## Code Style

- UI text is in Italian
- Components use named exports (not default exports)
- TypeScript strict mode in entrambi i package
- **ui Prettier:** single quotes, semicolons, 160 char print width, trailing commas (es5), LF line endings
- **api Prettier:** single quotes, trailing commas (all) — usa i default per il resto
