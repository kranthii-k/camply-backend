#!/usr/bin/env bash
# Security checks: audit, TypeScript, ESLint
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ npm audit (high+critical)"
npm audit --audit-level=high --omit=dev
echo "✔ npm audit passed"

echo "▶ TypeScript compile check"
npx tsc --noEmit
echo "✔ TypeScript passed"

echo "▶ ESLint (src only, excluding tests)"
npx eslint src --ignore-pattern "**/__tests__/**" --ignore-pattern "**/__mocks__/**" --ignore-pattern "**/tests/**" --max-warnings=10
echo "✔ ESLint passed"
