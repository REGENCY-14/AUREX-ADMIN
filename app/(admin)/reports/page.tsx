import type { Metadata } from "next";
import ReportsView from "@/components/admin/reports/ReportsView";
import type { ReportStatus } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Reports | AUREX Admin",
};

const VALID_STATUSES: ReportStatus[] = ["open", "in_progress", "resolved"];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as ReportStatus) : "all";

  return <ReportsView initialStatus={initialStatus} />;
}
