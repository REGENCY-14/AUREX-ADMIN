"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SpinnerIcon } from "@/components/icons";
import { useSession } from "@/lib/auth";

/**
 * Wraps every route under the (admin) group (see that layout.tsx) —
 * bounces a signed-out visitor to /login?next=<where they were headed>
 * before AdminShell (and the real data underneath it) ever renders.
 *
 * useSession()'s server/first-render snapshot is always "logged out"
 * (see lib/auth.ts) — the same value this gate treats as "not allowed
 * in yet" — so there's no frame where protected content is visible to
 * someone who isn't actually signed in, only (at most) one extra tick of
 * this spinner while the real client-side session is read from storage.
 *
 * This is a client-side-only stub, same honesty as everywhere else this
 * app fakes a backend: it stops someone from casually clicking around
 * while logged out, it is not a security boundary (no server, no
 * cookies, nothing stopping a visitor from opening devtools and setting
 * the localStorage key themselves). A real deployment would gate this
 * at the server/middleware layer instead.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSession();

  useEffect(() => {
    if (!isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-ink">
        <SpinnerIcon className="size-6 animate-spin text-gold-bright" />
      </div>
    );
  }

  return <>{children}</>;
}
