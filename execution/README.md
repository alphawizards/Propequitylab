# Execution

This directory contains deterministic Python scripts. These serve as the "Layer 3" of the architecture, handling the actual execution of tasks.

## Guidelines
- Scripts should be idempotent where possible.
- Use `../.env` for credentials.
- Handle errors gracefully.
- Output usually goes to `../.tmp/` or cloud deliverables.
