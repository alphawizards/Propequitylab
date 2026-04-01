# Decision: Railway (backend) + Cloudflare Pages (frontend)

**Date:** 2026-04-01

## Decision

Deploy the FastAPI backend to Railway and the React frontend to Cloudflare Pages.

## Context

The project previously used AWS App Runner (ap-southeast-2) for the backend. App Runner was replaced with Railway to simplify deployment operations — Railway provides GitHub-native auto-deploy without requiring AWS credentials in CI, and the health check + restart policy config in `railway.toml` is simpler to maintain.

## Alternatives Considered

- **AWS App Runner** — used previously, auto-scaling, but requires IAM credentials management and the deployment pipeline was fragile (`deploy-backend.yml` referenced a non-existent workflow)
- **Fly.io** — good DX, but Railway was already familiar and `railway.toml` was in the repo
- **Render** — viable, but Railway's GitHub integration and health check config were already in place
- **Vercel (frontend)** — strong Next.js story, but project uses Create React App (CRACO); Cloudflare Pages is already live

## Reasoning

- Railway auto-deploys on push to `main` via GitHub integration — no workflow file required for backend deploys
- `railway.toml` runs `alembic upgrade head` before starting the server — migrations are atomic with deploys
- Cloudflare Pages provides global CDN, zero cold starts for static assets, and Wrangler CLI deploys from CI
- Both services have free/low-cost tiers appropriate for the current scale

## Trade-offs Accepted

- Railway has cold start latency on the free tier (mitigated by Railway's sleep-prevention setting)
- No explicit backend deploy step in `.github/workflows/deploy.yml` — Railway watches the GitHub repo directly
- Two separate deployment dashboards (Railway + Cloudflare Pages) instead of a unified platform
