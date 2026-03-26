#!/bin/bash
# Run after build — check bundle sizes
echo "=== Bundle Size Report ==="
du -sh dist/assets/*.js 2>/dev/null | sort -rh | head -20
echo ""
echo "=== Total bundle size ==="
du -sh dist/assets/ 2>/dev/null
echo ""
# Warn if any chunk > 1MB
LARGE=$(find dist/assets -name "*.js" -size +1M 2>/dev/null)
if [ -n "$LARGE" ]; then
  echo "WARNING: Large chunks found:"
  echo "$LARGE"
fi
echo "Done."
