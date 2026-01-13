# Project Folder Structure 📁

This document outlines the organized folder structure of the PropEquityLab project. The project follows a clear separation of concerns, with dedicated directories for the frontend, backend, documentation, and tooling.

## 1. Top-Level Overview

```text
Propequitylab/
├── backend/            # FastAPI application (Python)
├── frontend/           # React application (Vite/JS)
├── docs/               # Project documentation (Categorized)
├── logs/               # Application and test logs
├── scripts/            # Automation and setup scripts
├── tests/              # Integration and end-to-end tests
├── .github/            # CI/CD workflows and GitHub templates
├── .gitignore          # Git exclusion rules
├── README.md           # Project entry point
└── yarn.lock           # Package lock file (Frontend)
```

---

## 2. Detailed Directory Breakdown

### 🔹 `backend/`
The core logic and API services.
- `models/`: SQLModel/SQLAlchemy database schemas.
- `routes/`: FastAPI route definitions (Auth, Properties, Dashboard, etc.).
- `utils/`: Helper functions and core business logic (Calculations, Security).
- `alembic/`: Database migration files.
- `server.py`: Application entry point and configuration.
- `requirements.txt`: Python dependencies.

### 🔹 `frontend/`
The user interface and client-side logic.
- `src/`:
  - `components/`: UI components (Cards, Forms, Charts).
  - `context/`: React context providers (Auth, Portfolio).
  - `pages/`: High-level page components.
  - `services/`: API client and service methods (`api.js`).
  - `utils/`: Frontend utility functions.
- `public/`: Static assets and SPA routing rules (`_redirects`).
- `package.json`: NPM dependencies and scripts.

### 🔹 `docs/`
Consolidated project documentation, organized by theme.
- `agents/`: AI agent instructions and definitions.
- `architecture/`: Data flow maps, architecture guides, and this structure doc.
- `guides/`: Checklists, deployment walkthroughs, and handoff guides.
- `plans/`: Implementation plans and status reports.
- `setup/`: Environment configuration and monitoring setup.
- `summaries/`: Completion reports and session summaries.
- `misc/`: General notes, todo lists, and miscellaneous markdown.
- `archived/`: Deprecated or historical documentation.

### 🔹 `tests/`
Testing infrastructure.
- `integration/`: Backend integration tests for specific features.
- `backend_test.py`: Standalone backend verification script.

### 🔹 `logs/`
Temporary and persistent logs.
- `backend.log`: FastAPI server logs.
- `test_output.txt`: Results from automated test runs.

### 🔹 `scripts/`
Helper scripts for developers.
- `start_ralph.sh`: Setup and initialization scripts.

---

## 3. Key Files in Root

- `README.md`: High-level project information and setup instructions.
- `.gitignore`: Ensures sensitive files (.env) and artifacts are not tracked.
- `progress.json`: Internal tracking of implementation progress.
- `status.json`: High-level status metadata.
