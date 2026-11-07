#!/usr/bin/env bash
# scripts/aggregate-kyverno.sh — Run Kyverno CEL policies against fixtures and
# aggregate pass/fail per rule into compliance/last-run.json.
set -euo pipefail

mkdir -p compliance
echo '{"rules":[]}' > compliance/last-run.json

for policy in policies/*.yaml; do
  name=$(basename "$policy" .yaml)
  echo "::group::Policy: $name"

  result=$(kyverno apply "$policy" \
    --resource fixtures/manifest-good.yaml \
    --resource fixtures/manifest-bad.yaml 2>&1 || true)

  passed=$(echo "$result" | grep -oE 'pass: [0-9]+' | grep -oE '[0-9]+' | head -1 || echo 0)
  failed=$(echo "$result" | grep -oE 'fail: [0-9]+' | grep -oE '[0-9]+' | head -1 || echo 0)

  python3 - <<PYEOF
import json
with open('compliance/last-run.json') as f:
    data = json.load(f)
data['rules'].append({
  "name": "$name",
  "policy": "$policy",
  "passed": int($passed),
  "failed": int($failed),
  "status": "fail" if int($failed) > 0 else "pass",
  "remediation": "Review the policy rule and update the manifest to satisfy the check."
})
with open('compliance/last-run.json', 'w') as f:
    json.dump(data, f, indent=2)
PYEOF

  echo "policy=$name passed=$passed failed=$failed"
  echo "::endgroup::"
done
