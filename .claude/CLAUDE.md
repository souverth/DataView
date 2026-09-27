# codegraph
- **codegraph** (`.claude/skills/codegraph/SKILL.md`) - code intelligence over the `.codegraph/` index (explore, callers, impact, affected tests). Trigger: `/codegraph` or any structural code question.

# Agent Rules (from .agent/rules/)
Apply these always-on rules on every request:
- `01-identity.md` — Full-stack engineer, scope-bound, clarify-first, quality-over-speed.
- `02-task-classification.md` — Classify request as CONSULT / BUILD / DEBUG / OPTIMIZE before acting.
- `03-mode-consulting.md` — Mode-specific behavior for CONSULT.
- `04-mode-build.md` — Mode-specific behavior for BUILD.
- `05-mode-debug.md` — Mode-specific behavior for DEBUG.
- `06-mode-optimize.md` — Mode-specific behavior for OPTIMIZE.
- `07-technical-standards.md` — Tech standards, libraries, testing approach.
- `08-communication.md` — Tone, response format, language.
- `09-checklist.md` — Pre-completion verification checklist.
- `10-special-situations.md` — Edge cases and special situations.
- `module-architecture.md` — Module/feature architecture rules.

# Workflows
- `.claude/workflows/request.md` — Standard request handling flow.
- `.claude/workflows/agent-development.md` — Agent/skill development flow.

# Skills
41 skills available in `.claude/skills/`. Trigger the matching one when the request matches its description (vue, nuxt, pinia, postgres-expert, testing-expert, etc.). Run `ls .claude/skills/` to enumerate.

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
