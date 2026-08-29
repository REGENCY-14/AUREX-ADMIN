"use client";

import { useSyncExternalStore } from "react";

export type Session = { email: string };

// Own namespaced key, same reasoning as lib/theme.ts's STORAGE_KEY — this
// app's storage is already isolated on its own origin, but a distinct
// name keeps it clearly labeled next to "aurex-admin-theme" if anyone
// inspects storage directly.
const STORAGE_KEY = "aurex-admin-session";

/**
 * A second scoped exception to this app's "no localStorage" rule (see
 * lib/theme.ts's own comment on the first) — a login genuinely needs to
 * survive a reload, not just a route change, so the module-level-only
 * trick lib/sidebarState.ts uses isn't enough here.
 *
 * There is no real backend behind this yet (per AdminShell's own
 * long-standing comment: "there's no real auth/session yet — that's
 * separate work"). Any non-empty email/password pair is accepted as
 * valid — this store's job is to make the login/logout/route-gating
 * *flow* real and demoable end-to-end, not to check credentials against
 * anything. Swapping in a real check later only touches LoginView's
 * submit handler; every consumer of useSession() stays the same.
 */
let cached: Session | null | undefined; // undefined = not yet read from storage
const listeners = new Set<() => void>();

function readStorage(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    // Storage can throw (private browsing / blocked storage) or hold
    // malformed JSON (a stale key from a shape this store no longer
    // writes) — either way, fail closed to "logged out" rather than
    // throwing out of a render.
    return null;
  }
}

function getSnapshot(): Session | null {
  if (cached === undefined) cached = readStorage();
  return cached;
}

// Always "logged out" for the server (and the client's very first render,
// before it can subscribe) — matching lib/theme.ts's pattern, but here
// the mismatch is the safe direction on its own: a real client session
// briefly rendering as "logged out" just means AuthGate below renders its
// redirect-in-progress blank state for one extra tick, never a flash of
// protected content to someone who isn't signed in.
function getServerSnapshot(): Session | null {
  return null;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  // Keeps every open tab in sync — signing out in one tab (or a second
  // admin signing in) is reflected here without a reload, the same
  // guarantee useSyncExternalStore already gives within a single tab.
  const handleStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cached = readStorage();
    onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function setSession(next: Session | null) {
  cached = next;
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Session still applies for this page load even if it can't persist.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Reads/writes the stubbed admin session. `login`/`logout` are the only
 * two mutators — nothing here validates a password, see the module
 * comment above.
 */
export function useSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    session,
    isAuthenticated: session !== null,
    login: (email: string) => setSession({ email }),
    logout: () => setSession(null),
  };
}
