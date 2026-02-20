# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` — Start Vite dev server with HMR
- `yarn build` — Type-check with `tsc -b` then build with Vite
- `yarn lint` — Run ESLint
- `yarn format` — Run Prettier on all files
- `yarn preview` — Preview the production build locally

No test runner is configured.

## Architecture

This is the frontend UI for an Italian card games platform (Scopone Scientifico, Tresette) built with React 19 + TypeScript + Vite.

**Stack:** React 19, Redux Toolkit + RTK Query (`src/store/`), MUI v7 (`src/theme/`), React Router v7, Emotion for styled components.

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

### Project Structure

```
src/
├── App.tsx                           # Root component with BrowserRouter routing
├── main.tsx                          # Entry point (StrictMode, Redux Provider, MUI ThemeProvider, CssBaseline)
├── index.css                         # Global styles
├── assets/cards/napoletane/          # 40 card JPG images + retro.jpg (card back)
├── components/
│   ├── AppHeader.tsx                 # Top navigation bar (logo link, user name/Guest, login/logout icon button)
│   ├── AppLayout.tsx                 # Layout wrapper (AppHeader + Outlet, full viewport flexbox column)
│   ├── AuthGuard.tsx                 # Protected route wrapper (checks auth, redirects to /login with return path)
│   └── AuthInitializer.tsx           # Null-render component: re-hydrates user from GET /users/profile on page refresh; dispatches logout() on 401
├── constants/
│   └── cardsData.ts                  # CARDS_IMAGES, CARDS_LABELS, ALL_CARDS, SUITS_ORDER
├── dtos/
│   ├── Auth.ts                       # ILoginRequest, IRegisterRequest, IAuthResponse
│   ├── Card.ts                       # ICard { id, value, color }, TCardColors
│   ├── Game.ts                       # IGameDetailsDto, IGameSummaryDto, IGameHandDto, IGameParticipant, IGameCreatedResponse, IGamePlayerDto, IGameStateDto, TGameStatus, TGameType
│   └── User.ts                       # IUser { id, email, name }
├── pages/
│   ├── Home/index.tsx                # Landing page with game selection buttons
│   ├── Login/index.tsx               # Tabbed login/register form with error handling and safe redirect
│   ├── NotFound/index.tsx            # 404 page
│   ├── ScoponeScientifico/index.tsx  # Game page: rules, create game (passes 'ScoponeScientifico'), join game dialog, navigate to /game/:id
│   ├── Tresette/index.tsx            # Game page: rules, create game (passes 'Tresette'), join game dialog, navigate to /game/:id
│   ├── GameRoom/
│   │   └── index.tsx                 # Game room page for /game/:id — WaitingRoom (polls until Ready) or Playroom with real dealt cards
│   └── Playroom/
│       ├── index.tsx                 # Game table wrapper; accepts cards?, tableCards?, isMyTurn?, onPlayCard?, capturedMine?, capturedPartner?, currentTurnSeat?, playerNames?
│       └── CardsField/
│           ├── index.tsx             # 4-player table layout: opponents' card backs, player hand (bottom), face-up table cards with enter/leave animations, TurnLabel, captured counters, CenterPlayOverlay; active player name highlighted green
│           └── PlayerCard/
│               └── index.tsx         # Individual card with click-to-play CSS transition animation; disabled when not player's turn
├── store/
│   ├── index.ts                      # configureStore; listenerMiddleware resets RTK Query cache (baseApi.util.resetApiState) on logout
│   ├── hooks.ts                      # useAppDispatch, useAppSelector typed hooks
│   ├── api/
│   │   ├── baseApi.ts                # RTK Query base API (baseUrl: localhost:3000, Bearer token injection, tag types)
│   │   ├── authApi.ts                # login, register mutations (auto-dispatch setCredentials)
│   │   ├── usersApi.ts               # getProfile query (tag: UserProfile)
│   │   └── gamesApi.ts              # createGame, listGames, getGame, getGamePlayers, joinGame, getGameHand, deleteGame
│   └── slices/
│       └── authSlice.ts              # Auth state: user, token, initialized; persists token in localStorage. Selectors: selectCurrentUser, selectToken, selectIsAuthenticated, selectAuthInitialized
├── theme/
│   └── index.ts                      # MUI theme (light mode, primary #1976d2, secondary #9c27b0)
└── utils/
    └── tokenStorage.ts               # getStoredToken, setStoredToken, removeStoredToken (localStorage)
```

