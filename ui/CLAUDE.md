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
│   └── AuthGuard.tsx                 # Protected route wrapper (checks auth, redirects to /login with return path)
├── constants/
│   └── cardsData.ts                  # CARDS_IMAGES, CARDS_LABELS, ALL_CARDS, SUITS_ORDER
├── dtos/
│   ├── Auth.ts                       # ILoginRequest, IRegisterRequest, IAuthResponse
│   ├── Card.ts                       # ICard { id, value, color }, TCardColors
│   ├── Game.ts                       # IGameDetailsDto, IGameSummaryDto, IGameHandDto, IGameParticipant, IGameCreatedResponse, TGameStatus
│   └── User.ts                       # IUser { id, email, name }
├── pages/
│   ├── Home/index.tsx                # Landing page with game selection buttons
│   ├── Login/index.tsx               # Tabbed login/register form with error handling and safe redirect
│   ├── NotFound/index.tsx            # 404 page
│   └── Playroom/
│       ├── index.tsx                 # Game table wrapper (green background, full viewport)
│       └── CardsField/
│           ├── index.tsx             # 4-player table layout (opponents show card backs, bottom shows player hand)
│           └── PlayerCard/
│               └── index.tsx         # Individual card with click-to-play CSS transition animation
├── store/
│   ├── index.ts                      # configureStore (baseApi reducer + middleware, authSlice reducer)
│   ├── hooks.ts                      # useAppDispatch, useAppSelector typed hooks
│   ├── api/
│   │   ├── baseApi.ts                # RTK Query base API (baseUrl: localhost:3000, Bearer token injection, tag types)
│   │   ├── authApi.ts                # login, register mutations (auto-dispatch setCredentials)
│   │   ├── usersApi.ts               # getProfile query (tag: UserProfile)
│   │   └── gamesApi.ts              # createGame, listGames, joinGame, getGameHand, deleteGame
│   └── slices/
│       └── authSlice.ts              # Auth state: user, token, initialized; persists token in localStorage
├── theme/
│   └── index.ts                      # MUI theme (light mode, primary #1976d2, secondary #9c27b0)
└── utils/
    └── tokenStorage.ts               # getStoredToken, setStoredToken, removeStoredToken (localStorage)
```

### Routing

Defined in `src/App.tsx`.

**Public routes:** `/` (Home), `/login` (Login).

**Protected routes (via AuthGuard):** `/giochi/scopone-scientifico` (placeholder), `/giochi/tresette` (placeholder), `/dev` (Playroom dev view).

**Catch-all:** `*` (NotFound).

### Authentication

**Login page** (`pages/Login/index.tsx`): Tabbed interface with login and register forms. Uses `useLoginMutation()` and `useRegisterMutation()`. Extracts error messages from RTK Query errors. After successful auth, redirects to the original requested path (with `isSafeInternalPath` check to prevent open redirects).

**AuthGuard** (`components/AuthGuard.tsx`): Wraps protected routes. Checks `selectIsAuthenticated` and `selectAuthInitialized` selectors. Shows loading state while auth initializes. Redirects unauthenticated users to `/login` with the current location in state for post-login navigation.

**Auth Slice** (`store/slices/authSlice.ts`): State: `user` (IUser | null), `token` (string | null), `initialized` (boolean). Actions: `setCredentials`, `setToken`, `logout`, `setAuthInitialized`. Both `setCredentials` and `logout` persist/clear token in localStorage. Selectors: `selectCurrentUser`, `selectIsAuthenticated`, `selectAuthInitialized`. Loads token from localStorage on init.

### State Management (Redux Toolkit + RTK Query)

**Base API** (`store/api/baseApi.ts`): Base URL `http://localhost:3000`. Prepares headers with Bearer token from localStorage. Tag types: `Games`, `GameHand`, `UserProfile`.

**Auth API** (`store/api/authApi.ts`):
- `useLoginMutation()` — POST /auth/login → `IAuthResponse`; auto-dispatches `setCredentials`
- `useRegisterMutation()` — POST /auth/register → `IAuthResponse`; auto-dispatches `setCredentials`

**Users API** (`store/api/usersApi.ts`):
- `useGetProfileQuery()` — GET /users/profile → `IUser`; tag: `UserProfile`

**Games API** (`store/api/gamesApi.ts`):
- `useCreateGameMutation()` — POST /games → `IGameCreatedResponse`; invalidates `Games`
- `useListGamesQuery()` — GET /games → `IGameSummaryDto[]`; provides per-item + LIST tags
- `useJoinGameMutation(gameId)` — GET /games/{id}/join → `IGameDetailsDto`; invalidates `Games`, `GameHand`
- `useGetGameHandQuery(gameId)` — GET /games/{id}/hand → `IGameHandDto`; tag: `GameHand` by gameId
- `useDeleteGameMutation(gameId)` — DELETE /games/{id}; invalidates `Games`

### Card System

Uses a 40-card Napoletane deck. Card data types in `src/dtos/Card.ts` (`ICard` interface with id/value/color, `TCardColors` type). Static card data (image imports, labels, full deck array) in `src/constants/cardsData.ts`. Card images in `src/assets/cards/napoletane/`. Cards identified by numeric id (1-40), grouped in suits of 10: denari (diamonds 1-10), coppe (hearts 11-20), spade (spades 21-30), bastoni (clubs 31-40).

### Playroom Layout

`src/pages/Playroom/` contains the game table UI. `CardsField` renders a 4-player table layout using Emotion styled components with flexbox. Top/left/right opponents show card backs with badge counts; bottom shows the current player's hand sorted by suit (via `SUITS_ORDER`) then value. `PlayerCard` handles card display with click-to-play CSS transition animation (translateY + scale over 280ms).

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
