"use client";

import { motion } from "framer-motion";
import { staggerContainer, scrollReveal } from "@/lib/motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import TrendChart from "@/components/admin/overview/charts/TrendChart";
import SegmentedBar from "@/components/admin/overview/charts/SegmentedBar";
import PackagePieChart from "@/components/admin/overview/charts/PackagePieChart";
import type { MonthlyInvestedPoint, PackageAllocation } from "@/lib/investments";

export type OverviewStats = {
  pendingApplications: number;
  investorCount: number;
  businessOwnerCount: number;
  openSlotCount: number;
  liveListingCount: number;
};

export type ApplicationStatusCounts = { pending: number; approved: number; rejected: number };

/**
 * The Admin landing page. Two rows below the header, each pairing a
 * "main" element with supporting detail beside it:
 *
 *   1. The four stat tiles (no "Total Invested" tile — the trend chart
 *      below already answers that, as its own always-visible endpoint
 *      label, so the number isn't dropped, just not duplicated) beside
 *      the package-allocation pie chart.
 *   2. The invested-over-time trend chart beside the applications-by-
 *      status and members-by-track breakdowns, stacked in a column.
 *
 * No "Funding Progress by Listing" here anymore — the Business Listings
 * page itself already shows raised/goal per listing; this page stays
 * about platform-wide shape (where members come from, where money goes),
 * not a duplicate of that list.
 *
 * `staggerContainer`/`staggerItem` for the header + stat tiles (same
 * shared-variant convention as the main site's own list sections);
 * `scrollReveal` for the two chart rows below, per the brief's own
 * guidance for a page long enough to benefit from content revealing as
 * you scroll. See the dataviz skill's own reasoning (in each chart
 * component) for why the color choices are what they are — this brand
 * has one real hue (gold) plus its already-established green/red status
 * pair, not an invented multi-hue categorical palette.
 */
export default function OverviewView({
  stats,
  investedTrend,
  applicationStatusCounts,
  packageAllocation,
}: {
  stats: OverviewStats;
  investedTrend: MonthlyInvestedPoint[];
  applicationStatusCounts: ApplicationStatusCounts;
  packageAllocation: PackageAllocation;
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="flex flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
          <h2 className="font-jakarta text-lg font-semibold text-cream">Investment Allocation by Package</h2>
          <p className="mb-2 font-sans text-sm text-cream-dim">
            AUREX Core vs. AUREX Ventures, as a share of total amount invested — directly useful for seeing where
            money is actually flowing.
          </p>
          <PackagePieChart allocation={packageAllocation} />
        </div>
      </div>

      <motion.div {...scrollReveal} className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
          <h2 className="font-jakarta text-lg font-semibold text-cream">Total Invested Over Time</h2>
          <p className="mb-3 font-sans text-sm text-cream-dim">Cumulative amount invested, platform-wide.</p>
          <TrendChart data={investedTrend} />
        </div>

        {/* This column stretches to match the trend chart's height (the
            grid row's default align-items: stretch), and each card below
            is flex-1 so the pair splits that full height evenly instead
            of sitting shorter with dead space underneath — the segmented
            bar itself stays a "thin mark" per the dataviz mark spec;
            it's the card's height, not the bar's, that now matches. */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
            <h2 className="font-jakarta text-lg font-semibold text-cream">Applications by Status</h2>
            <p className="font-sans text-sm text-cream-dim">Every application ever submitted.</p>
            <div className="flex flex-1 flex-col justify-center">
              <SegmentedBar
                ariaLabel={`Applications by status: ${applicationStatusCounts.pending} pending, ${applicationStatusCounts.approved} approved, ${applicationStatusCounts.rejected} rejected`}
                segments={[
                  { key: "pending", label: "Pending", value: applicationStatusCounts.pending, colorClassName: "bg-cream-dim" },
                  { key: "approved", label: "Approved", value: applicationStatusCounts.approved, colorClassName: "bg-[#4ade80]" },
                  { key: "rejected", label: "Rejected", value: applicationStatusCounts.rejected, colorClassName: "bg-[#f87171]" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1.5 border border-grid-line bg-panel/20 p-6">
            <h2 className="font-jakarta text-lg font-semibold text-cream">Members by Track</h2>
            <p className="font-sans text-sm text-cream-dim">Registered investors vs. business owners.</p>
            <div className="flex flex-1 flex-col justify-center">
              <SegmentedBar
                ariaLabel={`Members by track: ${stats.investorCount} investors, ${stats.businessOwnerCount} business owners`}
                segments={[
                  { key: "investor", label: "Investors", value: stats.investorCount, colorClassName: "bg-gold-deep" },
                  { key: "business", label: "Business Owners", value: stats.businessOwnerCount, colorClassName: "bg-cream-dim" },
                ]}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
