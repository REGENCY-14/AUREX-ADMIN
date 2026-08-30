import type { Metadata } from "next";
import AdminsView from "@/components/admin/admins/AdminsView";

export const metadata: Metadata = {
  title: "Admins | AUREX Admin",
};

export default function AdminsPage() {
  return <AdminsView />;
}
