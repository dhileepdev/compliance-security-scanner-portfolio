#!/usr/bin/env bash
# scripts/kyverno-score.sh — Calculate compliance score from last-run.json.
set -euo pipefail

python3 - <<PYEOF
import json
with open('compliance/last-run.json') as f:
    data = json.load(f)
total_passed = sum(r['passed'] for r in data['rules'])
total_failed = sum(r['failed'] for r in data['rules'])
total_rules = len(data['rules'])
score = int(total_passed * 100 / (total_passed + total_failed)) if (total_passed + total_failed) > 0 else 100

data['score'] = score
data['totalRules'] = total_rules
data['passedRules'] = total_passed
data['failedRules'] = total_failed
data['lastChecked'] = __import__('datetime').datetime.utcnow().isoformat() + 'Z'

with open('compliance/last-run.json', 'w') as f:
    json.dump(data, f, indent=2)

print(score)
PYEOF
