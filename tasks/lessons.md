# PropEquityLab — Lessons Learned

## Format

Each lesson: **Rule** → **Why** → **How to apply**

---

## Authentication

**Don't reference legacy JWT endpoints in docs when Clerk is active.**
Why: The custom `/api/auth/login`, `/api/auth/register`, etc. were removed when Clerk took over. Docs referencing them cause confusion.
How to apply: When writing auth docs, describe the Clerk flow (ClerkProvider → SignIn/SignUp → JWKS verification), not the old JWT flow.

**The dual-mode toggle is `CLERK_JWKS_URL` in backend `.env`.**
Why: `utils/auth.py` line 369-371 imports `get_current_user` from `clerk_auth.py` only if `CLERK_JWKS_URL` is set. Unset it to fall back to legacy JWT (useful for debugging).
How to apply: If Clerk auth appears broken, first check this env var is set on the deployment platform.

## Database

**`DATABASE_URL` in `backend/.env` is a localhost placeholder — the real value lives in Railway.**
Why: The project deploys to Railway, which injects `DATABASE_URL` at runtime. The local `.env` file has never been updated with the real Neon.tech string.
How to apply: For local dev, either get the Neon connection string from Railway dashboard or use Railway CLI to run locally with production env vars.

## Tooling

**jcodemunch tool table in CLAUDE.md must match `.claude/settings.local.json` permissions.**
Why: CLAUDE.md previously listed tools (`find_references`, `get_blast_radius`, etc.) that were never in the permissions allow-list. Using them would fail.
How to apply: When adding jcodemunch tools, update BOTH CLAUDE.md and `.claude/settings.local.json` together.

**jcodemunch MCP server must be registered; it doesn't auto-connect.**
Why: The binary is at `C:\Users\ckr_4\.local\bin\jcodemunch-mcp.exe` (installed via uv) but was not in `.claude.json`. It needs `claude mcp add` to register.
How to apply: At start of each new machine/profile, run `claude mcp add jcodemunch "C:\Users\ckr_4\.local\bin\jcodemunch-mcp.exe"`.

## Code Quality

**Remove dead MongoDB code — the project migrated to PostgreSQL.**
Why: `requirements.txt` had `pymongo` and `motor` listed as legacy migration artifacts. They install unnecessary packages and signal confusion about the current stack.
How to apply: PostgreSQL (Neon) + SQLModel + Alembic is the stack. Remove any MongoDB references encountered.

## Deployment

**Agent files in `.claude/agents/` must be kept in sync with `AGENTS.md`.**
Why: AGENTS.md referenced non-existent files (`engineering-backend-architect.md`, etc.) while actual agents have different names (`fullstack-developer.md`, `devops-engineer.md`).
How to apply: When adding/renaming agent files, update AGENTS.md immediately.
