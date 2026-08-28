import type { Metadata } from "next";
import ReportsView from "@/components/admin/reports/ReportsView";
import { getReports, type ReportStatus } from "@/lib/reports";
import { getMembers, type Member } from "@/lib/members";

export const metadata: Metadata = {
  title: "Reports | AUREX Admin",
};

const VALID_STATUSES: ReportStatus[] = ["open", "in_progress", "resolved"];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as ReportStatus) : "all";

  const membersById = getMembers().reduce<Record<string, Member>>((acc, member) => {
    acc[member.id] = member;
    return acc;
  }, {});

  return <ReportsView reports={getReports()} membersById={membersById} initialStatus={initialStatus} />;
}
