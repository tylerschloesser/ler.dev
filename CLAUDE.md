# ler.dev

Tyler's personal site, live at **https://ty.ler.dev** (`https://ler.dev` 301-redirects there).
Vite + React + TS site served from S3 + CloudFront (us-east-1), with CloudWatch RUM. The home page is a D3 globe of Tyler's marathons, synced to a scrolling race list.

## Layout (pnpm monorepo)

- `apps/web/` — Vite + React + TS site. Styling is CSS modules plus CSS-variable tokens (`src/styles/tokens.css`, light + dark); no UI library. Runtime deps are React, `d3-geo`, `topojson-client`, `world-atlas` and `us-atlas` only — ask before adding more.
  While the globe is zoomed into the US it shows state borders (`us-atlas`) plus international borders and large lakes
  (`src/globe/north-america.json`); both are lazy-loaded with `import()` to keep them out of the main bundle.
  On desktop the globe's svg is full bleed (fixed behind the list); views fit the left-column `<figure>`, not the svg.
  Race data lives in `src/data/races.ts`.
  Watch recordings (summary, laps, km/mi splits, 50 m series of pace/HR/cadence/elevation/route) live in
  `src/data/activities/<race-id>.json`, referenced by `race.activity`. They are not imported by the UI yet;
  load them lazily with `import()` so they stay out of the main bundle.
- `scripts/` — activity importers (Python 3; the Garmin one needs `fitparse`). Both write the same JSON
  schema via `scripts/activity.py`, and each has one hand-maintained map of race id → source workout:
  - `import-garmin.py <garmin-export.zip>` — Dec 2024 onward (Garmin watch), `RACE_ACTIVITIES`.
  - `import-apple-health.py <export.zip> [--list]` — 2022 through Nov 2024 (Apple Watch Workout app, then
    WorkOutDoors), `RACE_WORKOUTS`. `--list` prints every run ≥ 20 km to spot races. Earlier races have no
    recording.
  - `build-north-america.mjs` (Node) — regenerates `apps/web/src/globe/north-america.json` from world-atlas
    `countries-50m` and Natural Earth `ne_50m_lakes` (downloaded). Run it after `pnpm install`.
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
