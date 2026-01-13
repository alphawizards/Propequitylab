# Ralph Setup Complete! 🎉

Ralph has been successfully installed and configured for PropEquityLab.

## What is Ralph?

Ralph is an autonomous AI agent that continuously runs Claude Code to work on your project. It:
- Reads your requirements from `PROMPT.md`
- Executes development tasks autonomously
- Tracks progress in `@fix_plan.md`
- Stops automatically when tasks are complete
- Has built-in rate limiting and circuit breakers to prevent infinite loops

## Quick Start

### Start Ralph

```bash
# Navigate to your project
cd "C:\Users\ckr_4\01 Projects\Propequitylab\Propequitylab"

# Start Ralph with monitoring
ralph --monitor

# Or start without tmux monitoring
ralph
```

### Monitor Progress (Separate Terminal)

```bash
# In a second terminal
cd "C:\Users\ckr_4\01 Projects\Propequitylab\Propequitylab"
ralph-monitor
```

### Check Status

```bash
ralph --status
```

## What Ralph Will Do

Ralph will work through **100+ tasks** in `@fix_plan.md` organized by priority:

### P0 - CRITICAL (Foundation)
1. **Fix UUID generation** for all models
2. **Test UUID fixes** - verify all CRUD works

### P1 - HIGH (Core Features)
3. **Create Premium user sample data** - 2 portfolios, 3 properties, loans, etc.
4. **Create Pro user sample data** - 3 portfolios, 5+ properties, complex data
5. **Test sample data** - verify all data created correctly
6. **Verify all CRUD endpoints** - test create/read/update/delete for all entities
7. **Document CRUD results** - create testing report

### P2 - MEDIUM (Dashboard & Features)
8. **Implement dashboard summary** - net worth, totals, cash flow calculations
9. **Test dashboard** - verify calculations accurate
10. **Verify Phase 5 visualization** - check for charts in frontend
11. **Test frontend charts** - ensure data displays properly
12. **Test projection calculations** - verify loan amortization, growth rates
13. **Implement subscription tiers** - database, limits, enforcement
14. **Test subscription limits** - all three tiers
15. **Implement onboarding** - status tracking endpoints
16. **Implement progress analytics** - net worth history, allocation
17. **Implement settings** - profile, password, preferences
18. **Test all new features** - comprehensive testing

### P3 - LOW (Enhancements)
19. **Fix double API prefix** - clean up routing
20. **Data export features** - CSV, PDF, JSON
21. **Loan calculations** - test amortization
22. **API tests** - pytest suite
23. **Plan templates** - predefined plans

### Documentation
24. **Update API docs** - Swagger completeness
25. **Create user guide** - feature documentation
26. **Update dev docs** - deployment, setup guides

**Each task includes a corresponding testing/verification step** marked with ✅

## Configuration Files

Ralph uses these files:

