# CLAUDE.md

This file is the canonical agent guide for the **Hidden Supply / urban-supply-ui-app** repository. Any AI coding agent (Claude Code, Codex, Cursor, etc.) working in this repo must read it first and follow it exactly. It reflects the owner's established workflow.

@AGENTS.md

## Project Overview

Hidden Supply is a private reseller-network UI for tracking inventory across marketplaces (Depop, eBay, StockX) with an admin panel.

- **Production URL:** https://hidden-supply.vercel.app
- **GitHub repo:** `nq2vx4fvq6-collab/hidden-supply`
- **Vercel project:** `urban-supply-ui-app`
- **App directory:** `apps/web/` — this is the git root. The outer `UrbanSupplyUI/` only holds `apps/`, `docs/`, and `scripts/`. Run **all** dev, build, git, and `gh` commands from `apps/web/`.

---

## Dev Commands

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build + type check
npm run lint     # ESLint
# Deployment is automatic: merge to main → Vercel production deploy
```

Run `npm run build` before committing to catch type errors.

## Tech Stack

- **Runtime:** Next.js 16.1 (App Router) · React 19.2 · TypeScript 5
- **Storage:** Supabase Postgres (`@supabase/supabase-js`) — project `khxzyboqonwajhnrewoc`, region us-east-2
- **Image storage:** Supabase Storage `product-images` bucket (public read, service-role write/delete). Vercel Blob is fully removed; do not reintroduce it.
- **Optional integrations:** Google Sheets sync (`googleapis`), SharePoint Excel sync, `xlsx` import/export
- **Styling:** Tailwind CSS v4 via `@import "tailwindcss"` in `app/globals.css` (no `tailwind.config.js`)
- **Charts:** `recharts`

---

## Git Workflow — CRITICAL

**Never commit or push directly to `main`.** All changes go through a PR that the owner merges on GitHub. **Never merge a PR yourself.**

### Branches

Create one branch per **cohesive unit of work** — group related changes together. Do not micro-branch. A small addition to an existing feature area belongs on the same branch as that feature.

Branch naming:
- `feature/<name>` — new user-facing functionality
- `fix/<name>` — bug fixes, visual corrections
- `chore/<name>` — tooling, config, docs
- `refactor/<name>` — internal restructuring with no behavior change

Before starting any task: briefly restate the task, decide the branch name and state it explicitly, then check out from the latest `main`.

### Complete sequence — follow exactly

```bash
git checkout main
git pull origin main
git checkout -b <branch-name>
# make all changes, then:
git add <specific-files>   # never git add -A or git add .
git commit --author="Steve <steventsvik@gmail.com>" -m "<type>: <short description>"
git push origin <branch-name>
gh pr create --base main --head <branch-name> --title "..." --body "$(cat <<'EOF'
## Summary
- Bullet 1
- Bullet 2

## Test plan
- [ ] Item 1
EOF
)"
```

After opening the PR, **STOP and wait** for the owner to confirm the merge. Do not push more commits to the branch unless asked. Do not open a new PR until the previous one is confirmed merged.

### Commit rules

- Always set `--author="Steve <steventsvik@gmail.com>"` on every commit.
- Do **not** include `Co-Authored-By`, `Generated with`, or any AI attribution in commits or PR descriptions.
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Stage specific files by name — never `git add -A` or `git add .` (risk of leaking secrets / generated files).
- Never stage `.env*`, `.next/`, `.vercel/`, `node_modules/`, or `*.tsbuildinfo`.

### PR timing

The owner sometimes merges a PR before you finish pushing all commits. If that happens:
- Do **not** force-push or amend.
- Cherry-pick the missing commits onto a new branch and open a new PR.

### When the owner says "I merged it"

Pull the updated `main` and create a fresh branch before doing more work:
```bash
git checkout main
git pull origin main
git checkout -b <new-branch-name>
```

### Deployment

Auto-deploy: GitHub → Vercel deploys production on every merge to `main`. After every merge, confirm auto-deploy triggered. If the owner confirms it failed, run a manual deploy from `apps/web/`:
```bash
vercel --prod
```

New env vars added in the Vercel dashboard require a redeploy to take effect in serverless functions. Always redeploy after adding vars, and tell the owner what was added.

---

## Architecture

### Storage
- **Production:** Supabase Postgres via `lib/supabase.ts` (service-role client, server-only, RLS bypassed). Uses `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
- **Schema reference:** `scripts/supabase-schema.sql` (in the outer repo folder).
- **Legacy fallback:** `data/inventory.json`, `data/marketplace.json` are dev seed only — Supabase is the source of truth.
- **Local-only image fallback:** dev image uploads can land in `public/uploads/products/` when Supabase Storage is unavailable.

