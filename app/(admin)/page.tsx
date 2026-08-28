import type { Metadata } from "next";
import OverviewView from "@/components/admin/overview/OverviewView";
import { getApplications, getPendingApplicationCount } from "@/lib/applications";
import { getMembers } from "@/lib/members";
import { getMonthlyInvestedTrend, getInvestedByPackage } from "@/lib/investments";
import { getInvestmentSlots } from "@/lib/investmentSlots";
import { getBusinessListings } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Overview | AUREX Admin",
};

/**
 * The Admin landing page. Every stat and chart here is derived from the
 * same mock lib/*.ts data every other admin page reads — nothing here is
 * its own separate source of truth, so it can't silently drift from what
 * the Applications/Members/Slots/Listings pages themselves show.
 *
 * No `totalInvestedGhs` stat computed here anymore — the trend chart's
 * own always-visible endpoint label already carries that figure, so
 * OverviewView no longer takes it as a separate prop.
 */
export default function OverviewPage() {
  const members = getMembers();
  const applications = getApplications();

  const stats = {
    pendingApplications: getPendingApplicationCount(),
    investorCount: members.filter((m) => m.track === "investor").length,
    businessOwnerCount: members.filter((m) => m.track === "business").length,
    openSlotCount: getInvestmentSlots().filter((s) => s.status === "open").length,
    liveListingCount: getBusinessListings().filter((l) => l.status === "live").length,
  };

  const applicationStatusCounts = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <OverviewView
      stats={stats}
      investedTrend={getMonthlyInvestedTrend()}
      applicationStatusCounts={applicationStatusCounts}
      packageAllocation={getInvestedByPackage()}
    />
  );
}
