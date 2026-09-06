import type { Metadata } from "next";
import OverviewView from "@/components/admin/overview/OverviewView";
import { getMembers } from "@/lib/members";
import { getOpenReportCount } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Overview | AUREX Admin",
};

/**
 * The Admin landing page. Member counts below are still mock data (a
 * pre-existing gap, not part of this pass) — the invested trend/
 * allocation figures, open-slot count, and live-listing count are real,
 * fetched by OverviewView itself.
 */
export default async function OverviewPage() {
  const members = getMembers();

  const stats = {
    investorCount: members.filter((m) => m.track === "investor").length,
    businessOwnerCount: members.filter((m) => m.track === "business").length,
    openReportCount: await getOpenReportCount(),
  };

  return <OverviewView stats={stats} />;
}
