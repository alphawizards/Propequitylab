# Bowser Integration Cleanup Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the Bowser framework integration by fixing remaining gaps, ensuring files are git-tracked, and cleaning up legacy artifacts.

**Architecture:** The Bowser 4-layer framework (skills, agents, commands, justfile) has already been copied into Propequitylab. This plan addresses the remaining gaps: git tracking of `.claude/` bowser files, `.auth/` directory creation, `.gitignore` updates, and removal of the orphaned `claude-code-hooks-mastery/` directory.

**Tech Stack:** Claude Code skills/agents/commands (Markdown), Just task runner, Playwright CLI, Git

---

### Task 1: Fix `.gitignore` to Track Bowser Files in `.claude/`

**Problem:** `.claude/` is listed in `.gitignore` (line 72), which means all bowser skills, agents, and commands are invisible to git. Only 4 files that were force-added earlier are tracked. New bowser files (skills, commands, bowser agents) are untracked.

**Files:**
- Modify: `.gitignore:72`

**Step 1: Update `.gitignore` to whitelist bowser-related `.claude/` paths**

Replace the existing `.claude/` ignore rule with selective ignores. Keep sensitive/generated files ignored but allow skills, agents, and commands to be tracked.

In `.gitignore`, replace:
```
.claude/
```

With:
```
# Claude Code - ignore generated/sensitive files but track skills, agents, commands
.claude/*
!.claude/skills/
!.claude/agents/
!.claude/commands/
!.claude/settings.json
!.claude/settings.local.json
```

**Step 2: Verify the whitelist works**

Run: `git status --short .claude/`
Expected: The bowser skill, agent, and command files should now appear as untracked (ready to be added).

**Step 3: Stage the newly visible `.claude/` files**

Run:
```bash
git add .claude/skills/ .claude/agents/ .claude/commands/ .claude/settings.json .claude/settings.local.json
```

**Step 4: Commit**

```bash
git add .gitignore
git commit -m "fix: track bowser skills, agents, and commands in git"
```

---

### Task 2: Add `.auth/` Directory and Gitignore Entry

**Problem:** The `.env` references `BOWSER_BROWSER_PROFILE_PATH=./.auth/browser_profiles` but the `.auth/` directory doesn't exist. It also needs to be gitignored (contains browser session data).

**Files:**
- Create: `.auth/browser_profiles/.gitkeep`
- Modify: `.gitignore`

**Step 1: Create the `.auth/browser_profiles/` directory with a `.gitkeep`**

Create the directory structure:
```bash
mkdir -p .auth/browser_profiles
touch .auth/browser_profiles/.gitkeep
```

**Step 2: Add `.auth/` contents to `.gitignore`**

Add the following to `.gitignore` under the "Agent Artifacts" section:

```
# Browser profiles (Bowser)
.auth/*
!.auth/browser_profiles/.gitkeep
```

This keeps the directory structure in git but ignores all browser profile data.

**Step 3: Verify**

Run: `ls -la .auth/browser_profiles/`
Expected: `.gitkeep` file present.

Run: `git status .auth/`
Expected: Only `.gitkeep` shows as trackable.

**Step 4: Commit**

```bash
git add .auth/browser_profiles/.gitkeep .gitignore
git commit -m "feat: add .auth directory for bowser browser profiles"
```

---

### Task 3: Remove Orphaned `claude-code-hooks-mastery/` Directory

**Problem:** The `claude-code-hooks-mastery/` directory is a complete separate project that was cloned into Propequitylab's root. It's not part of the Bowser integration and creates confusion. Git already shows 250+ deletions staged for this directory.

**Files:**
- Delete: `claude-code-hooks-mastery/` (entire directory)

**Step 1: Verify the directory is not referenced anywhere in the project**

Run:
```bash
grep -r "claude-code-hooks-mastery" --include="*.md" --include="*.json" --include="*.yaml" --include="*.yml" --include="*.js" --include="*.py" --include="*.ts" . --ignore-dir=claude-code-hooks-mastery
```

Expected: No references outside of the directory itself. If references exist, note them for manual cleanup.

**Step 2: Remove the directory**

Run:
```bash
rm -rf claude-code-hooks-mastery/
```

**Step 3: Stage and commit the removal**

```bash
git add -A claude-code-hooks-mastery/
git commit -m "chore: remove orphaned claude-code-hooks-mastery directory"
```

---

### Task 4: Verify Playwright CLI Availability

**Problem:** Bowser's headless mode requires `playwright-cli` (the `@anthropic-ai/playwright-mcp` package). Need to confirm it's available.

**Files:**
- None (verification only)

**Step 1: Check if playwright-cli is installed**

Run:
```bash
npx @anthropic-ai/playwright-mcp@latest --help
```

Expected: Help output showing available commands. If this fails, Playwright needs to be installed.

**Step 2: If missing, install Playwright CLI and Chromium**

Run:
```bash
npx playwright install chromium
```

**Step 3: Verify browser binaries are present**

Run:
```bash
npx playwright install --dry-run
```

Expected: Shows chromium as already installed.

---

### Task 5: Write Propequitylab-Specific User Stories

**Problem:** The existing user stories include `hackernews.yaml` (external demo) and basic `example-app.yaml`/`localhost.yaml` templates. Propequitylab needs real user stories for its actual UI.

**Files:**
- Modify: `ai_review/user_stories/localhost.yaml`
- Delete: `ai_review/user_stories/hackernews.yaml` (optional — keep as reference if desired)
- Delete: `ai_review/user_stories/example-app.yaml` (optional — keep as reference if desired)

**Step 1: Read the current localhost.yaml**

Read: `ai_review/user_stories/localhost.yaml`

**Step 2: Update localhost.yaml with real Propequitylab stories**

Replace the contents with actual stories for the app's key flows:

```yaml
stories:
  - name: "Landing page loads successfully"
    url: "http://localhost:3000/"
    workflow: |
      Navigate to http://localhost:3000/
      Verify the page loads without errors
      Verify the main heading or hero section is visible
      Verify navigation links are present (Login, Register)

  - name: "Login page renders correctly"
    url: "http://localhost:3000/login"
    workflow: |
      Navigate to http://localhost:3000/login
      Verify the login form is visible
      Verify email and password input fields are present
      Verify the submit/login button is visible
      Verify a link to the registration page exists

  - name: "Register page renders correctly"
    url: "http://localhost:3000/register"
    workflow: |
      Navigate to http://localhost:3000/register
      Verify the registration form is visible
      Verify name, email, and password fields are present
      Verify the submit/register button is visible
      Verify a link to the login page exists
```

**Step 3: Commit**

```bash
git add ai_review/user_stories/localhost.yaml
git commit -m "feat: add propequitylab-specific user stories for bowser QA"
```

---

### Task 6: End-to-End Verification

**Files:** None (verification only)

**Step 1: Verify just is available**

Run: `just --list`
Expected: All bowser recipes listed (test-playwright-skill, test-qa, ui-review, hop, etc.)

**Step 2: Run a dry verification of the QA pipeline**

Run: `just test-qa`
Expected: QA agent spawns, attempts to load localhost:3000 stories. It's OK if the app isn't running — the goal is to confirm the pipeline triggers correctly.

**Step 3: Verify git state is clean**

Run: `git status`
Expected: No unexpected untracked files. All bowser files are tracked. `.auth/` contents are ignored except `.gitkeep`.

---
