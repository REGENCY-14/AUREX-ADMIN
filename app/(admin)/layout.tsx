import AdminShell from "@/components/admin/AdminShell";
import AuthGate from "@/components/auth/AuthGate";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
