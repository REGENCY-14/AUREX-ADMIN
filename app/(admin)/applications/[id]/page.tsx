import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationDetailView from "@/components/admin/applications/ApplicationDetailView";
import { getApplicationById } from "@/lib/applications";

export const metadata: Metadata = {
  title: "Application | AUREX Admin",
};

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  return <ApplicationDetailView application={application} />;
}
