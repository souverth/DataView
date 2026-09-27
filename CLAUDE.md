# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HeraQ / OrcaQ Agent Guide

OrcaQ is a next-gen database client. Friendly, powerful.
This repo is a Nuxt 3 + Vue 3 + TypeScript web app that runs in Docker.

## Repo Layout And Important Directories

- `components/` contains Vue UI. Reusable primitives live in `components/base`
  and shadcn-style components live in `components/ui`.
- `components/base/data-grid/` contains the shared AG Grid wrapper, copy context
  menu, and reusable grid renderers/headers. Read
  `components/base/data-grid/docs/USAGE_GUIDE.md` before changing shared grid
  behavior or adding a new generic grid feature.
- `components/modules/` contains feature modules. Important modules include
  `quick-query`, `raw-query`, `management-connection`, `management-schemas`,
  `management-explorer`, `erd-diagram`, `workspace`, and `settings`.
- `components/modules/quick-query/` is the table browsing/editing feature. Keep
  extracted composables in its `hooks/` directory and pure helpers in its
  `utils/` directory.
- `core/` contains shared app logic used by the frontend, including composables,
  helpers, constants, stores, types, persistence abstractions, and contexts.
- `server/` contains Nuxt server API routes and backend infrastructure for
  database adapters, drivers, metadata, query execution, Redis, and AI features.
- `docker/` contains the Dockerfiles and Compose definitions (production, dev,
  demo databases). See `docker/README.md`.
- `pages/` contains Nuxt file-based routes for workspaces, connections, ERD,
  schema management, raw query, and quick query.
- `plugins/` contains Nuxt plugins. Be careful changing app initialization or
  storage hydration because many Nuxt tests depend on those paths.
- `test/unit`, `test/nuxt`, `test/e2e`, and `test/playwright` contain the test
  suites. Prefer the narrowest relevant suite first, then broaden.
- `docs/` contains architecture, project structure, API, module flow, business
  rules, storage, and refactoring guidance. Read the specific doc that matches
  the task before changing broad behavior.
- Shared grid usage notes live in `components/base/data-grid/docs/USAGE_GUIDE.md`.

## Code Patterns

### Vue Components

All components use `<script setup lang="ts">` with this order:
1. Imports
2. Props & Emits (`defineProps`, `defineEmits`)
3. Stores & Composables
4. Refs & Reactive State
5. Computed Properties
6. Functions
7. Lifecycle Hooks
8. Watchers

Component file structure order: `<script setup>`, then `<template>`, then `<style scoped>` (if needed).

### TypeScript Conventions

- Use `interface` for object shapes: `interface Schema { id: string; name: string; }`
- Use `type` for unions, intersections: `type TabViewType = 'TableOverview' | 'CodeQuery'`
- Use `enum` for fixed sets with semantic meaning: `enum TabViewType { AllERD = 'AllERD' }`
- Avoid `any` type; prefer explicit typing or `unknown` with type guards

### Imports & Path Aliases

- Use `~/` path alias for src root: `import { useSchemaStore } from '~/shared/stores/useSchemaStore'`
- Avoid relative paths for cross-module imports (`../../../`)
- Each module should have an `index.ts` barrel export

### State Management

| State Type | Use For | Location |
|------------|---------|----------|
| Local `ref`/`reactive` | UI state (modals, forms, temp) | Component |
| Pinia Store | Shared state across components | `/shared/stores/` |
| Composable | Reusable logic with local state | `/composables/` |
| Provide/Inject | Deep component tree data | `/shared/contexts/` |

Use `storeToRefs()` when accessing store state for reactivity: `const { workspaceId } = storeToRefs(wsStateStore)`

### Styling

Prefer Tailwind utilities. Use `<style scoped>` only for complex styles not achievable with Tailwind.

## Component Reuse Rules

- Before creating a new UI component, check existing components in
  `components/base` and `components/ui`.
- If an existing component already fits the need, reuse it instead of creating
  another component.
- Create a new component only when there is no suitable existing base or UI
  component, or when the new behavior is clearly feature-specific.

## Icon Usage Rules

- Prefer Hugeicons for UI icons. Use the `hugeicons:` collection first so icon
  style stays consistent across the app.
- When adding or changing any `hugeicons:*` icon name, verify that the icon
  actually exists in `node_modules/@iconify-json/hugeicons/icons.json` before
  committing the change. Do not assume names from another collection are
  available in Hugeicons.
