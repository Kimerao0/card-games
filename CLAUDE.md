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
    ├── games.module.ts            # Importa Game + GameParticipant entities, UsersModule; provider: GamesService, ScoponeRulesService, GameDealingService
    ├── games.controller.ts        # POST /games, GET /games, GET /games/:id, GET /games/:id/players, GET /games/:id/join, GET /games/:id/hand, POST /games/:id/play, GET /games/:id/state, DELETE /games/:id (solo creator, 204)
    ├── games.service.ts           # Solo orchestrazione: delega regole a ScoponeRulesService, distribuzione a GameDealingService
    ├── scopone-rules.service.ts   # Regole pure Scopone (no DB): getCardValue, getCardColor, findScoponeCapture, calculateScoponeScore, handleGameEnd
    ├── game-dealing.service.ts    # Logica di distribuzione pura (no DB): dealForGameType, initCapturedByUser, initScopasByUser, pickRandomStartingIndex
    ├── game.entity.ts             # Entity: id(UUID), createdBy(ManyToOne→User), status(GameStatus), gameType(GameType), gamePlayers(OneToMany→GameParticipant), startingPlayerIndex(int|null), currentPlayerIndex(int|null), trickCardIds(int[]|null), trickPlayerIds(uuid[]|null), tableCardIds(int[]|null), capturedCardIdsByUser(jsonb|null), scopasByUser(jsonb|null), lastCaptureUserId(uuid|null), scoreResult(jsonb|null), createdAt, updatedAt
    ├── game-player.entity.ts      # GameParticipant entity: PK composita(gameId+userId), handCardIds(int[] nullable), ManyToOne→Game/User
    ├── game-status.enum.ts        # GameStatus: Created → Ready → Progress → Scoring → Completed
    ├── game-type.enum.ts          # GameType: ScoponeScientifico | Tresette
    └── dtos/
        ├── create-game.dto.ts     # CreateGameDto: gameType (@IsEnum(GameType))
        ├── game-details.dto.ts    # GameDetailsDto: id, status, gameType, createdAt, updatedAt, createdByUserId, playersCount, maxPlayers
        ├── game-summary.dto.ts    # GameSummaryDto: id, status, gameType, createdAt, updatedAt, createdByUserId, playersCount, maxPlayers, isUserInGame
        ├── game-player.dto.ts     # GamePlayerDto: userId, name — returned by GET /games/:id/players
        ├── game-hand.dto.ts       # GameHandDto: gameId, userId, handCardIds (card IDs)
        ├── play-card.dto.ts       # PlayCardDto: cardId (@IsInt, @Min(1)) — body di POST /games/:id/play
        └── game-state.dto.ts      # GameStateDto: id, status, gameType, startingPlayerIndex, currentPlayerIndex, tableCardIds, trickCardIds, trickPlayerIds, capturedCardIdsByUser
