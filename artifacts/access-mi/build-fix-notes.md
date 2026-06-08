# Build Fix Notes

## Lockfile drift (4463a4a124 → HEAD, vite/rollup lines only)

```
+    '@replit/vite-plugin-cartographer':
+    '@replit/vite-plugin-dev-banner':
+    '@replit/vite-plugin-runtime-error-modal':
+    '@tailwindcss/vite':
+    '@vitejs/plugin-react':
+    vite:
+  rollup>@rollup/rollup-android-arm-eabi: '-'
+  rollup>@rollup/rollup-android-arm64: '-'
+  rollup>@rollup/rollup-darwin-arm64: '-'
+  rollup>@rollup/rollup-darwin-x64: '-'
+  rollup>@rollup/rollup-freebsd-arm64: '-'
+  rollup>@rollup/rollup-freebsd-x64: '-'
+  rollup>@rollup/rollup-linux-arm-gnueabihf: '-'
+  rollup>@rollup/rollup-linux-arm-musleabihf: '-'
+  rollup>@rollup/rollup-linux-arm64-gnu: '-'
+  rollup>@rollup/rollup-linux-arm64-musl: '-'
+  rollup>@rollup/rollup-linux-loong64-gnu: '-'
+  rollup>@rollup/rollup-linux-loong64-musl: '-'
+  rollup>@rollup/rollup-linux-ppc64-gnu: '-'
+  rollup>@rollup/rollup-linux-ppc64-musl: '-'
+  rollup>@rollup/rollup-linux-riscv64-gnu: '-'
+  rollup>@rollup/rollup-linux-riscv64-musl: '-'
+  rollup>@rollup/rollup-linux-s390x-gnu: '-'
+  rollup>@rollup/rollup-linux-x64-musl: '-'
+  rollup>@rollup/rollup-openbsd-x64: '-'
+  rollup>@rollup/rollup-openharmony-arm64: '-'
+  rollup>@rollup/rollup-win32-arm64-msvc: '-'
+  rollup>@rollup/rollup-win32-ia32-msvc: '-'
+  rollup>@rollup/rollup-win32-x64-gnu: '-'
+  rollup>@rollup/rollup-win32-x64-msvc: '-'
+      '@replit/vite-plugin-cartographer':
+      '@replit/vite-plugin-dev-banner':
+      '@replit/vite-plugin-runtime-error-modal':
+      '@vitejs/plugin-react':
+        version: 5.2.0(vite@7.3.3(...))
+      vite:
+      '@replit/vite-plugin-cartographer':
+      '@replit/vite-plugin-runtime-error-modal':
+      '@tailwindcss/vite':
+        version: 4.3.0(vite@7.3.3(...))
```

## Summary

The lockfile at the last green commit (4463a4a124, April 9 2026) did not contain
vite@7.x or rollup@4.60.x entries. The Expo mobile app feature branch (merged
around May 18) added pnpm-workspace.yaml with a catalog section including
`vite: ^7.3.2`, which resolved to vite@7.3.3 + rollup@4.60.3. Rollup 4.60.x
enforces source phase import semantics and rejects Vite's internal reference to
`vite/modulepreload-polyfill` in index.html unless it is marked external or the
polyfill is disabled.

## Fix applied (superseded — see below)

`artifacts/access-mi/vite.config.ts`: added `modulePreload: { polyfill: false }`
inside the existing `build:` block. This removes the polyfill injection entirely
so Rollup never sees the source phase import that triggers the error.

## Revised fix

The `modulePreload: { polyfill: false }` workaround was reverted. Root cause is
Rollup 4.60.x misclassifying Vite-internal module references as source-phase
imports. pnpm-lock.yaml could not supply a GREEN_ROLLUP from git history (the
lock file predates the green commit), so the pin target was derived as the
highest published 4.59.x release that satisfies Vite 7.3.3's `^4.43.0` rollup
dependency.

Verified on npm: highest 4.59.x is **4.59.1** (only 4.59.0 and 4.59.1 exist).
Vite installed: 7.3.3, rollup dep: `^4.43.0`. 4.59.1 satisfies the range.

Change: `pnpm-workspace.yaml` overrides block, added `rollup: "4.59.1"` (exact
pin, no caret). Local build exits 0, dist/public/index.html and assets/ present,
no `vite/modulepreload-polyfill` or `/src/main.tsx` refs in dist, curl
/civic-data returns HTML.