- Use another collection such as `lucide:` only when there is no suitable
  verified Hugeicons equivalent, and use that collection prefix explicitly (for
  example `lucide:chart-pie`).

## Business Rules

### Database Connections

- Supported types: `postgres`, `mysql`, `mariadb`, `oracledb`, `sqlite3`, `redis`
- Connection string formats:
  - PostgreSQL: `postgresql://user:password@host:port/database`
  - MySQL: `mysql://user:password@host:port/database`
  - MariaDB: `mariadb://user:password@host:port/database`
  - Oracle: `oracledb://user:password@host:port/serviceName`
  - SQLite: `sqlite3:///absolute/path/to/database.sqlite`
- Oracle structured-form connections use `serviceName` instead of `database`
- Managed SQLite (Cloudflare D1, Turso) uses `managed` method and stays on SQL family path
- Local SQLite uses `file` method with a path inside the container (`/data/sqlite`), gated by `NUXT_PUBLIC_SQLITE3_CONNECTIONS_ENABLED`
- Failed health checks return actionable driver messages but connections are still saved
- A failed re-test must not delete or mutate an already saved connection record

### Database Family Gating

- Connection family drives visible tabs, sidebar panels, empty states, and unsupported-feature fallbacks
- D1 and Turso stay on `sqlite3` type but resolve to the `sql` family
- Redis hides SQL-only surfaces: `Schemas`, `ERD`, `UsersRoles`, schema diff, SQL backup/restore
- Provider-limited SQL tools for D1/Turso must show clear unavailable state instead of redirecting away from SQL family

### Workspaces

- Workspace must have at least one connection to be functional
- Deleting workspace cascades to all associated connections and state
- Connections belong to exactly one workspace; `workspaceId` is immutable after creation
- Deleting connection removes all associated tabs and state

## How To Run The Project

Commands are defined in `package.json`. The package manager is npm
(`package-lock.json`). The supported runtime is Docker.

- Run with Docker: `docker compose up -d --build` (see `docker/README.md`).
- Dev environment in Docker: `docker compose -f docker/compose.dev.yml up --build`.
- Install dependencies locally: `npm install`.
- Run the web app locally: `npm run dev` or `npm run nuxt:dev`.
- Build Nuxt: `npm run nuxt:build`.
- Generate static output: `npm run nuxt:generate`.
- Run Storybook: `npm run storybook`.
- Format all files: `npm run format`.
- Check formatting: `npm run format:check`.
- Typecheck: `npm run typecheck`.

## Tests And Verification

> **For any test-related task, load the skill first:** > `.github/skills/testing-orcaq/SKILL.md`
> It contains the exact commands, fixture profiles, and decision rules.
> Full reference: `docs/TESTING_GUIDE.md`

- Typecheck: `npm run typecheck`.
- Unit tests: `npm run test:unit`
- Nuxt/component tests: `npm run test:nuxt`
- All Vitest suites: `npm run test:all`
- API/integration tests (auto fixtures): `npm run test:api`
- API/integration tests (fixtures already up): `npm run test:api:raw`
- Playwright E2E (auto fixtures): `npm run test:e2e`
- Playwright E2E (fixtures already up): `npm run test:e2e:raw`
- Start fixtures: `npm run test:fixtures:up`
- Stop fixtures: `npm run test:fixtures:down`

## Verification Rules

- Any source-code modification must pass `npm run typecheck` + `npm run test:unit`.
- Do not claim a task is complete if type checking fails.
- Run the smallest relevant test suite first — never start all fixtures to test a single DB.
- Use `npm run test:api:raw` / `npm run test:e2e:raw` when fixtures are already running.
- Run broader suites only when the change scope requires it.
- Clearly report:
  - executed commands
  - failing commands
  - whether failures are related to the current change

## Agent skills

### Issue tracker

Issues tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context — root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

## CodeGraph

This project is indexed by CodeGraph (`.codegraph/`, local-only, gitignored).
Usage rules live in `.claude/CLAUDE.md` and the `codegraph` skill
(`.claude/skills/codegraph/SKILL.md`).

- For "how does X work", flows, callers/callees, or blast radius, use the
  `codegraph_explore` MCP tool (or `codegraph explore "<query>"`) before
  grep/find or reading files.
- If `.codegraph/` is missing, run `codegraph init --yes` once. Hooks keep the
  index synced after that.
