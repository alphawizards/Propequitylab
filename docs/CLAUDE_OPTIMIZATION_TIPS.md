# Claude Code Optimization Playbook

## Core Philosophy: The "Verification" Rule
The single highest-leverage optimization is **Self-Verification**. Claude checking Claude beats human checking Claude.
*   **Always provide a feedback loop**: Automated tests, screenshots, or explicit expected outputs.
*   **Anthropic's "Golden Rule"**: Give Claude a way to verify its own work before you see it.

## The Workflow
### 1. Explore & Plan (Before Coding)
*   **Don't** jump to "build X".
*   **Do** ask Claude to read relevant files/URLs first.
*   **Trigger "Thinking"**: Use `think`, `think hard`, or `ultrathink` to allocate compute to planning.
*   **Sequence**: Explore Context -> Generate Plan -> Execute.

### 2. Context Hygiene
*   **The Trap**: Filled context = "Drunk Claude" (forgetful/hallucinating).
*   **The Fix**:
    *   `/clear` between unrelated tasks.
    *   Stop after 2 failed corrections. Clear and rewrite prompt.
    *   Scope investigations tightly (don't let it read 200 files).

### 3. The `CLAUDE.md` File
*   **Keep it Short**: Long files are ignored.
*   **Include Only**:
    *   Critical Bash commands (`npm run build`).
    *   Code style preferences (ES modules, etc.).
    *   Testing instructions.
    *   Branch naming.
*   **Maintenance**: Ruthlessly prune. If Claude knows it anyway, delete it.

## High-ROI Commands
| Command | Usage |
| :--- | :--- |
| `/clear` | Clean slate. Use religiously between tasks. |
| `!git status` | Execute bash instantly (saves tokens/time). |
| `/init` | Generate starter `CLAUDE.md`. |
| `claude --dangerously-skip-permissions` | **Use with caution**. Great for linting/boilerplate. Avoid for web/sensitive data. |

## Prompt Engineering
**Formula**: `[Role] + [Task] + [Context]`
*   **Front-load context**.
*   **Be specific**: "Write a test for edge case X" vs "add tests".
*   **Avoid ambiguity**: Don't ask "why is X weird?", ask "Summarize the git history of X".

## Advanced Patterns
### TDD (Test Driven Development)
1.  Tell Claude to write tests (prevent mocks).
2.  Run tests -> Confirm failure -> Commit tests.
3.  Tell Claude to implement code to pass tests (don't modify tests).
4.  Iterate until green.

### Multi-Claude & Parallelism
*   **Write + Review**: Instance 1 writes, Instance 2 reviews.
*   **Git Worktrees**: Run multiple Claudes on different branches simultaneously.
*   **Subagents**: Use sub-agents for complex problems or risky tasks (sandboxed).

### UI/Visual Workflow
*   Provide visual mocks.
*   Iterate with screenshots (Puppeteer MCP or manual paste).
*   "Implement -> Screenshot -> Compare -> Iterate".

## The "Stop Doing" List
*   ❌ Jumping between unrelated tasks in one session.
*   ❌ Correcting the same error >2 times without clearing context.
*   ❌ Writing novel-length instructions.
*   ❌ Allowing unbounded exploration.
