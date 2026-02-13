# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn start:dev` — Start NestJS in watch mode (default port: 3000, override with `PORT` env var)
- `yarn build` — Compile to `dist/`
- `yarn start:prod` — Run compiled build (`node dist/main`)
- `yarn lint` — ESLint with auto-fix
- `yarn format` — Prettier
- `yarn test` — Unit tests (Jest, `*.spec.ts` files in `src/`)
- `yarn test:watch` — Tests in watch mode
- `yarn test:cov` — Tests with coverage report
- `yarn test:e2e` — E2E tests (config in `test/jest-e2e.json`)
- Run a single test file: `yarn test -- --testPathPattern=app.controller`

## Architecture

Backend for a platform for Italian card games (Scopone Scientifico, Tresette). Part of a monorepo — see the root `CLAUDE.md` for full project context including the frontend (`ui/`).

**Stack:** NestJS v11, TypeScript 5.7, Express, Jest.

**Structure:** Standard NestJS module with dependency injection — `AppModule` → `AppController` + `AppService`. Entry point in `src/main.ts`, listens on `process.env.PORT ?? 3000`.

**TypeScript:** target ES2023, module `nodenext`, decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`). `strictNullChecks: true` but `noImplicitAny: false`.

**Testing:** Jest with `ts-jest`. Unit tests colocated as `src/**/*.spec.ts`, E2E tests in `test/` using supertest.

## Code Style

- Single quotes, trailing commas (all) — Prettier defaults for the rest
- ESLint: `@typescript-eslint/no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings
- UI-facing text is in Italian
