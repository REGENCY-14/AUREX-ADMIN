import type { Metadata } from "next";
import ReportDetailView from "@/components/admin/reports/ReportDetailView";

export const metadata: Metadata = {
  title: "Report | AUREX Admin",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailView id={id} />;
}
