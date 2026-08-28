"use client";

import { motion } from "framer-motion";
import { staggerContainer, scrollReveal } from "@/lib/motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import TrendChart from "@/components/admin/overview/charts/TrendChart";
import SegmentedBar from "@/components/admin/overview/charts/SegmentedBar";
import FundingMeterList from "@/components/admin/overview/charts/FundingMeterList";
import { formatGhs } from "@/lib/formatters";
import type { MonthlyInvestedPoint } from "@/lib/investments";
import type { BusinessListing } from "@/lib/businessListings";

export type OverviewStats = {
  pendingApplications: number;
  investorCount: number;
  businessOwnerCount: number;
  totalInvestedGhs: number;
  openSlotCount: number;
  liveListingCount: number;
};

export type ApplicationStatusCounts = { pending: number; approved: number; rejected: number };

/**
 * The Admin landing page: at-a-glance stat tiles (each linking into its
 * own section, per the brief) plus four charts giving the same numbers
 * some shape — a cumulative invested-over-time trend, an applications-
 * by-status breakdown, a members-by-track split, and per-listing funding
 * meters. `staggerContainer`/`staggerItem` for the tiles (same shared-
 * variant convention as the main site's own list sections); the charts
 * section below uses `scrollReveal` instead, per the brief's own
 * guidance for a page that's grown long enough to benefit from content
 * revealing as you scroll rather than all animating in at once on load.
 *
 * See the dataviz skill's own reasoning (in each chart component) for
 * why the color choices are what they are — this brand has one real hue
 * (gold) plus its already-established green/red status pair, not an
 * invented multi-hue categorical palette.
 */
export default function OverviewView({
  stats,
  investedTrend,
  applicationStatusCounts,
  listings,
}: {
  stats: OverviewStats;
  investedTrend: MonthlyInvestedPoint[];
  applicationStatusCounts: ApplicationStatusCounts;
  listings: BusinessListing[];
}) {
  const totalMembers = stats.investorCount + stats.businessOwnerCount;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader title="Overview" description="A snapshot of the AUREX platform right now." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Pending Applications"
          value={String(stats.pendingApplications)}
          href="/applications?status=pending"
          sublabel="Awaiting review"
        />
        <StatCard
          label="Registered Members"
          value={String(totalMembers)}
          href="/members"
          sublabel={`${stats.investorCount} Investors · ${stats.businessOwnerCount} Business Owners`}
        />
        <StatCard
          label="Total Invested"
          value={formatGhs(stats.totalInvestedGhs)}
          href="/investments"
          sublabel="Platform-wide"
        />
        <StatCard
          label="Open Investment Slots"
          value={String(stats.openSlotCount)}
          href="/slots?status=open"
          sublabel="Currently accepting investment"
        />
        <StatCard
          label="Live Business Listings"
          value={String(stats.liveListingCount)}
          href="/listings?status=live"
          sublabel="Raising funds now"
        />
      </div>

      <motion.div {...scrollReveal} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
          <h2 className="font-jakarta text-lg font-semibold text-cream">Total Invested Over Time</h2>
          <p className="mb-3 font-sans text-sm text-cream-dim">Cumulative amount invested, platform-wide.</p>
          <TrendChart data={investedTrend} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
            <h2 className="font-jakarta text-lg font-semibold text-cream">Applications by Status</h2>
            <p className="mb-3 font-sans text-sm text-cream-dim">Every application ever submitted.</p>
            <SegmentedBar
              ariaLabel={`Applications by status: ${applicationStatusCounts.pending} pending, ${applicationStatusCounts.approved} approved, ${applicationStatusCounts.rejected} rejected`}
              segments={[
                { key: "pending", label: "Pending", value: applicationStatusCounts.pending, colorClassName: "bg-cream-dim" },
                { key: "approved", label: "Approved", value: applicationStatusCounts.approved, colorClassName: "bg-[#4ade80]" },
                { key: "rejected", label: "Rejected", value: applicationStatusCounts.rejected, colorClassName: "bg-[#f87171]" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
            <h2 className="font-jakarta text-lg font-semibold text-cream">Members by Track</h2>
            <p className="mb-3 font-sans text-sm text-cream-dim">Registered investors vs. business owners.</p>
            <SegmentedBar
              ariaLabel={`Members by track: ${stats.investorCount} investors, ${stats.businessOwnerCount} business owners`}
              segments={[
                { key: "investor", label: "Investors", value: stats.investorCount, colorClassName: "bg-gold-deep" },
                { key: "business", label: "Business Owners", value: stats.businessOwnerCount, colorClassName: "bg-cream-dim" },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
          <h2 className="font-jakarta text-lg font-semibold text-cream">Funding Progress by Listing</h2>
          <p className="mb-4 font-sans text-sm text-cream-dim">Every business listing, raised vs. goal.</p>
          <FundingMeterList listings={listings} />
        </div>
      </motion.div>
    </motion.div>
  );
}
