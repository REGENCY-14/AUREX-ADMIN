import AdminShell from "@/components/admin/AdminShell";
import AuthGate from "@/components/auth/AuthGate";

/**
 * Every real admin page lives under this route group, wrapped in the
 * sidebar/topbar shell — and now gated behind AuthGate, so nothing here
 * renders (or fetches its data) until lib/auth.ts's session exists. Kept
 * separate from the true root layout (app/layout.tsx — fonts +
 * MotionConfig + PageTransition only) so the login/forgot-password/
 * reset-password pages (app/login, app/forgot-password, app/reset-
 * password) live outside this group without inheriting the admin chrome
 * or the gate itself — a signed-out visitor has to be able to reach
 * /login in the first place.
 */
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