### Routing & Layout

Defined in `src/App.tsx`. All routes are wrapped in `<AppLayout />` which renders a persistent `AppHeader` navigation bar above every page via `<Outlet />`.

**Public routes:** `/` (Home), `/login` (Login).

**Protected routes (via AuthGuard):** `/giochi/scopone-scientifico` (ScoponeScientifico page), `/giochi/tresette` (Tresette page), `/dev` (Playroom dev view with random cards), `/game/:id` (GameRoom — waiting room or live playroom).

**Catch-all:** `*` (NotFound).

### App Header

`components/AppHeader.tsx`: Persistent top bar (`AppBar` with dark `#333` background). Left: "Card Games" logo link to `/`. Center: current user name or "Guest". Right: `AccountCircle` icon button — logs out and redirects to `/` if authenticated, navigates to `/login` otherwise. Uses `Row` styled component from `CardsField`.

### Authentication

**Login page** (`pages/Login/index.tsx`): Tabbed interface with login and register forms. Uses `useLoginMutation()` and `useRegisterMutation()`. Extracts error messages from RTK Query errors. After successful auth, redirects to the original requested path (with `isSafeInternalPath` check to prevent open redirects).

**AuthGuard** (`components/AuthGuard.tsx`): Wraps protected routes. Checks `selectIsAuthenticated` and `selectAuthInitialized` selectors. Shows loading state while auth initializes. Redirects unauthenticated users to `/login` with the current location in state for post-login navigation.

**Auth Slice** (`store/slices/authSlice.ts`): State: `user` (IUser | null), `token` (string | null), `initialized` (boolean). Actions: `setCredentials`, `setToken`, `logout`, `setAuthInitialized`. Both `setCredentials` and `logout` persist/clear token in localStorage. Selectors: `selectCurrentUser`, `selectToken`, `selectIsAuthenticated`, `selectAuthInitialized`. Loads token from localStorage on init.

**Auth Initializer** (`components/AuthInitializer.tsx`): Null-render component mounted at the root (inside `BrowserRouter`, outside the route tree). When a stored token exists but `currentUser` is null (e.g., after page refresh), it calls `useGetProfileQuery` and dispatches `setCredentials` to re-hydrate the user. Guards the dispatch with `currentUser === null` to prevent overwriting a user set by the login mutation. Dispatches `logout()` if the profile fetch returns an error (expired/invalid token). The store's `listenerMiddleware` clears the entire RTK Query cache (`baseApi.util.resetApiState()`) on every `logout` dispatch, preventing stale profile data from leaking across user sessions.

### State Management (Redux Toolkit + RTK Query)

**Base API** (`store/api/baseApi.ts`): Base URL `http://localhost:3000`. Prepares headers with Bearer token from localStorage. Tag types: `Games`, `GameHand`, `UserProfile`.

**Auth API** (`store/api/authApi.ts`):
- `useLoginMutation()` — POST /auth/login → `IAuthResponse`; auto-dispatches `setCredentials`
- `useRegisterMutation()` — POST /auth/register → `IAuthResponse`; auto-dispatches `setCredentials`

**Users API** (`store/api/usersApi.ts`):
- `useGetProfileQuery()` — GET /users/profile → `IUser`; tag: `UserProfile`

**Games API** (`store/api/gamesApi.ts`):
- `useCreateGameMutation()` — POST /games with `{ gameType: TGameType }` body → `IGameCreatedResponse`; invalidates `Games`
- `useListGamesQuery()` — GET /games → `IGameSummaryDto[]`; provides per-item + LIST tags
- `useGetGameQuery(gameId)` — GET /games/{id} → `IGameSummaryDto`; tag: `Games` by gameId; used with `pollingInterval` in `GameRoom`
- `useGetGamePlayersQuery(gameId)` — GET /games/{id}/players → `IGamePlayerDto[]`; fetched when game is `Ready` to populate seat name labels
- `useJoinGameMutation(gameId)` — GET /games/{id}/join → `IGameDetailsDto`; invalidates `Games`, `GameHand`
- `useGetGameHandQuery(gameId)` — GET /games/{id}/hand → `IGameHandDto`; tag: `GameHand` by gameId
- `useGetGameStateQuery(gameId)` — GET /games/{id}/state → `IGameStateDto`; polled at 800ms when game is `Ready`; tag: `${gameId}-state`
- `usePlayCardMutation()` — POST /games/{id}/play with `{ cardId: number }` body; invalidates `${gameId}-state` and `GameHand` by gameId
- `useDeleteGameMutation(gameId)` — DELETE /games/{id}; invalidates `Games`

