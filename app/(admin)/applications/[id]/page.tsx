import type { Metadata } from "next";
import ApplicationDetailView from "@/components/admin/applications/ApplicationDetailView";

export const metadata: Metadata = {
  title: "Application | AUREX Admin",
};

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetailView id={id} />;
}
