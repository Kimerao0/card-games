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

**Stack:** NestJS v11, TypeScript 5.7, Fastify, PostgreSQL (TypeORM), JWT auth (Passport), Jest.

**Structure:** NestJS modules with dependency injection. Entry point in `src/main.ts` (FastifyAdapter), listens on `0.0.0.0:3000`. CORS enabled for `localhost:5173`. Global `ValidationPipe` (`transform: true`, `whitelist: true`) and `ClassSerializerInterceptor`. Global `JwtAuthGuard` (all routes protected unless marked `@Public()`).

```
src/
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
│   ├── auth.module.ts             # Imports PassportModule, UsersModule; configures JwtModule
│   ├── auth.controller.ts         # POST /auth/register (@Public), POST /auth/login (@Public)
│   ├── auth.service.ts            # Register + Login: check email, hash bcrypt(10), sign JWT {sub, email}
│   ├── jwt.strategy.ts            # PassportStrategy: extracts Bearer token, validates payload
│   ├── jwt-auth.guard.ts          # Global guard: skips @Public() routes, enforces JWT otherwise
│   ├── public.decorator.ts        # @Public() decorator (sets 'isPublic' metadata)
│   ├── current-user.decorator.ts  # @CurrentUser() param decorator (extracts AuthUser from request)
│   ├── auth-user.interface.ts     # AuthUser { sub: string, email: string }
│   ├── auth.request.ts            # AuthRequest extends Request with user: AuthUser
│   └── login.dto.ts               # LoginDto: email (@IsEmail), password (@IsNotEmpty)
├── users/
│   ├── users.module.ts            # Registers User entity, exports UsersService
│   ├── users.controller.ts        # GET /users/profile (protected, returns current user)
│   ├── users.service.ts           # findOneByEmail, findOneById, createUser, verifyPassword
│   ├── user.entity.ts             # Entity: id(UUID), email(unique), name, passwordHash(@Exclude), createdAt, updatedAt
│   └── create-user.dto.ts         # Validation: email, name, password (min 6, uppercase, digit, special char)
└── games/
    ├── games.module.ts            # Imports Game entity + UsersModule
    ├── games.controller.ts        # POST /games (create), GET /games/:id/join, DELETE /games/:id (creator only, 204)
    ├── games.service.ts           # createGame, joinGame (max 4 players), deleteGame (creator only)
    └── game.entity.ts             # Entity: id(UUID), createdBy(ManyToOne→User), players(ManyToMany→User via game_players), createdAt, updatedAt
```

**Configuration:** Env vars validated with Joi in `config/config.types.ts`. Required: `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SYNC`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Optional with defaults: `DB_HOST` (localhost), `DB_PORT` (5432), `APP_MESSAGE_PREFIX`. See `docker-compose.yaml` for local PostgreSQL 16.

**Auth flow:** Registration (`POST /auth/register`) and login (`POST /auth/login`), both `@Public()`. Bcrypt hash (10 rounds), JWT signed with `{ sub: user.id, email }`. All other routes protected by global `JwtAuthGuard` via Passport JWT strategy. `@CurrentUser()` decorator extracts authenticated user. User entity uses `@Exclude()`/`@Expose()` with `ClassSerializerInterceptor` to hide `passwordHash`.

**Database:** PostgreSQL 16 via Docker. TypeORM with `autoLoadEntities: true`, `synchronize` controlled by `DB_SYNC` env var. Tables: `users`, `games`, `game_players` (ManyToMany junction).

**Games:** Each game has a creator (`createdBy`) and up to 4 players (ManyToMany). Only the creator can delete a game (`ForbiddenException`). Players join via `GET /games/:id/join`.

**TypeScript:** target ES2023, module `nodenext`, decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`). `strictNullChecks: true` but `noImplicitAny: false`.

**Testing:** Jest with `ts-jest`. Unit tests colocated as `src/**/*.spec.ts`, E2E tests in `test/` using supertest.

## Code Style

- Single quotes, trailing commas (all), 160 char print width
- ESLint: `@typescript-eslint/no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings
- UI-facing text is in Italian
- Always use explicit `public` keyword on public methods
- Avoid `any` — create dedicated types/interfaces instead
- Always declare explicit return types on methods
- Favor clarity and readability over brevity — prefer verbose, self-explanatory code over compact but hard-to-follow logic
