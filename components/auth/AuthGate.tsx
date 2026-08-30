"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SpinnerIcon } from "@/components/icons";
import { restoreSession, useSession } from "@/lib/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (checked && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [checked, isAuthenticated, pathname, router]);

  if (!checked || !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-ink">
        <SpinnerIcon className="size-6 animate-spin text-gold-bright" />
      </div>
    );
  }

  return <>{children}</>;
}
