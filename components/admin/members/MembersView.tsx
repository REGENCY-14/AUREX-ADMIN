"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/motion";
import { formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import { SearchIcon } from "@/components/icons";
import type { Member, MemberStatus, MemberTrack } from "@/lib/members";

const STATUS_TONE: Record<MemberStatus, BadgeTone> = {
  active: "gold",
  suspended: "danger",
};

const TRACK_LABEL: Record<MemberTrack, string> = {
  investor: "Investor",
  business: "Business Owner",
};

/** Member Management list — search by nickname or real name, same
 *  filter/sort-lives-in-the-client pattern as ApplicationsView. */
export default function MembersView({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.nickname.toLowerCase().includes(q) || m.realName.toLowerCase().includes(q));
  }, [members, query]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader title="Member Management" description="Every registered AUREX member, investor and business owner alike." />

      <motion.div variants={staggerItem} className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cream-dim" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by nickname or real name…"
          className="w-full border border-grid-line bg-panel/60 py-2 pl-9 pr-3 font-sans text-sm text-cream placeholder:text-cream-dim/60 focus:border-gold/50 focus:outline-none"
        />
      </motion.div>

      {filtered.length === 0 ? (
        <motion.p variants={staggerItem} className="border border-grid-line bg-panel/20 p-8 text-center font-sans text-sm text-cream-dim">
          No members match “{query}”.
        </motion.p>
      ) : (
        <>
          <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-grid-line bg-panel/40">
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Nickname</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Real Name</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Track</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Joined</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <motion.tr key={member.id} {...hoverLift} className="border-b border-grid-line last:border-b-0 hover:bg-panel/30">
                    <td className="p-0">
                      <Link href={`/members/${member.id}`} className="flex px-4 py-3 font-jakarta text-sm font-medium text-cream">
                        {member.nickname}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{member.realName}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{TRACK_LABEL[member.track]}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatDisplayDate(member.joinDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={member.status === "active" ? "Active" : "Suspended"} tone={STATUS_TONE[member.status]} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
            {filtered.map((member) => (
              <motion.div key={member.id} {...hoverLift}>
                <Link href={`/members/${member.id}`} className="flex flex-col gap-2 border border-grid-line bg-panel/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-jakarta text-sm font-semibold text-cream">{member.nickname}</span>
                    <StatusBadge label={member.status === "active" ? "Active" : "Suspended"} tone={STATUS_TONE[member.status]} />
                  </div>
                  <span className="font-sans text-sm text-cream-dim">{member.realName}</span>
                  <div className="flex items-center justify-between gap-3 text-xs text-cream-dim">
                    <span>{TRACK_LABEL[member.track]}</span>
                    <span>Joined {formatDisplayDate(member.joinDate)}</span>
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
