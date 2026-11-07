# Trivy Scanner Setup

This directory contains the Trivy security scanning configuration for the
Compliance & Security Scanner Dashboard portfolio project.

## Files

- `scan-fs.sh` — runs `trivy fs` against the repository and writes structured
  JSON results to `trivy/last-run.json`.
- `trivx-image.yaml` — reference command for `trivy image` container scanning
  (optional; not part of the CI default path).

## Running locally

```bash
# Filesystem scan (CI default)
bash scanners/scan-fs.sh

# Container image scan (optional)
trivy image --scanners vuln --format json --output trivy/image-last-run.json \
  --no-progress nginx:1.27
```

## CI integration

`.github/workflows/security-scan.yml` runs `scan-fs.sh` on every push and
pull request, then commits `trivy/last-run.json` back to the repo for the
dashboard to read.
