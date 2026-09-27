# HeraQ / OrcaQ Agent Guide

Orcaq is next-gen database client. Friendly, powerful
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

## Typography & Styling Rules

- When 10px font size is needed (text 10), always use `text-xxs` (defined in `tailwind.css` as `0.625rem`). Never use arbitrary classes like `text-[10px]` or `text-10`.
- For compact controls (height 24px), use component size prop `size="xxs"` (e.g. `Input`, `Button`) instead of custom size utility overrides.

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

## CodeGraph Setup

This project is indexed by CodeGraph (`.codegraph/`, local-only, gitignored).
When the user types `/codegraph` or asks a structural code question, load the
`codegraph` skill (`.codex/skills/codegraph/SKILL.md`). If `.codegraph/` is
missing, run `codegraph init --yes` once; the Codex hooks in
`.codex/hooks.json` keep it synced after that.

<!-- CODEGRAPH_START -->

## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.

<!-- CODEGRAPH_END -->