### Card System

Uses a 40-card Napoletane deck. Card data types in `src/dtos/Card.ts` (`ICard` interface with id/value/color, `TCardColors` type). Static card data (image imports, labels, full deck array) in `src/constants/cardsData.ts`. Card images in `src/assets/cards/napoletane/`. Cards identified by numeric id (1-40), grouped in suits of 10: denari (diamonds 1-10), coppe (hearts 11-20), spade (spades 21-30), bastoni (clubs 31-40).

### Playroom Layout

`src/pages/Playroom/` contains the game table UI. `CardsField` renders a 4-player table layout using Emotion styled components with flexbox. Top/left/right opponents show card backs; bottom shows the current player's hand sorted by suit (via `SUITS_ORDER`) then value. `PlayerCard` handles card display with click-to-play CSS transition animation (translateY + scale over 280ms) and is disabled when it is not the player's turn. The central field shows:
- **TurnLabel**: "Tocca a te" (green) or "Aspetta il tuo turno" (neutral)
- **CountersRow**: captured card counts for the current player and their partner
- **TableCardsWrapper**: face-up table cards with enter/leave CSS animations (scale + opacity, 280ms) driven by `leavingIds`/`enteringIds` sets managed via `useRef` comparing previous vs. new card ID arrays
- **CenterPlayOverlay**: briefly shows the played card animating into the center (`popIn` keyframe, 320ms) immediately after the player clicks a card
- **NameLabel** per seat: name badge that glows green when that seat's player is currently taking their turn (`$active` transient prop)

The `Playroom` component accepts all game props as optional: `cards?`, `tableCards?`, `isMyTurn?`, `onPlayCard?`, `capturedMine?`, `capturedPartner?`, `currentTurnSeat?`, `playerNames?`. The `/dev` route renders `<Playroom />` with no props; all values fall back to empty defaults.

### GameRoom Page

`src/pages/GameRoom/index.tsx` handles the `/game/:id` route. It uses two polling intervals managed via `useState` + `useEffect` watching `game?.status`:
- **`pollingInterval`** (for `useGetGameQuery`): 3000ms when `Created`, 0 otherwise
- **`statePollingInterval`** (for `useGetGameStateQuery`): 800ms when `Ready`, 0 otherwise

When the game transitions to `Ready`, `useGetGameHandQuery`, `useGetGamePlayersQuery`, and `useGetGameStateQuery` all fire automatically (their `skip` conditions become false). `usePlayCardMutation` is used to submit card plays.

Computed memos:
- **`myIndex`**: current user's position in the players array
- **`playerNames`**: seat map (bottom = current user, right = +1, top = +2, left = +3 by join order)
- **`isMyTurn`**: true when `gameState.currentPlayerIndex` points to the current user
- **`currentTurnSeat`**: relative seat of the current-turn player from the current user's perspective
- **`tableCards`**: maps `gameState.tableCardIds` to `ICard[]`
- **`capturedCounts`**: `mine` = current user's captured card count; `partner` = player at `myIndex + 2`'s count

`handlePlay(cardId)` calls `playCard({ gameId, cardId }).unwrap()` (no-op on error; polling re-aligns state). All computed values are forwarded to `<Playroom>`. The inline `WaitingRoom` sub-component shows a progress spinner, a row of seat indicators (filled green for joined players), and the current player count.

### Page Components

Organized as `src/pages/<PageName>/index.tsx` with named exports.

## Code Style

- Prettier: single quotes, semicolons, 160 char print width, trailing commas (es5), LF line endings, 2-space tabs
- ESLint: flat config with React + TypeScript + Prettier + import plugin (enforces `import/no-unresolved`)
- Components use named exports (not default exports)
- TypeScript strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- UI text is in Italian
- Always use explicit `public` keyword on public methods
- Avoid `any` — create dedicated types/interfaces instead
- Always declare explicit return types on methods
- Favor clarity and readability over brevity
