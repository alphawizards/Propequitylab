# Handoff: Fix Cloudflare Pages Deployment Failure (Error 10021)

**Audience:** Execution agent (DevOps / frontend build)
**Repo:** `C:\Users\ckr_4\01 Web Projects\Propequitylab`
**Branch:** `main`
**Priority:** Blocking — production deploys are currently failing.

---

## 1. Context

The `deploy-frontend` job in `.github/workflows/deploy.yml` runs `wrangler pages deploy build` from `frontend/` and is failing with Cloudflare error **10021**:

> Invalid `_redirects` configuration: Line 1: Infinite loop detected in this rule. This would cause a redirect to strip `.html` or `/index` and end up triggering this rule again.

### Root cause (verified, not guessed)

- `frontend/public/_redirects` contains exactly one line:
  ```
  /* /index.html 200
  ```
- Cloudflare Workers' asset pipeline now auto-strips `.html` and `/index` from request paths. With that behaviour, the rule above rewrites `/anything` → `/index.html` → (stripped to `/`) → `/index.html` → … loop. Cloudflare detects this statically and rejects the deploy.
- The **correct** mechanism on the modern Workers assets binding is `not_found_handling: "single-page-application"` under `[assets]`.
- The repo-root `wrangler.toml` already has this set correctly **but is not the file CI uses.** The GitHub Actions job sets `workingDirectory: ./frontend`, which makes `wrangler` pick up `frontend/wrangler.jsonc` — and that file does NOT have the setting. That is why the misconfiguration persists despite the root file looking fine.

### React Router dependency

`frontend/src/App.js` uses `BrowserRouter` from `react-router-dom` — so SPA deep-link fallback MUST keep working after the fix. The `not_found_handling: "single-page-application"` setting provides exactly that: any unresolved path returns `index.html` with HTTP 200.

---

## 2. Files involved (verified paths)

| Path | Current state | Action |
|------|---------------|--------|
| `frontend/wrangler.jsonc` | missing `not_found_handling` | **EDIT** — add the setting |
| `frontend/public/_redirects` | contains the looping rule | **DELETE** |
| `frontend/build/_redirects` | stale build artefact, same content | **DELETE** (will be regenerated clean on next build) |
| `wrangler.toml` (repo root) | already correct, but unused by CI | leave as-is |
| `.github/workflows/deploy.yml` | no change needed | leave as-is |

### Current `frontend/wrangler.jsonc` (for reference)

```jsonc
{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "propequitylab",
    "compatibility_date": "2026-01-08",
    "assets": {
        "directory": "./build"
    }
}
```

### Target `frontend/wrangler.jsonc`

```jsonc
{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "propequitylab",
    "compatibility_date": "2026-01-08",
    "assets": {
        "directory": "./build",
        "not_found_handling": "single-page-application"
    }
}
```

---

## 3. Execution steps

1. Delete `frontend/public/_redirects`.
2. Delete `frontend/build/_redirects` if it exists locally (do not fail the task if absent — CI rebuilds `build/`).
3. Edit `frontend/wrangler.jsonc` to add `"not_found_handling": "single-page-application"` inside the `assets` object. Preserve existing formatting (4-space indent, trailing newline).
4. Run a local build to confirm the source `_redirects` is gone and nothing else regenerates it:
   ```bash
   cd frontend
   npm run build
   test ! -f build/_redirects && echo "OK: no _redirects in build"
   ```
5. Stage and commit as a single commit (do NOT bundle unrelated changes):
   ```
   fix(deploy): resolve Cloudflare error 10021 by replacing _redirects with assets SPA fallback

   - Remove frontend/public/_redirects (looped under Workers .html stripping)
   - Add not_found_handling: single-page-application to frontend/wrangler.jsonc
   ```
6. Push to `main` only if the user has authorized a push for this task. Otherwise stop after commit and report.

---

## 4. Why not the alternatives

| Alternative | Why rejected |
|------------|--------------|
| Keep `_redirects` but rewrite the rule | No non-self-referential `/* → /index.html` variant exists under the current Workers asset pipeline. Any SPA-fallback rule loops. |
| Fall back to legacy Pages behaviour | Goes backwards against Cloudflare's migration to Workers Assets; a dead end. |
| Write a custom Worker to serve `index.html` on 404 | Overkill. `not_found_handling` is the first-party one-line solution. |
| Only edit the root `wrangler.toml` | CI uses `frontend/wrangler.jsonc`, so editing the root file alone would not fix the failing deploy. |

---

## 5. Verification (must complete before declaring done)

### Pre-push

- `frontend/public/_redirects` is gone. Confirmed via file listing.
- `frontend/wrangler.jsonc` parses as valid JSONC and contains `not_found_handling`.
- `npm run build` in `frontend/` completes with zero errors.
- `frontend/build/_redirects` is NOT present after the build.
- Optional dry-run (needs Cloudflare creds locally — skip if unavailable):
  ```bash
  cd frontend && npx wrangler deploy --dry-run
  ```

### Post-push (once CI runs)

- `deploy-frontend` GitHub Actions job completes green. No mention of error `10021`.
- Against the deployed URL:
  - `curl -sI https://propequitylab.pages.dev/dashboard` → `HTTP/2 200`, `content-type: text/html`.
  - `curl -sI https://propequitylab.pages.dev/properties/does-not-exist` → `HTTP/2 200` (SPA fallback), body is `index.html`.
  - Hard-refresh a deep link in a browser — React Router hydrates without a 404 flash.

If any verification step fails, STOP and report. Do not iterate blindly.

---

## 6. Out of scope for this task (flagged for follow-up)

Secondary items from the original brief — **do not attempt in this task**, file as follow-up issues:

- `npm audit fix` in `frontend/` (40 vulns; 1 critical, 22 high, 7 moderate, 10 low). High risk of breaking CRA/CRACO via transitive major bumps; needs its own PR with careful testing.
- Deprecated-dep cleanup: `eslint@8`, `glob@7`, `rimraf@3`, `rollup-plugin-terser`, `svgo@1`, `workbox-google-analytics@6`, legacy `@babel/plugin-proposal-*` → `@babel/plugin-transform-*`. Most are pinned by CRA 5 / CRACO and will only resolve cleanly via a bundler migration (Vite).

---

## 7. Success criteria (copy into PR description)

- [ ] `frontend/public/_redirects` deleted.
- [ ] `frontend/wrangler.jsonc` has `not_found_handling: "single-page-application"` under `assets`.
- [ ] Local `npm run build` succeeds and produces no `_redirects` in `build/`.
- [ ] `deploy-frontend` CI job is green on `main`.
- [ ] Deep-link routes return 200 with `index.html` content on the live site.