```

**Configurazione:** Env vars validate con Joi in `config/config.types.ts`. Variabili richieste: `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNC`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Opzionali con default: `DB_HOST` (localhost), `DB_PORT` (5432), `APP_MESSAGE_PREFIX`. Vedi `api/docker-compose.yaml` per PostgreSQL 16 locale.

**Auth flow:** Registrazione (`POST /auth/register`) e login (`POST /auth/login`), entrambe `@Public()`. Hash bcrypt (10 rounds), JWT firmato con `{ sub: user.id, email }`. Tutte le altre rotte protette dal global `JwtAuthGuard` via Passport JWT strategy. `@CurrentUser()` decorator estrae l'utente autenticato. User entity usa `@Exclude()`/`@Expose()` con `ClassSerializerInterceptor` per nascondere `passwordHash`.

**Database:** PostgreSQL 16 via Docker. TypeORM con `autoLoadEntities: true`, `synchronize` controllato da `DB_SYNC` env var. Tabelle: `users`, `games`, `game_participants` (entity esplicita con `handCardIds`).

**Cards:** Mazzo Napoletane da 40 carte definito in `cards/all-cards.const.ts`. Ogni carta ha id numerico (1-40), valore (1-10) e colore (seme). Fisher-Yates shuffle in `cards/shuffle.util.ts`.

**Games:** Ogni partita ha un creatore (`createdBy`), un tipo (`gameType`: `ScoponeScientifico` | `Tresette`), un ciclo di vita `GameStatus` (`Created` → `Ready` → `Progress` → `Scoring` → `Completed`), e fino a 4 giocatori tracciati via entity `GameParticipant`. Il tipo viene passato alla creazione tramite `CreateGameDto` nel body di `POST /games`. Solo il creatore può cancellare (`ForbiddenException`). I giocatori si uniscono via `GET /games/:id/join`; quando il 4° giocatore entra, `dealForGameType` distribuisce le carte: sia per Scopone Scientifico che per Tresette: 10 carte a giocatore + 0 sul tavolo. Le carte sono salvate come `handCardIds` in `game_participants`. Il join usa pessimistic write lock per sicurezza in concorrenza. Al deal viene scelto casualmente uno `startingPlayerIndex` (= `currentPlayerIndex`); `capturedCardIdsByUser` viene inizializzato a `{}` per ciascun partecipante. `GET /games/:id/hand` ritorna le carte distribuite al giocatore. `GET /games` elenca tutte le partite con conteggio giocatori e info di appartenenza. `GET /games/:id` ritorna il `GameSummaryDto` di una singola partita (include `status` e `isUserInGame`). `GET /games/:id/players` ritorna `GamePlayerDto[]` ordinati per join time. `POST /games/:id/play` (body `PlayCardDto { cardId }`) gioca una carta: verifica che sia il turno del giocatore, rimuove la carta dalla mano, applica la logica di cattura di Scopone (`findScoponeCapture`: prima match esatto di valore, poi combinazioni multi-carta con minimo numero di carte; le carte catturate vanno in `capturedCardIdsByUser`; la carta giocata senza cattura va in `tableCardIds`), avanza `currentPlayerIndex` round-robin. `GET /games/:id/state` ritorna il `GameStateDto` live (solo per partecipanti) — usato dal frontend con polling a 800ms.

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

**Playroom layout:** `ui/src/pages/Playroom/` contains the game table UI. `CardsField` renders a 4-player table (top/left/right opponents show card backs, bottom shows current player's hand sorted by suit then value). The central field shows a `TurnLabel`, captured card counters for self and partner, face-up table cards with enter/leave CSS animations, a `CenterPlayOverlay` that briefly shows the just-played card, and name labels per seat (highlighted green when active). `PlayerCard` handles card display with click-to-play CSS transition animation and is disabled when it's not the player's turn. `Playroom` accepts all props as optional: `cards?`, `tableCards?`, `isMyTurn?`, `onPlayCard?`, `capturedMine?`, `capturedPartner?`, `currentTurnSeat?`, `playerNames?` (falls back to empty defaults for `/dev`).

**GameRoom page:** `ui/src/pages/GameRoom/index.tsx` handles `/game/:id`. Two separate polling intervals (via `useState` + `useEffect`) drive `useGetGameQuery` (3000ms when `Created`) and `useGetGameStateQuery` (800ms when `Ready`). Once `Ready`, also fetches hand and players. Computes `isMyTurn`, `currentTurnSeat`, `tableCards`, and `capturedCounts`; submits card plays via `usePlayCardMutation`. Seat assignment is clockwise by join order (current user at bottom, then right → top → left).

**Auth persistence:** `ui/src/components/AuthInitializer.tsx` (mounted in `App.tsx`) re-hydrates the user from `GET /users/profile` on page refresh when a stored token exists but the Redux user is null. Dispatches `logout()` on 401. The store's `listenerMiddleware` resets the full RTK Query cache on logout to prevent stale profile data from leaking across user sessions.

**Page components** are organized as `ui/src/pages/<PageName>/index.tsx`.

## React Development Guidelines

### Component Organization

- **Entry point size:** `index.tsx` for a page or feature should stay ≤ 100 lines. Extract sub-components when it grows beyond that.
- **Page-exclusive components:** components used only within one page live in `pages/<PageName>/components/`. Do not import them from sibling pages.
- **Shared components:** components used across multiple pages live in `components/`. Generic layout primitives (`Row`, `Column`) belong in `components/layout/`.
- **No cross-page imports:** `components/` must never import from `pages/`. Run `grep -r "from.*pages/" ui/src/components/` to verify.

### Custom Hook Conventions

- Co-locate hooks with their primary consumer (e.g., `useGameRoomState.ts` lives in `pages/GameRoom/components/`).
- Name hooks `use<Feature>.ts` with no JSX in the file.
- Return a single typed object (named interface) rather than a positional tuple when returning more than two values.

### Single Responsibility

- One concern per file. A component should either manage state/logic or render UI — not both at scale.
- Inline sub-components that exceed ~20 lines of JSX should be extracted to a named component in the same `components/` subfolder.
- Inline styled components are fine; once a styled component is reused across files, move it to a shared location.

### Duplication Threshold

- When two or more pages share ~30%+ of their JSX or logic, extract a generic component that accepts a config/props object. See `GameLobbyPage` as the reference pattern.

### Emotion Styled Component Conventions

- Use `$` prefix for transient props (props that should not be forwarded to the DOM), e.g., `$active`, `$filled`, `$myTurn`.
- Generic layout primitives (`Row` and `Column` flex containers) are defined once in `components/layout/index.ts` and imported everywhere.

### State Management Boundaries

- **Local UI state** (`useState`): ephemeral UI state scoped to one component (open/close, animation flags, form fields).
- **Server state** (RTK Query): all remote data fetched from the API; keep polling logic inside custom hooks.
- **Global client state** (Redux slices): cross-component state that outlives a single page (auth, user identity).

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
