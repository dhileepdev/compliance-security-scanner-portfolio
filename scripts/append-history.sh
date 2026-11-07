#!/usr/bin/env bash
# scripts/append-history.sh — Append a timestamped compliance entry to history.jsonl.
set -euo pipefail

mkdir -p compliance

python3 - <<PYEOF
import json, datetime
with open('compliance/last-run.json') as f:
    data = json.load(f)
entry = {
  "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
  "score": data["score"],
  "totalRules": data["totalRules"],
  "passedRules": data["passedRules"],
  "failedRules": data["failedRules"],
}
try:
    with open('compliance/history.jsonl') as f:
        lines = f.readlines()
except FileNotFoundError:
    lines = []
lines.append(json.dumps(entry) + "\n")
with open('compliance/history.jsonl', 'w') as f:
    f.writelines(lines)
PYEOF

cat compliance/history.jsonl