- **PROMPT.md** - Main instructions for what Ralph should do
- **@fix_plan.md** - Prioritized task list that Ralph updates
- **@AGENT.md** - Build and run instructions
- **status.json** - Current execution status
- **logs/** - Detailed execution logs

## Ralph Options

```bash
# Basic usage
ralph                          # Start Ralph loop

# With monitoring (recommended)
ralph --monitor                # Integrated tmux monitoring

# Custom settings
ralph --calls 50              # Limit to 50 API calls/hour
ralph --timeout 30            # 30-minute timeout per loop
ralph --verbose               # Show detailed progress
ralph --prompt custom.md      # Use different prompt file

# Session management
ralph --no-continue           # Start fresh each loop
ralph --reset-session         # Clear session context
ralph --reset-circuit         # Reset circuit breaker

# Status checks
ralph --status                # Show current status
ralph --circuit-status        # Show circuit breaker status
```

## How Ralph Works

```
┌─────────────────────────────────────────────┐
│  1. Read PROMPT.md & @fix_plan.md          │
│  2. Execute Claude Code with context        │
│  3. Track progress and update files         │
│  4. Check for completion signals            │
│  5. Repeat until done or limits reached     │
└─────────────────────────────────────────────┘
```

Ralph stops automatically when:
- All tasks in `@fix_plan.md` are marked complete
- Multiple consecutive "done" signals detected
- Circuit breaker opens (stuck in loop)
- API rate limits reached (with user prompt)
- Manual interrupt (Ctrl+C)

## Important Notes

### Backend Server
Ralph needs the backend server running to test changes:
```bash
# In separate terminal
cd backend
uvicorn server:app --reload --port 8000
```

### tmux (Optional but Recommended)
Ralph works best with tmux for integrated monitoring. On Windows with Git Bash, tmux may not be available. You can:
- Use `ralph` without `--monitor` flag
- Run `ralph-monitor` in a separate terminal
- Install WSL for full tmux support

### Rate Limiting
- Ralph defaults to 100 API calls per hour
- Adjust with `--calls` flag
- Circuit breaker prevents runaway loops
- 5-hour API limit handling with user prompts

### Session Continuity
- Ralph maintains context across loops
- Session expires after 24 hours
- Auto-resets on completion or errors
- Use `--no-continue` to disable

## Monitoring Ralph

### Live Dashboard (tmux)
```bash
ralph --monitor
```

Shows:
- Current loop count
- API calls used
- Recent log entries
- Task progress

**tmux Controls:**
- `Ctrl+B` then `D` - Detach (keeps running)
- `Ctrl+B` then `←/→` - Switch panes
- `tmux attach -t ralph-propequitylab` - Reattach

### Manual Monitoring
```bash
# Terminal 1
ralph

# Terminal 2
ralph-monitor
```

### Log Files
```bash
# View real-time logs
tail -f logs/ralph.log

# Check status
cat status.json

# Session info
cat .ralph_session
```

## Stopping Ralph

- **Ctrl+C** - Graceful shutdown
- **Circuit Breaker** - Auto-stops if stuck
- **Completion** - Auto-stops when tasks done
- **Manual** - Kill process if needed

## Troubleshooting

### Ralph won't start
```bash
# Check if in project directory
pwd  # Should be PropEquityLab root

# Verify files exist
ls PROMPT.md @fix_plan.md

# Check PATH
which ralph
```

### No progress / stuck
```bash
# Check circuit breaker status
ralph --circuit-status

# Reset if needed
ralph --reset-circuit

# Check logs
tail -f logs/ralph.log
```

### Rate limit hit
```bash
# Wait for reset (shows countdown)
# Or adjust limit
ralph --calls 200
```

### Session issues
```bash
# Clear session
ralph --reset-session

# Start fresh
ralph --no-continue
```

## Next Steps

1. **Review the plan**: Check `@fix_plan.md` to see what Ralph will do
2. **Start backend**: Run backend server in separate terminal
3. **Run Ralph**: Execute `ralph --monitor` or just `ralph`
4. **Monitor progress**: Watch the dashboard or logs
5. **Review results**: Check completed tasks and code changes

## Files Created

```
PropEquityLab/
├── PROMPT.md           # ← Ralph's main instructions
├── @fix_plan.md        # ← Task priority list
├── @AGENT.md           # ← Build/run instructions
├── status.json         # ← Current status
├── logs/               # ← Execution logs
├── ralph/              # ← Ralph source code
└── RALPH_SETUP.md      # ← This file
```

## Additional Resources

- **Ralph Documentation**: `ralph/README.md`
- **Project Status**: `docs/PHASE_0_COMPLETE_STATUS.md`
- **Backend Setup**: `docs/CLAUDE_BACKEND_SETUP_PROMPT.md`
- **Ralph GitHub**: https://github.com/frankbria/ralph-claude-code

---

**Ready to start?**

```bash
cd "C:\Users\ckr_4\01 Projects\Propequitylab\Propequitylab"
ralph --monitor  # or just: ralph
```

Ralph will work autonomously on your tasks. Monitor progress and let it build! 🚀
