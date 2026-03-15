# Implementation Plan - Bowser Framework Merge

Merge the Bowser 4-layer browser automation framework into `alphawizards/Propequitylab` to enable automated, agentic UI testing and workflow execution.

## User Review Required
> [!IMPORTANT]
> **Environment Variables**: I will merge `.env.sample` into your `.env` (or create one). Please verify the values, especially for persistent browser profiles, after the merge.

> [!WARNING]
> **Playwright Binaries**: I will attempt to check for Playwright binaries. If they are missing, you may need to run `npx playwright install --with-deps chromium` manually if the agent cannot execute it due to permissions or environment restrictions.

## Proposed Changes

### Phase 1: Directory Merging

#### [NEW] Skills
- Copy `.claude/skills/playwright-bowser` -> `Propequitylab/.claude/skills/playwright-bowser`
- Copy `.claude/skills/claude-bowser` -> `Propequitylab/.claude/skills/claude-bowser`
- Copy `.claude/skills/just` -> `Propequitylab/.claude/skills/just`

#### [NEW] Agents
- Copy `.claude/agents/bowser-qa-agent.md` -> `Propequitylab/.claude/agents/`
- Copy `.claude/agents/playwright-bowser-agent.md` -> `Propequitylab/.claude/agents/`
- Copy `.claude/agents/claude-bowser-agent.md` -> `Propequitylab/.claude/agents/`

#### [NEW] Commands
- Copy `.claude/commands/ui-review.md` -> `Propequitylab/.claude/commands/`
- Copy `.claude/commands/bowser/` (folder) -> `Propequitylab/.claude/commands/bowser/` (Contains `hop-automate.md` and workflows)

#### [NEW] Test Configurations
- Copy `ai_review/user_stories/` -> `Propequitylab/ai_review/user_stories/`

### Phase 2: Dependency Initialization

#### [MODIFY] Environment
- Update `Propequitylab/.env` (or create) with variables from `bowser/.env.sample` (e.g. `BOWSER_BROWSER_PROFILE_PATH`).
- Create `Propequitylab/.auth` directory for persistent sessions.

### Phase 3: Orchestration & Task Execution

#### [NEW] Justfile
- Create `Propequitylab/justfile` (since none exists).
- Copy content from `bowser/justfile`.
- Update default URL variables in `ui-review` and `user_stories` to point to `localhost:3000` instead of HackerNews/external sites where appropriate.

## Verification Plan

### Automated Tests
- Run `just --list` to verify commands are recognized.
- Run `just ui-review headed=false` (dry run or with a simple test story) to verify the pipeline triggers the agents.

### Manual Verification
- Check that `.claude/skills`, `.claude/agents`, and `.claude/commands` contain the new files.
- Verify `.env` has the new variables.
