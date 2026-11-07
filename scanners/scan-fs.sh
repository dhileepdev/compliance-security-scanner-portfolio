#!/usr/bin/env bash
# scanners/scan-fs.sh — Run Trivy filesystem scan and write structured results.
#
# Usage: ./scanners/scan-fs.sh
# Output: trivy/last-run.json (JSON results, committed to repo by CI)
set -euo pipefail

mkdir -p trivy

trivy fs \
  --scanners vuln \
  --format json \
  --output trivy/last-run.json \
  --no-progress \
  .

echo "Trivy filesystem scan complete -> trivy/last-run.json"
