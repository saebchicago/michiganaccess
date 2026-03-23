#!/bin/bash
# Post-deploy smoke test for accessmi.org
# Usage: npm run smoke-test

echo "🔍 Running smoke tests for accessmi.org..."

SITE="https://accessmi.org"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expect="$3"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [ "$STATUS" = "$expect" ]; then
    echo "  ✅ $name (HTTP $STATUS)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $name (HTTP $STATUS, expected $expect)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "📄 Pages:"
check "Homepage" "$SITE/" "200"
check "ZIP Intelligence" "$SITE/zip-intelligence" "200"
check "Equity" "$SITE/equity" "200"
check "Financial Help" "$SITE/financial-help" "200"
check "Health Equity Atlas" "$SITE/health-equity-atlas" "200"
check "Reentry" "$SITE/reentry" "200"
check "Data Sources" "$SITE/data-sources" "200"
check "Compare" "$SITE/compare" "200"
check "Tax Comparison" "$SITE/tax-comparison" "200"
check "Support" "$SITE/support" "200"

echo ""
echo "🔌 APIs:"
check "CDC PLACES" "https://data.cdc.gov/resource/qnzd-25i4.json?\$limit=1" "200"
check "NWS Alerts" "https://api.weather.gov/alerts/active?area=MI&limit=1" "200"
check "FDA Recalls" "https://api.fda.gov/food/enforcement.json?limit=1" "200"

echo ""
echo "📊 Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
  echo "⚠️  Some checks failed! Review above."
  exit 1
else
  echo "✅ All checks passed!"
  exit 0
fi
