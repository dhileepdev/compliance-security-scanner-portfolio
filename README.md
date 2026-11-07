# Compliance & Security Scanner Dashboard

Standalone portfolio project: Kyverno CEL compliance policies, Trivy security
scanning, GitHub Actions CI/CD, and a Next.js dashboard on Vercel showing
compliance score, rule pass/fail, vulnerability counts by severity, and trend.

## What it demonstrates

- **Kyverno CEL compliance policies**: ValidatingPolicy rules for team labels,
  image tags, encryption at rest, public S3, and resource limits — evaluated
  offline with `kyverno apply` (no cluster required).
- **Trivy security scanning**: Filesystem vulnerability scanning with results
  aggregated by severity.
- **Secure CI/CD from scratch**: GitHub Actions runs policy scans + Trivy on
  every push/PR, writes results back to the repo (`contents: write` + `[skip
  ci]` to prevent loops), fork PRs scan but skip write-back.
- **Realtime dashboard** (Vercel): polls GitHub API every 30s for compliance
  and vulnerability results, shows trend chart from scan history, falls back
  to last-known state (Vercel Blob) when APIs are unreachable.

## Repository layout

```
policies/
  require-team-label.yaml       # Kyverno CEL ValidatingPolicy
  disallow-latest-tag.yaml
  require-encryption-at-rest.yaml
  no-public-s3.yaml
  require-resource-limits.yaml
fixtures/
  manifest-good.yaml            # Compliant pod manifest
  manifest-bad.yaml             # Non-compliant pod manifest (fails 3 rules)
scanners/
  scan-fs.sh                    # Trivy filesystem scan script
  trivx-image.yaml              # Container image scan reference
  README.md
scripts/
  aggregate-kyverno.sh          # CI: run policies, aggregate results
  kyverno-score.sh              # CI: calculate compliance score
  append-history.sh             # CI: append to compliance history
.github/
  workflows/
    security-scan.yml           # CI/CD: policy scan + Trivy + write-back
dashboard/                      # Next.js dashboard (App Router, Tailwind v4)
  app/
    page.tsx                    # Server-rendered shell with polling
    api/
      compliance/route.ts       # Read compliance/last-run.json from GitHub
      vulnerabilities/route.ts  # Read trivy/last-run.json from GitHub
      history/route.ts          # Read compliance/history.jsonl from GitHub
  components/
    ComplianceScore.tsx
    RuleTable.tsx
    VulnerabilityCard.tsx
    TrendChart.tsx
    LastUpdated.tsx
  lib/
    blob.ts                     # getState/setState via Vercel Blob
    poll.ts                     # startPoll: 30s polling with stale fallback
  e2e/
    smoke.test.ts               # Playwright: all cards render
README.md
```

## Prerequisites

- [kyverno](https://kyverno.io/) (for local policy testing)
- [trivy](https://trivy.dev/) (for local vulnerability scanning)
- [Node.js](https://nodejs.org/) >= 20

## Local development

### 1. Test Kyverno policies locally

```bash
# Compliant manifest passes all rules
kyverno apply policies/require-team-label.yaml --resource fixtures/manifest-good.yaml

# Non-compliant manifest fails team label, latest tag, and resource limits
kyverno apply policies/require-team-label.yaml --resource fixtures/manifest-bad.yaml
kyverno apply policies/disallow-latest-tag.yaml --resource fixtures/manifest-bad.yaml
kyverno apply policies/require-resource-limits.yaml --resource fixtures/manifest-bad.yaml
```

### 2. Run Trivy scan locally

```bash
bash scanners/scan-fs.sh
# Output: trivy/last-run.json
```

### 3. Dashboard (Next.js)

```bash
cd dashboard
cp .env.example .env.local   # fill in GITHUB_PAT, BLOB_READ_WRITE_TOKEN
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build
npm test                     # vitest unit tests
npx playwright test          # Playwright e2e smoke test
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, add a new project and set the **root directory** to `dashboard/`.
3. Add these environment variables in Vercel project settings:

| Variable | Purpose |
|----------|---------|
| `GITHUB_PAT` | GitHub personal access token (`repo` scope) for reading Actions API and repo contents |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token for state persistence |
| `GITHUB_REPOSITORY` | Set automatically by Vercel when connected to GitHub |

4. Deploy. The dashboard polls every 30s and deploys on every push to `dashboard/`.

## GitHub Secrets (for CI/CD)

Add these to your GitHub repository Settings → Secrets and variables → Actions:

| Secret | Purpose |
|--------|---------|
| `GITHUB_TOKEN` | Auto-provided by GitHub (has `contents: read`; `commit-results` job requests `contents: write`) |

The `commit-results` job only runs on push to `main` (not PRs from forks) and
includes `[skip ci]` in its commit message to prevent infinite re-trigger loops.

## E2E smoke test

```bash
cd dashboard
npx playwright install chromium   # one-time browser install
npx playwright test               # runs e2e/smoke.test.ts
```

The smoke test loads the dashboard and asserts all three cards (Compliance
Score, Rules, Vulnerabilities) render.

## License

MIT