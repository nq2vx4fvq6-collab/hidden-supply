# Repository Instructions

`CLAUDE.md` in this directory is the canonical, up-to-date agent guide for this repository. Read it before making changes, and follow it even when working as Codex, Cursor, Claude Code, or another AI coding agent.

Important highlights from `CLAUDE.md`:

- The git root and all production app work is `apps/web/`. Run dev, build, test, git, and `gh` commands from here. The outer `UrbanSupplyUI/` only holds `apps/`, `docs/`, and `scripts/`.
- Never commit or push directly to `main`, never merge PRs yourself, and never use broad staging commands like `git add .` or `git add -A`.
- Set `--author="Steve <steventsvik@gmail.com>"` on every commit. No AI attribution in commits or PR bodies.
- Group related changes into one branch — do not micro-branch.
- After opening a PR, stop and wait for the owner to confirm the merge before doing anything else.
- Treat Supabase as the production source of truth; `data/*.json` are legacy/dev fallback only. Vercel Blob is fully removed — do not reintroduce it.
- New env vars on Vercel require a redeploy to take effect in serverless functions; tell the owner what you added.
