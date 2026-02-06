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

**Stack:** React 19, Redux Toolkit (store at `src/store/`), MUI v7 (theme at `src/theme/`), React Router v7, Emotion for styled components.

**Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

**Card system:** Uses a 40-card Napoletane deck. Card data types are in `src/dtos/Card.ts` (`ICard` interface with id/value/color, `TCardColors` type). Static card data including image imports, labels, and the full deck array live in `src/constants/cardsData.ts`. Card images are in `src/assets/cards/napoletane/`. Cards are identified by numeric id (1-40), grouped in suits of 10: denari (diamonds), coppe (hearts), spade (spades), bastoni (clubs).

**Routing:** Defined in `src/App.tsx`. Routes: `/` (Home), `/giochi/scopone-scientifico`, `/giochi/tresette`, `/dev` (Playroom dev view), `*` (NotFound).

**Playroom layout:** `src/pages/Playroom/` contains the game table UI. `CardsField` renders a 4-player table layout (top/left/right opponents show card backs, bottom shows the current player's hand). `PlayerCard` handles card display with click-to-play animation. Cards in hand are sorted by suit then value.

**Page components** are organized as `src/pages/<PageName>/index.tsx`.

## Code Style

- Prettier: single quotes, semicolons, 160 char print width, trailing commas (es5), LF line endings
- Components are named exports (not default exports)
- TypeScript strict mode is enabled
- UI text is in Italian
