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

**Stack:** NestJS v11, TypeScript 5.7, Express, Jest.

**Struttura:** Modulo NestJS standard con dependency injection — `AppModule` → `AppController` + `AppService`. Entry point in `api/src/main.ts`, ascolta su `process.env.PORT ?? 3000`.

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
