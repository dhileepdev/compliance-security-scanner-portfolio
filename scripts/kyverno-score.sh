#!/usr/bin/env bash
# scripts/kyverno-score.sh — Calculate compliance score from last-run.json.
set -euo pipefail

python3 - <<PYEOF
import json
with open('compliance/last-run.json') as f:
    data = json.load(f)
total_rules = len(data['rules'])
failed = sum(1 for r in data['rules'] if r.get('status') == 'fail')
passed = total_rules - failed
score = int(passed * 100 / total_rules) if total_rules > 0 else 100

data['score'] = score
data['totalRules'] = total_rules
data['passedRules'] = passed
data['failedRules'] = failed
data['lastChecked'] = __import__('datetime').datetime.utcnow().isoformat() + 'Z'

with open('compliance/last-run.json', 'w') as f:
    json.dump(data, f, indent=2)

print(score)
PYEOF
