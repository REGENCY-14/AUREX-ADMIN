"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/motion";
import { formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import { ArrowUpIcon, ArrowDownIcon } from "@/components/icons";
import type { Application, ApplicationStatus, ApplicationTrack } from "@/lib/applications";

const STATUS_TONE: Record<ApplicationStatus, BadgeTone> = {
  pending: "neutral",
  approved: "gold",
  rejected: "danger",
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const TRACK_LABEL: Record<ApplicationTrack, string> = {
  investor: "Investor",
  business: "Business Owner",
};

const SELECT_CLASSNAME =
  "border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream focus:border-gold/50 focus:outline-none";

/**
 * The Application Review Queue list. Filter/sort state lives here (client
 * component) since this is a live, interactive list — `applications` is
 * plain data passed down from the server page, `initialStatus` seeds the
 * filter from the Overview page's own "Pending Applications" stat link
 * (?status=pending), same query-param-as-stub-filter convention already
 * used elsewhere.
 */
export default function ApplicationsView({
  applications,
  initialStatus = "all",
}: {
  applications: Application[];
  initialStatus?: ApplicationStatus | "all";
}) {
  const [trackFilter, setTrackFilter] = useState<ApplicationTrack | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(initialStatus);
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(() => {
    return applications
      .filter((a) => trackFilter === "all" || a.track === trackFilter)
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .sort((a, b) => {
        const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        return sortDir === "asc" ? diff : -diff;
      });
  }, [applications, trackFilter, statusFilter, sortDir]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader title="Application Review Queue" description="Review and decide on investor and business owner applications." />

      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value as ApplicationTrack | "all")}
          className={SELECT_CLASSNAME}
          aria-label="Filter by track"
        >
          <option value="all">All Tracks</option>
          <option value="investor">Investor</option>
          <option value="business">Business Owner</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          className={SELECT_CLASSNAME}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="flex items-center gap-1.5 border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream-dim transition-colors hover:text-cream"
        >
          Date {sortDir === "desc" ? <ArrowDownIcon className="size-3" /> : <ArrowUpIcon className="size-3" />}
        </button>

        <span className="font-sans text-xs text-cream-dim">
          {filtered.length} of {applications.length}
        </span>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.p variants={staggerItem} className="border border-grid-line bg-panel/20 p-8 text-center font-sans text-sm text-cream-dim">
          No applications match these filters.
        </motion.p>
      ) : (
        <>
          {/* lg+: real table. Below lg: stacked cards — a table this
              narrow (5 columns of real content) stops reflowing sensibly
              well before "mobile", so the breakpoint is lg, not sm. */}
          <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-grid-line bg-panel/40">
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Nickname</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Real Name</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Track</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Submitted</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((application) => (
                  <motion.tr key={application.id} {...hoverLift} className="border-b border-grid-line last:border-b-0 hover:bg-panel/30">
                    <td className="p-0">
                      <Link href={`/applications/${application.id}`} className="flex px-4 py-3 font-jakarta text-sm font-medium text-cream">
                        {application.nickname}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{application.realName}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{TRACK_LABEL[application.track]}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatDisplayDate(application.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={STATUS_LABEL[application.status]} tone={STATUS_TONE[application.status]} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
            {filtered.map((application) => (
              <motion.div key={application.id} {...hoverLift}>
                <Link
                  href={`/applications/${application.id}`}
                  className="flex flex-col gap-2 border border-grid-line bg-panel/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-jakarta text-sm font-semibold text-cream">{application.nickname}</span>
                    <StatusBadge label={STATUS_LABEL[application.status]} tone={STATUS_TONE[application.status]} />
                  </div>
                  <span className="font-sans text-sm text-cream-dim">{application.realName}</span>
                  <div className="flex items-center justify-between gap-3 text-xs text-cream-dim">
                    <span>{TRACK_LABEL[application.track]}</span>
                    <span>{formatDisplayDate(application.submittedAt)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
