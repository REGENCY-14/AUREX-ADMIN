import type { Metadata } from "next";
import OverviewView from "@/components/admin/overview/OverviewView";
import { getPendingApplicationCount } from "@/lib/applications";
import { getMembers } from "@/lib/members";
import { getTotalPlatformInvested } from "@/lib/investments";
import { getInvestmentSlots } from "@/lib/investmentSlots";
import { getBusinessListings } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Overview | AUREX Admin",
};

/**
 * The Admin landing page. All six stats are derived from the same mock
 * lib/*.ts data every other admin page reads — nothing here is its own
 * separate source of truth, so it can't silently drift from what the
 * Applications/Members/Slots/Listings pages themselves show.
 */
export default function OverviewPage() {
  const members = getMembers();

  const stats = {
    pendingApplications: getPendingApplicationCount(),
    investorCount: members.filter((m) => m.track === "investor").length,
    businessOwnerCount: members.filter((m) => m.track === "business").length,
    totalInvestedGhs: getTotalPlatformInvested(),
    openSlotCount: getInvestmentSlots().filter((s) => s.status === "open").length,
    liveListingCount: getBusinessListings().filter((l) => l.status === "live").length,
  };

  return <OverviewView stats={stats} />;
}
