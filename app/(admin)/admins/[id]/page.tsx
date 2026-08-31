import type { Metadata } from "next";
import AdminDetailView from "@/components/admin/admins/AdminDetailView";

export const metadata: Metadata = {
  title: "Admin | AUREX Admin",
};

export default async function AdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminDetailView id={id} />;
}
