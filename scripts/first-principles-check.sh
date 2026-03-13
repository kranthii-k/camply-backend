#!/usr/bin/env bash
# First-principles structural checks
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0; FAIL=0

check() {
  local desc=$1; shift
  if eval "$@" &>/dev/null 2>&1; then
    echo "✔ $desc"; ((PASS++)) || true
  else
    echo "✘ $desc"; ((FAIL++)) || true
  fi
}

check "No .env committed"              "! git ls-files | grep -E '^\.env$'"
check "Helmet middleware present"      "grep -rl 'helmet' src/"
check "CORS middleware present"        "grep -rl 'cors' src/"
check "Rate-limit middleware present"  "grep -rl 'rateLimit\|rate-limit' src/"
check "httpOnly cookie on refresh"     "grep -rl 'httpOnly' src/"
check "No console.log in production"   "! grep -rn 'console\.log' src/ --include='*.ts' | grep -v '//' | grep -q ."
check "No hardcoded secrets"           "! grep -rEn '(secret|password|apikey)\s*=\s*[\"'\''][^\"'\'']{6,}' src/ --include='*.ts' | grep -q ."
check "No passwordHash leak in response" "! grep -rn 'passwordHash' src/controllers/ --include='*.ts' | grep 'res\.\(json\|send\)' | grep -q ."
check "Error handler wired"            "grep -rl 'errorHandler\|error.*middleware' src/"

echo ""
echo "First-principles: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
