"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { formatGhs } from "@/lib/formatters";

export type OverviewStats = {
  pendingApplications: number;
  investorCount: number;
  businessOwnerCount: number;
  totalInvestedGhs: number;
  openSlotCount: number;
  liveListingCount: number;
};

/**
 * The Admin landing page: six at-a-glance stat tiles, each linking into
 * its own section (per the brief). `staggerContainer`/`staggerItem`
 * (the latter lives inside PageHeader/StatCard themselves) instead of
 * one-off per-tile delays — same shared-variant convention as the main
 * site's own list sections.
 */
export default function OverviewView({ stats }: { stats: OverviewStats }) {
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
    </motion.div>
  );
}
