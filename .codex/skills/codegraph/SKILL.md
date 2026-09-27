---
name: codegraph
description: >
  Code intelligence for OrcaQ via the CodeGraph index in `.codegraph/`. Use
  BEFORE grep/find/reading files whenever the task needs to understand or
  locate code: "how does X work", tracing a flow (component -> composable ->
  store -> server API -> driver), finding callers/callees, estimating the blast
  radius of a change, or picking which tests to run. Trigger: `/codegraph`.
---

# CodeGraph

The repo is indexed by CodeGraph (`.codegraph/codegraph.db`, gitignored,
per-machine). The index covers Vue SFCs, TS, server routes, and resolves
dynamic hops grep can't follow (e.g. `<Component>` renders, composable wiring).

## 1. Check the index

- `.codegraph/` missing → run `codegraph init --yes` once (~5s for this repo).
- Stale after big branch switches → `codegraph sync` (incremental) or
  `codegraph index` (full rebuild).
- `codegraph status` shows file/node counts and pending changes.

Hooks already keep it fresh: `UserPromptSubmit` runs `codegraph prompt-hook`
(injects `<codegraph_context>` for structural prompts) and `Stop` runs
`codegraph sync --quiet`. If a prompt already contains `<codegraph_context>`,
treat that source as read — don't re-grep it.

## 2. Pick the tool

| Need | MCP tool | Shell fallback |
| --- | --- | --- |
| How does X work / trace a flow / survey an area | `codegraph_explore` | `codegraph explore "<question or symbols>"` |
| One symbol's source + callers/callees, or a file with line numbers | — | `codegraph node <symbol\|file>` |
| Find a symbol by name | — | `codegraph query <name> [--kind function]` |
| Who calls X / what X calls | — | `codegraph callers <symbol>` / `codegraph callees <symbol>` |
| Blast radius before changing X | — | `codegraph impact <symbol> [--depth 3]` |
| Which tests cover changed files | — | `codegraph affected <files...> [--filter "test/unit/**"]` |

`codegraph_explore` is usually enough in one call: it returns the relevant
symbols' verbatim source, the call paths between them, and a blast-radius
summary. Name concrete symbols/files in the query for sharper results
(e.g. `"useQuickQueryTableInfo QuickQuery save rows flow"`).

## 3. Rules

- Trust CodeGraph output; don't re-verify it with grep. Fall back to grep/Read
  only for non-code text (docs, JSON, SQL strings, i18n) or exact line edits.
- Before editing a shared symbol (stores in `core/`, `components/base/`,
  server adapters), run `codegraph impact <symbol>` and mention affected areas.
- For test selection, combine `codegraph affected <changed files>` with the
  `testing-orcaq` skill's rules (smallest suite first).
- When delegating code exploration to a subagent, tell it to use
  `codegraph explore` first.
