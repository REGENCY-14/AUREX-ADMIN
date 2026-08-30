import AdminShell from "@/components/admin/AdminShell";
import { getPendingApplicationCount } from "@/lib/applications";

/**
 * Every real admin page lives under this route group, wrapped in the
 * sidebar/topbar shell. Kept separate from the true root layout
 * (app/layout.tsx — fonts + MotionConfig + PageTransition only) so a
 * future login screen (per the brief, separate/still-undecided work) can
 * live outside this group without inheriting the admin chrome.
 */
export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const pendingApplications = await getPendingApplicationCount();
  return <AdminShell pendingApplications={pendingApplications}>{children}</AdminShell>;
}
