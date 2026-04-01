# Decision: Migrate from custom JWT to Clerk

**Date:** 2026-04-01

## Decision

Replace the custom HS256 JWT auth system (`auth.py`) with Clerk Core 2 (`@clerk/clerk-react` v5, `clerk_auth.py`).

## Context

The project originally used python-jose for HS256 JWT signing with password hashing via bcrypt. This required maintaining login/register routes, token refresh logic, email verification, and password reset flows in-house. The surface area for auth bugs was large.

## Alternatives Considered

- **Keep custom JWT** — full control, no vendor dependency, but high maintenance burden (token refresh, email verification, password reset, MFA all DIY)
- **Auth0** — mature, but expensive at scale and heavier SDK
- **Supabase Auth** — viable, but project already uses Neon for database; mixing auth and DB providers was unnecessary
- **Clerk** — purpose-built auth SDK with pre-built UI components, JWKS verification, webhooks for user lifecycle sync, and an MFA/social login story without extra code

## Reasoning

Clerk was chosen because:
1. Pre-built `<SignIn>` and `<SignUp>` components eliminate all auth UI maintenance
2. JWKS-based verification is stateless — no shared secret rotation risk
3. Webhook support (`user.created/updated/deleted`) keeps the local PostgreSQL in sync without polling
4. The dual-mode toggle (`CLERK_JWKS_URL` env var) allows rolling back to legacy JWT if needed

## Trade-offs Accepted

- Vendor dependency on Clerk's API availability (mitigated by 1h JWKS cache)
- `JWT_SECRET_KEY` must still be set in Railway env vars even in Clerk mode (legacy code runs at import time)
- Clerk's free tier limits (10,000 MAU) are sufficient for current scale