### Auth (admin)
- `proxy.ts` at the project root (Next.js 16 convention, replaced the old `middleware.ts`) protects `/admin/*` (except `/admin/login`) and write API endpoints (`/api/upload`, `/api/import`, `/api/export`, and any non-GET `/api/items*`). Exports `proxy()` and `config`.
- Token = `SHA-256(password:secret)` stored in `httpOnly` cookie `us-admin-auth`.
- Bot/scraper signatures are blocked by User-Agent — note `curl/` is in the blocklist, so curl-based tests must pass a real browser UA.
- Env vars: `ADMIN_PASSWORD`, `SESSION_SECRET` (defaults exist for dev only — required in prod).

### App Routes
```
app/
  page.tsx                     # Public storefront entry
  layout.tsx, loading.tsx
  globals.css                  # Tailwind v4 import
  brand/, category/, item/     # Public catalog browse
  community/                   # Community pages
  login/                       # Auth UI
  admin/                       # Protected by proxy.ts
    items/                     # Inventory CRUD
    accounts/                  # Marketplace account manager
    sales/                     # Sales view
    import-export/             # Excel/Sheets I/O
    sync/, sharepoint-callback/
  api/
    auth/, items/, marketplace/, upload/
    import/, export/
    cron/, stockx/
```

### Key conventions
- Source dirs sit at the project root: `app/`, `components/`, `lib/`. No `src/`.
- Components are organized by domain: `components/{admin,auth,catalog,marketplace,ui}`.
- Service modules live in `lib/services/` (one per integration: `inventory.ts`, `marketplace.ts`, `ebay.ts`, `googleSheets.ts`, `sharepoint.ts`, `excel.ts`, `filters.ts`).
- Types in `lib/types/`, config constants in `lib/config/`.
- Admin items pages use `force-dynamic` + `noStore` for cache correctness — do not weaken without checking PRs #4 and #5.

---

## Environment Variables

Set in Vercel project settings; locally in `apps/web/.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `ADMIN_PASSWORD` | Yes (prod) | Admin login password |
| `SESSION_SECRET` | Yes (prod) | HMAC secret for auth tokens |
| `GOOGLE_SHEETS_ID` | Optional | Inventory sync |
| `GOOGLE_CREDENTIALS` | Optional | Google service-account JSON for Sheets |
| `BLOB_READ_WRITE_TOKEN` | Legacy | Vercel Blob — kept for compatibility, not primary storage |

If you add an env var, API key, or secret to Vercel, **tell the owner exactly what was added** and trigger a redeploy.

---

## Code Principles

- Read files before modifying them. Never suggest changes to code you haven't read.
- Import shared constants and utilities — never scatter magic numbers or duplicate helpers.
- Prefer editing existing files over creating new ones.
- Don't add backwards-compatibility shims for removed code. Delete cleanly.
- Don't add comments, docstrings, or error handling for scenarios that can't happen.
- Don't add features, refactors, or "improvements" beyond what was asked.
- If an error is being silently swallowed by a `.catch()` or `try/catch`, flag it.

## Communication Style

- Be concise. No filler, no preamble, no trailing summaries.
- Lead with the action or answer — not the reasoning.
- Don't restate what the user said. Just do it.
- When in doubt about scope, do less and ask.

## General Caution

- Destructive actions (delete, reset, force push) require explicit user confirmation first.
- Pushing to a remote requires explicit user confirmation unless pre-authorized for the current task.
- Never use `git add -A` / `git add .` / `--no-verify` / `--amend` of pushed commits.
