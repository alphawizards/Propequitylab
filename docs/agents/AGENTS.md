# AI Agent Roster — PropEquityLab

This document describes the full roster of AI agents configured for PropEquityLab development. Agents are installed at `~/.claude/agents/` and are available in any Claude Code session.

---

## How Agents Work

Agents in `~/.claude/agents/` are **Claude Code subagents** — specialized AI personas that Claude can invoke automatically or that you can request explicitly.

**Automatic activation**: Claude will select the right agent based on your request.  
**Manual activation**: You can explicitly ask for a specific agent:
> "Use the PropEquityLab Backend Engineer agent to add a new endpoint for property tags"

**Source**: Agents were adapted from the [agency-agents](https://github.com/msitarzewski/agency-agents) open-source collection and customized for this codebase.

---

## 🏠 PropEquityLab-Specific Agents (Start Here)

These are custom agents built specifically for this codebase. They know the exact stack, file layout, naming conventions, and patterns.

### 🟢 PropEquityLab Feature Planner
**File**: `propequitylab-feature-planner.md`  
**When to use**: Before starting any significant new feature or refactor.  
**What it does**: Converts a feature request into a complete implementation plan — data models, API contracts, frontend changes, migration steps, security requirements, and an ordered task list. Outputs a directive file to `directives/`.

> Example: "Plan a property comparison feature that lets users compare two properties side-by-side"

---

### 🔵 PropEquityLab Backend Engineer
**File**: `propequitylab-backend-engineer.md`  
**When to use**: Any backend work — new endpoints, model changes, migrations, financial calculations, auth fixes.  
**What it does**: Writes FastAPI/SQLModel code that exactly matches the existing patterns. Knows the full `backend/` structure, the `Decimal` requirement for financial fields, the ownership-check pattern, and the Alembic migration workflow.

> Example: "Add a notes field to properties and expose it via the API"

---

### 🩵 PropEquityLab Frontend Engineer
**File**: `propequitylab-frontend-engineer.md`  
**When to use**: Any React work — new pages, components, charts, forms, API wiring, or UI fixes.  
**What it does**: Writes React code using shadcn/ui, Tailwind, Recharts, and the centralised `api.js` service. Knows the context providers, existing component patterns, and Cloudflare Pages deployment.

> Example: "Build a property comparison page with a side-by-side table and equity chart"

---

### 🔴 PropEquityLab Security Reviewer
**File**: `propequitylab-security-reviewer.md`  
**When to use**: Before merging any PR involving auth, user data, financial records, or new public-facing endpoints.  
**What it does**: Reviews code for IDOR vulnerabilities, missing ownership checks, GDPR compliance, JWT handling, and fintech-specific data exposure risks. Produces a structured security report with CRITICAL/HIGH/MEDIUM/LOW findings and concrete fixes.

> Example: "Do a security review of the new valuations endpoint"

---

### 🟣 PropEquityLab QA Engineer
**File**: `propequitylab-qa-engineer.md`  
**When to use**: Writing tests, debugging failing tests, or doing a QA pass before release.  
**What it does**: Writes pytest tests that cover the financial edge cases specific to property investment (negative equity, zero rates, empty portfolios, decimal precision). Knows the `conftest.py` fixture system and the existing test patterns.

> Example: "Write tests for the new property comparison endpoint"

---

## 🔧 Generic Engineering Agents

General-purpose agents from the agency-agents collection, useful for tasks outside PropEquityLab's specific context.

### Backend Architect
Deep system design, database architecture, scalable API design, cloud infrastructure.

### Frontend Developer
React/Vue/Angular, Core Web Vitals optimization, accessibility, design systems.

### Security Engineer
Threat modeling, OWASP Top 10, CI/CD security pipelines, penetration testing.

### DevOps Automator
CI/CD pipelines, Docker, infrastructure-as-code, deployment automation.

---

## 🧪 Testing Agents

### API Tester
Comprehensive API testing — functional, performance, security. Produces k6/Playwright test suites.

### Reality Checker
Evidence-based QA certification. Requires proof before declaring anything "production ready". Defaults to NEEDS WORK.

### Evidence Collector
Screenshot-based QA and visual verification. UI testing and bug documentation.

---

## 📊 Product Agents

### Sprint Prioritizer
Agile sprint planning, RICE/MoSCoW prioritization, backlog management, velocity tracking.

---

## 🛠️ Recommended Workflows

### Starting a New Feature
1. **Feature Planner** → produces a directive in `directives/`
2. **Backend Engineer** → implements the API (models, routes, migrations)
3. **Frontend Engineer** → implements the UI (pages, components, api.js)
4. **QA Engineer** → writes the tests
5. **Security Reviewer** → reviews before merge

### Debugging a Backend Issue
1. **Backend Engineer** → diagnose and fix
2. **QA Engineer** → add regression test

### Security Audit
1. **Security Reviewer** → full security pass on target files
2. **Backend Engineer** → implement fixes

### Performance Review
1. **API Tester** → load test and identify bottlenecks
2. **Backend Architect** → recommend architectural improvements
3. **Frontend Developer** → Core Web Vitals pass

---

## 📁 Agent File Locations

```
~/.claude/agents/                               # Global (available in all projects)
├── propequitylab-backend-engineer.md           ← Use for backend work
├── propequitylab-frontend-engineer.md          ← Use for frontend work
├── propequitylab-security-reviewer.md          ← Use before merging
├── propequitylab-qa-engineer.md                ← Use for tests
├── propequitylab-feature-planner.md            ← Use to plan features
├── engineering-backend-architect.md
├── engineering-frontend-developer.md
├── engineering-security-engineer.md
├── engineering-devops-automator.md
├── testing-api-tester.md
├── testing-reality-checker.md
├── testing-evidence-collector.md
└── product-sprint-prioritizer.md
```

---

## 🔄 Keeping Agents Updated

When the PropEquityLab codebase evolves significantly (new major models, stack changes, new conventions), update the PropEquityLab-specific agents to reflect the changes:

```bash
# Edit the agent files directly
notepad "C:\Users\ckr_4\.claude\agents\propequitylab-backend-engineer.md"
```

To add more agents from the agency-agents collection:
```bash
# The source repo is cloned at C:\Users\ckr_4\.tmp\agency-agents
ls "C:\Users\ckr_4\.tmp\agency-agents"
copy "C:\Users\ckr_4\.tmp\agency-agents\[division]\[agent].md" "C:\Users\ckr_4\.claude\agents\"
```

---

*Last updated: 2026-03-10*  
*Source: https://github.com/msitarzewski/agency-agents*
