# ler.dev

Tyler's personal site, live at **https://ty.ler.dev** (`https://ler.dev` 301-redirects there).
Vite + React + TS site served from S3 + CloudFront (us-east-1), with CloudWatch RUM. The home page is a D3 globe of Tyler's marathons, synced to a scrolling race list.

## Layout (pnpm monorepo)

- `apps/web/` — Vite + React + TS site. Styling is CSS modules plus CSS-variable tokens (`src/styles/tokens.css`, light + dark); no UI library. Runtime deps are React, `d3-geo`, `topojson-client` and `world-atlas` only — ask before adding more. Race data lives in `src/data/races.ts`.
- `infra/` — AWS CDK app. Stacks: `LerDevSite` (bucket, cert, CloudFront, DNS, RUM) and `LerDevGithubOidc` (GitHub Actions deploy role).
- `e2e/` — Playwright tests that run against the live site.
- `.github/workflows/site.yml` — build + deploy + e2e on every push to `main`. Do not rename it to `deploy.yml`: that path has a stale Actions registration from the repo's pre-reset history and never runs.

## Commands

Node 24 (`.nvmrc`) and pnpm 12 (`packageManager`). Run `nvm use` first.

- `pnpm install`
- `pnpm dev` — local dev server
- `pnpm build` / `pnpm lint` / `pnpm typecheck`
- `pnpm test` — vitest unit tests (web)
- `pnpm e2e` — Playwright (desktop + Pixel 7 projects) against `BASE_URL` (default https://ty.ler.dev); `EXPECTED_SHA` optionally asserts the deployed git SHA. Tag viewport-independent infra tests `@desktop-only`. To test UI before pushing: `pnpm build && pnpm --filter web preview`, then `BASE_URL=http://localhost:4173 pnpm e2e`
- `pnpm infra:diff` / `pnpm infra:deploy <Stack>`

## Workflow

- **Pushing `main` deploys to production.** Commit early and often; push after every commit.
- Uptime is not a priority — experiment, fail fast, fix forward.
- No branches, PRs, worktrees, or force pushes. Stay on `main`.
- After a push: `gh run watch` the deploy. If it fails, read the logs (`gh run view --log-failed`) and fix forward immediately.
- Verify user-visible changes with Playwright against https://ty.ler.dev (the e2e suite, plus the playwright-cli skill for ad-hoc checks).

## AWS

- `AWS_PROFILE=admin` is set via `.claude/settings.json`. Account 063257577013, region us-east-1.
- The account is shared with other live projects: only touch `LerDev*` / `ler-dev*` resources. Never modify other records in the `ler.dev` / `ty.ler.dev` hosted zones, and never modify the shared GitHub OIDC provider (it is imported, not owned).
- All infra changes go through CDK. CI deploys `LerDevSite`; `LerDevGithubOidc` is deployed from a laptop only.
- If the SSO session has expired, ask Tyler to run `aws sso login --profile admin`.
