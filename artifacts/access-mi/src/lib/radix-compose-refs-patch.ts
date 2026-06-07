/**
 * Patched replacement for @radix-ui/react-compose-refs.
 *
 * Why: under React 19, the upstream implementation has two
 * compounding behaviors that drive an infinite render loop when a
 * Radix Select, Tooltip, DropdownMenu, or any Slot-based primitive
 * with a state-setter callback ref is rendered.
 *
 *   A) `useComposedRefs(...refs)` memoizes via
 *      `React.useCallback(composeRefs(...refs), refs)`. Radix's own
 *      internals call this with inline arrow functions, for example
 *      `useComposedRefs(forwardedRef, (node) => setItemTextNode(node),
 *      itemContext.onItemTextChange, ...)` inside SelectItemText. The
 *      arrow has a fresh identity each render, so the deps array
 *      contents change, useCallback returns a new callback, and
 *      React 19 treats the ref prop as having changed: it runs the
 *      previous ref's cleanup and re-attaches the new one with the
 *      same node. The inline state-setter fires, setState runs,
 *      everything re-renders, the callback identity rotates again,
 *      and the loop is locked in.
 *
 *   B) `composeRefs(...refs)` (used outside of hook context by
 *      `@radix-ui/react-slot`'s SlotClone) is called fresh every
 *      render. The cloned element receives a new ref callback
 *      identity each render and so React re-attaches there too.
 *
 *   C) The cleanup branch of composeRefs falls back to
 *      `setRef(refs[i], null)` for any ref that did not return its
 *      own cleanup. If that ref is a state-setter callback, the null
 *      call extends the loop on the cleanup side.
 *
 * Patch:
 *
 *   1. `useComposedRefs` stores the latest refs tuple in a useRef and
 *      returns a single stable callback. Stable callback identity
 *      means React never re-attaches just because the parent
 *      re-rendered, even if the refs included inline arrows.
 *
 *   2. `composeRefs` caches its returned callback per unique
 *      ref-identity tuple. Slot/SlotClone calls
 *      `composeRefs(forwardedRef, childrenRef)`; both of those are
 *      typically stable across renders (childrenRef is usually null
 *      and the forwarded ref is a useRef object), so the cache hits
 *      and the cloned element receives the same callback identity.
 *
 *   3. Both code paths drop the spurious `setRef(refs[i], null)`
 *      fallback in cleanup. React itself nulls callback refs on true
 *      unmount, so removing this is safe.
 *
 * Wired via Vite resolve.alias + optimizeDeps.exclude in
 * vite.config.ts so every Radix package picks up the patched
 * implementation without modifying node_modules.
 *
 * Symptom this fixes: "Maximum update depth exceeded" from
 * `setRef` -> `dispatchSetState` -> `setRef` ... on /county/* and any
 * page rendering a Radix Select or Tooltip wrapped through Slot ->
 * SlotClone -> Primitive.button (or div).
 */

import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

// Stable identity tokens for refs so the composeRefs cache can key on
// a tuple of refs without depending on argument-array identity. We use
// a WeakMap so refs that fall out of scope are garbage collected.
const refTokens = new WeakMap<object, string>();
let nextRefToken = 0;
function tokenFor(ref: PossibleRef<unknown>): string {
  if (ref === null || ref === undefined) return "n";
  const obj = ref as unknown as object;
  let token = refTokens.get(obj);
  if (!token) {
    token = String(++nextRefToken);
    refTokens.set(obj, token);
  }
  return token;
}

// Cache of composed callbacks keyed by joined ref tokens. Bounded by
// the number of distinct ref tuples the app actually constructs;
// inline arrows create new entries each render but the impact is
// limited and old entries can be evicted via the LRU window below.
const COMPOSE_CACHE_MAX = 1024;
const composeCache = new Map<string, React.RefCallback<unknown>>();

function rememberCallback(key: string, cb: React.RefCallback<unknown>) {
  composeCache.set(key, cb);
  if (composeCache.size > COMPOSE_CACHE_MAX) {
    // Evict the oldest entry (Map iteration order is insertion order).
    const firstKey = composeCache.keys().next().value;
    if (firstKey !== undefined) composeCache.delete(firstKey);
  }
}

function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  const key = refs.map(tokenFor).join("|");
  const cached = composeCache.get(key);
  if (cached) return cached as React.RefCallback<T>;

  const callback: React.RefCallback<T> = (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });

    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          }
          // See top-of-file note (C): the original setRef(refs[i],
          // null) fallback fed the loop.
        }
      };
    }
  };

  rememberCallback(key, callback as React.RefCallback<unknown>);
  return callback;
}

function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  const refsStore = React.useRef<PossibleRef<T>[]>(refs);
  refsStore.current = refs;

  const stable = React.useRef<React.RefCallback<T> | null>(null);
  if (stable.current === null) {
    stable.current = (node) => {
      const currentRefs = refsStore.current;
      let hasCleanup = false;
      const cleanups = currentRefs.map((ref) => {
        const cleanup = setRef(ref, node);
        if (!hasCleanup && typeof cleanup === "function") {
          hasCleanup = true;
        }
        return cleanup;
      });

      if (hasCleanup) {
        return () => {
          for (let i = 0; i < cleanups.length; i++) {
            const cleanup = cleanups[i];
            if (typeof cleanup === "function") {
              cleanup();
            }
            // See top-of-file note (C).
          }
        };
      }
    };
  }

  return stable.current;
}

export { composeRefs, useComposedRefs };
