# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CodeConnect monorepo managed with **pnpm workspaces** (`pnpm-workspace.yaml` → `apps/*`). Two independent apps, no shared packages yet:

- `apps/web` — React 19 + Vite + TypeScript (package name `web`, dev server on port 5173)
- `apps/api` — NestJS + TypeScript (package name `api`, listens on `PORT` or 3000)

`images/Assets CodeConnect - Next/` holds design assets (card images, avatars, error page mockups) for the UI. They are not wired into either app.

## Commands

Run everything from the repo root. Do not `cd` into apps.

```bash
pnpm install            # install all workspaces
pnpm dev                # web + api in parallel (each app's "dev" script)
pnpm dev:web            # vite only
pnpm dev:api            # nest start --watch only
pnpm build              # build all apps
pnpm lint               # oxlint in all apps
pnpm test               # tests in all apps
pnpm test:web           # web component tests (vitest + jsdom)
pnpm test:api           # api unit tests (vitest run)
pnpm lint:commit        # check the last commit message with commitlint
```

Any app script or pnpm command goes through the `web` / `api` passthrough shortcuts:

```bash
pnpm web add axios
pnpm api add @nestjs/config
pnpm api test:e2e                         # e2e tests (vitest.config.e2e.ts, *.e2e-spec.ts)
pnpm api test src/app.controller.spec.ts  # single test file
pnpm api test -t "should return"          # tests matching a name
pnpm api exec nest g resource users       # Nest CLI generators
pnpm web test src/components/atoms/Button # single web test file or folder
pnpm web test:watch                       # web tests in watch mode
```

## Architecture notes

- **API is ESM** (`"type": "module"`, `module: nodenext`). Relative imports in `apps/api/src` must use the `.js` extension (e.g. `import { AppModule } from './app.module.js'`). `main.ts` uses top-level `await`.
- **API tests use Vitest, not Jest.** `globals: true` and `vite-tsconfig-paths` are set. Unit tests are `*.spec.ts` next to the source. E2E tests are `test/*.e2e-spec.ts` with supertest.
- **Linting uses oxlint, not ESLint**, in both apps (`apps/web/.oxlintrc.json`, `apps/api/oxlint.json`). The API also has Prettier (`pnpm api format`).
- **Web TS is strict on unused code** (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Use `import type` for type-only imports. Do not use enums or parameter properties. `pnpm build:web` runs `tsc -b` before `vite build`, so type errors break the build.
- The web app has no dev proxy to the API, and the API has no CORS setup. Configure one of them before the web app calls the API.
- Each app has its own `.gitignore`. The root `.gitignore` covers root-level `node_modules` and `.env` files. Only the root has a git repository.

## Frontend conventions (`apps/web`)

**Atomic Design.** Put components under `src/components/` in these levels:

- `atoms/` — smallest UI units with no domain logic (Button, Input, Avatar, Icon).
- `molecules/` — small groups of atoms with one job (SearchBar, CardHeader).
- `organisms/` — larger sections built from molecules and atoms (Header, PostCard, Sidebar).
- `templates/` — page layouts with slots and no real data.
- `pages/` — templates filled with real data. Only pages fetch data or own app state.

A component imports only from its own level or lower levels. Atoms never import molecules. Give each component its own folder: `atoms/Button/Button.tsx`, `Button.test.tsx`, `index.ts`.

**Styling with Tailwind CSS v4** (`@tailwindcss/vite` plugin, `@import "tailwindcss"` in `src/index.css`, no `tailwind.config.js`). Add theme tokens with `@theme` in `src/index.css`. Use Tailwind utility classes in JSX. Do not add per-component `.css` files or inline `style` objects. Put design tokens (colors, fonts, spacing from `images/Assets CodeConnect - Next/`) in the Tailwind theme, not as hardcoded values in components.

**Tests are required.** Every component needs at least one test for its essential use: it renders and its main interaction or variant works. Use Vitest + React Testing Library + `@testing-library/user-event`. The test config is in `vite.config.ts` (jsdom). `src/test/setup.ts` loads the jest-dom matchers and runs cleanup. Vitest globals are off, so import `describe`/`it`/`expect`/`vi` from `vitest`. Test behaviour through roles and visible text, not class names or internal state. Do not consider a component done until its test passes.

## Backend conventions (`apps/api`): REST

- **Resources, not actions.** URIs are plural nouns, kebab-case, with no verbs: `GET /posts`, `GET /posts/:id`, `GET /posts/:id/comments`. Never `/getPosts` or `/posts/create`.
- **HTTP methods by meaning.** `GET` reads with no side effects. `POST` creates. `PUT` replaces the whole resource. `PATCH` updates part of it. `DELETE` removes. `GET`, `PUT` and `DELETE` must be idempotent.
- **Status codes.** `200` OK. `201 Created` for `POST`, with a `Location` header pointing to the new resource. `204 No Content` for `DELETE` and for updates that return no body. `400` invalid input. `401` not authenticated. `403` not allowed. `404` resource not found. `409` conflict (for example a duplicate). `422` valid syntax but business rule fails. Use Nest built-in exceptions (`NotFoundException`, `ConflictException`, ...) so the status matches.
- **Representations.** Request and response bodies are JSON with camelCase fields. Validate every input with DTOs using `class-validator` decorators. `main.ts` registers a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), so unknown fields return `400`. E2E tests build their own app, so register the same pipe there. Never return entities with internal fields directly. Map them to response DTOs.
- **Collections.** Use query params for filtering, sorting and pagination (`GET /posts?tag=react&sort=-createdAt&page=2&limit=20`). Return the items plus pagination metadata.
- **Stateless.** Each request carries all the data the server needs (for example the auth token). Do not keep client session state in the server.
- **Errors** use one shape across the API (Nest default: `statusCode`, `message`, `error`).
- **Structure.** One Nest module per resource (`nest g resource <name>`): controller for HTTP only, service for business logic.

## Git: Conventional Commits

All commits in both apps follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary in imperative mood>
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope** is the app or area: `web`, `api`, or `root` for workspace-level changes. Examples: `feat(web): add PostCard organism`, `fix(api): return 404 for missing post`, `build(root): add pnpm dev shortcut`.
- Breaking changes use `!` after the type or scope (`feat(api)!: rename /users to /members`) and a `BREAKING CHANGE:` footer.
- `commitlint.config.mjs` enforces the format and the scope list. There is no git hook, so run `pnpm lint:commit` after committing, or check a message with `echo "<msg>" | pnpm exec commitlint`.
- Keep one logical change per commit. Do not mix `web` and `api` changes unless they belong to the same feature.
