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

**Stack:** NestJS v11, TypeScript 5.7, Fastify, PostgreSQL (TypeORM), JWT auth (Passport), Jest.

**Struttura:** Moduli NestJS con dependency injection. Entry point in `api/src/main.ts` (FastifyAdapter), ascolta su `0.0.0.0:3000`. CORS abilitato per `localhost:5173`. Global `ValidationPipe` (`transform: true`, `whitelist: true`), `ClassSerializerInterceptor`, e `JwtAuthGuard` (tutte le rotte protette tranne `@Public()`).

```
api/src/
├── main.ts                        # Entry point (Fastify, CORS, ValidationPipe, ClassSerializerInterceptor)
├── app.module.ts                  # Root module (ConfigModule, TypeOrmModule, AuthModule, UsersModule, GamesModule, global JwtAuthGuard)
├── app.controller.ts              # GET / → "Hello World!"
├── app.service.ts
├── config/
│   ├── config.types.ts            # ConfigType interface + Joi validation schema
│   ├── app.config.ts              # AppConfig (messagePrefix da APP_MESSAGE_PREFIX)
│   ├── auth.config.ts             # AuthConfig (jwt.secret, jwt.expiresIn)
│   ├── database.config.ts         # TypeORM PostgreSQL config (autoLoadEntities: true)
│   └── typed-config.service.ts    # Typed wrapper per ConfigService
├── auth/
│   ├── auth.module.ts             # Importa PassportModule, UsersModule; configura JwtModule
│   ├── auth.controller.ts         # POST /auth/register (@Public), POST /auth/login (@Public)
│   ├── auth.service.ts            # Register + Login: check email, hash bcrypt(10), sign JWT {sub, email}
│   ├── jwt.strategy.ts            # PassportStrategy: Bearer token extraction, payload validation
│   ├── jwt-auth.guard.ts          # Global guard: salta rotte @Public(), enforce JWT altrimenti
│   ├── public.decorator.ts        # @Public() decorator (setta metadata 'isPublic')
│   ├── current-user.decorator.ts  # @CurrentUser() param decorator (estrae AuthUser dalla request)
│   ├── auth-user.interface.ts     # AuthUser { sub: string, email: string }
│   ├── auth.request.ts            # AuthRequest extends Request con user: AuthUser
│   └── login.dto.ts               # LoginDto: email, password
├── users/
│   ├── users.module.ts            # Registra User entity, esporta UsersService
│   ├── users.controller.ts        # GET /users/profile (protetto, ritorna utente corrente)
│   ├── users.service.ts           # findOneByEmail, findOneById, createUser, verifyPassword
│   ├── user.entity.ts             # Entity: id(UUID), email(unique), name, passwordHash(@Exclude), createdAt, updatedAt
│   └── create-user.dto.ts         # Validazione: email, name, password (min 6, uppercase, digit, special char)
└── games/
    ├── games.module.ts            # Importa Game entity + UsersModule
    ├── games.controller.ts        # POST /games (crea), GET /games/:id/join, DELETE /games/:id (solo creator, 204)
    ├── games.service.ts           # createGame, joinGame (max 4 giocatori), deleteGame (solo creator)
    └── game.entity.ts             # Entity: id(UUID), createdBy(ManyToOne→User), players(ManyToMany→User via game_players), createdAt, updatedAt
```

**Configurazione:** Env vars validate con Joi in `config/config.types.ts`. Variabili richieste: `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNC`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Opzionali con default: `DB_HOST` (localhost), `DB_PORT` (5432), `APP_MESSAGE_PREFIX`. Vedi `api/docker-compose.yaml` per PostgreSQL 16 locale.

**Auth flow:** Registrazione (`POST /auth/register`) e login (`POST /auth/login`), entrambe `@Public()`. Hash bcrypt (10 rounds), JWT firmato con `{ sub: user.id, email }`. Tutte le altre rotte protette dal global `JwtAuthGuard` via Passport JWT strategy. `@CurrentUser()` decorator estrae l'utente autenticato. User entity usa `@Exclude()`/`@Expose()` con `ClassSerializerInterceptor` per nascondere `passwordHash`.

**Database:** PostgreSQL 16 via Docker. TypeORM con `autoLoadEntities: true`, `synchronize` controllato da `DB_SYNC` env var. Tabelle: `users`, `games`, `game_players` (junction ManyToMany).

**Games:** Ogni partita ha un creatore (`createdBy`) e fino a 4 giocatori (ManyToMany). Solo il creatore può cancellare (`ForbiddenException`). I giocatori si uniscono via `GET /games/:id/join`.

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
- Always use explicit `public` keyword on public methods
- Avoid `any` — create dedicated types/interfaces instead
- Always declare explicit return types on methods
- Favor clarity and readability over brevity — prefer verbose, self-explanatory code over compact but hard-to-follow logic
