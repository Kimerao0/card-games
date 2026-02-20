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
├── cards/
│   ├── all-cards.const.ts         # ALL_CARDS: mazzo Napoletane da 40 carte (denari 1-10, coppe 11-20, spade 21-30, bastoni 31-40)
│   ├── card.types.ts              # TCardColors ('spades'|'hearts'|'diamonds'|'clubs'), ICard { id, value, color }
│   └── shuffle.util.ts            # shuffle<T>(items): Fisher-Yates shuffle, ritorna nuovo array
└── games/
    ├── games.module.ts            # Importa Game + GameParticipant entities, UsersModule
    ├── games.controller.ts        # POST /games (body: CreateGameDto), GET /games, GET /games/:id, GET /games/:id/join, GET /games/:id/hand, DELETE /games/:id (solo creator, 204)
    ├── games.service.ts           # createGame, listGames, getGame, joinGame (max 4, auto-distribuzione al 4°), getHand, deleteGame
    ├── game.entity.ts             # Entity: id(UUID), createdBy(ManyToOne→User), status(GameStatus), gameType(GameType), gamePlayers(OneToMany→GameParticipant), createdAt, updatedAt
    ├── game-player.entity.ts      # GameParticipant entity: PK composita(gameId+userId), handCardIds(int[] nullable), ManyToOne→Game/User
    ├── game-status.enum.ts        # GameStatus: Created → Ready → Progress → Scoring → Completed
    ├── game-type.enum.ts          # GameType: ScoponeScientifico | Tresette
    └── dtos/
        ├── create-game.dto.ts     # CreateGameDto: gameType (@IsEnum(GameType))
        ├── game-details.dto.ts    # GameDetailsDto: id, status, gameType, createdAt, updatedAt, createdByUserId, playersCount, maxPlayers
        ├── game-summary.dto.ts    # GameSummaryDto: id, status, gameType, createdAt, updatedAt, createdByUserId, playersCount, maxPlayers, isUserInGame
        └── game-hand.dto.ts       # GameHandDto: gameId, userId, handCardIds (10 card IDs)
```

**Configurazione:** Env vars validate con Joi in `config/config.types.ts`. Variabili richieste: `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNC`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Opzionali con default: `DB_HOST` (localhost), `DB_PORT` (5432), `APP_MESSAGE_PREFIX`. Vedi `api/docker-compose.yaml` per PostgreSQL 16 locale.

**Auth flow:** Registrazione (`POST /auth/register`) e login (`POST /auth/login`), entrambe `@Public()`. Hash bcrypt (10 rounds), JWT firmato con `{ sub: user.id, email }`. Tutte le altre rotte protette dal global `JwtAuthGuard` via Passport JWT strategy. `@CurrentUser()` decorator estrae l'utente autenticato. User entity usa `@Exclude()`/`@Expose()` con `ClassSerializerInterceptor` per nascondere `passwordHash`.

**Database:** PostgreSQL 16 via Docker. TypeORM con `autoLoadEntities: true`, `synchronize` controllato da `DB_SYNC` env var. Tabelle: `users`, `games`, `game_participants` (entity esplicita con `handCardIds`).

**Cards:** Mazzo Napoletane da 40 carte definito in `cards/all-cards.const.ts`. Ogni carta ha id numerico (1-40), valore (1-10) e colore (seme). Fisher-Yates shuffle in `cards/shuffle.util.ts`.

**Games:** Ogni partita ha un creatore (`createdBy`), un tipo (`gameType`: `ScoponeScientifico` | `Tresette`), un ciclo di vita `GameStatus` (`Created` → `Ready` → `Progress` → `Scoring` → `Completed`), e fino a 4 giocatori tracciati via entity `GameParticipant`. Il tipo viene passato alla creazione tramite `CreateGameDto` nel body di `POST /games`. Solo il creatore può cancellare (`ForbiddenException`). I giocatori si uniscono via `GET /games/:id/join`; quando il 4° giocatore entra, il mazzo viene mescolato e 10 carte distribuite a ciascun giocatore (salvate come `handCardIds` in `game_participants`). Il join usa pessimistic write lock per sicurezza in concorrenza. `GET /games/:id/hand` ritorna le carte distribuite al giocatore. `GET /games` elenca tutte le partite con conteggio giocatori e info di appartenenza. `GET /games/:id` ritorna il `GameSummaryDto` di una singola partita (include `status` e `isUserInGame`) — usato dal frontend per il polling nella waiting room.

**TypeScript:** target ES2023, module `nodenext`, decorator support abilitato (`experimentalDecorators`, `emitDecoratorMetadata`). `strictNullChecks: true` ma `noImplicitAny: false`.

**Test:** Jest con `ts-jest`. Unit test in `src/**/*.spec.ts`, E2E test in `test/` con supertest.

### Frontend — `ui/`

Frontend React 19 + TypeScript + Vite.

**Stack:** React 19, Redux Toolkit (`ui/src/store/`), MUI v7 (`ui/src/theme/`), React Router v7, Emotion for styled components.

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

**Card system:** Uses a 40-card Napoletane deck. Card data types in `ui/src/dtos/Card.ts` (`ICard` interface with id/value/color, `TCardColors` type). Static card data (image imports, labels, full deck array) in `ui/src/constants/cardsData.ts`. Card images in `ui/src/assets/cards/napoletane/`. Cards identified by numeric id (1-40), grouped in suits of 10: denari (diamonds 1-10), coppe (hearts 11-20), spade (spades 21-30), bastoni (clubs 31-40).

**Routing & Layout:** Defined in `ui/src/App.tsx`. All routes wrapped in `<AppLayout />` (persistent `AppHeader` nav bar + `<Outlet />`). Routes: `/` (Home), `/login` (Login), `/giochi/scopone-scientifico` (protected), `/giochi/tresette` (protected), `/dev` (Playroom dev view with random cards, protected), `/game/:id` (GameRoom — waiting room or live playroom, protected), `*` (NotFound). Protected routes wrapped in `<AuthGuard />`.

**App Header:** `ui/src/components/AppHeader.tsx` — persistent top bar (dark `#333` background). Shows "Card Games" logo link, current user name (or "Guest"), and login/logout icon button.

**App Layout:** `ui/src/components/AppLayout.tsx` — full viewport flexbox wrapper combining `AppHeader` with `<Outlet />` for nested route content.

**Playroom layout:** `ui/src/pages/Playroom/` contains the game table UI. `CardsField` renders a 4-player table (top/left/right opponents show card backs, bottom shows current player's hand sorted by suit then value). `PlayerCard` handles card display with click-to-play CSS transition animation. Accepts optional `cards?: ICard[]` prop — falls back to random cards when not provided (used by `/dev`).

**GameRoom page:** `ui/src/pages/GameRoom/index.tsx` handles `/game/:id`. Polls `GET /games/:id` every 3 seconds while status is `Created` (WaitingRoom with seat indicators), then switches to Playroom with the player's real dealt cards once status is `Ready`.

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
