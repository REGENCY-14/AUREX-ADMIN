"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { scrollReveal, hoverScale } from "@/lib/motion";
import { formatDisplayDate, formatGhs, buildWhatsAppLink } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import Select from "@/components/admin/Select";
import DocumentPreview from "@/components/admin/DocumentPreview";
import { ArrowRightIcon, ChatIcon } from "@/components/icons";
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Report,
  type ReportPriority,
  type ReportStatus,
} from "@/lib/reports";
import type { Member, MemberTrack } from "@/lib/members";
import { SLOT_PACKAGE_LABEL, type InvestmentSlot } from "@/lib/investmentSlots";
import type { InvestmentRecord } from "@/lib/investments";
import type { BusinessListing } from "@/lib/businessListings";

const STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  open: "neutral",
  in_progress: "gold",
  resolved: "success",
};

const PRIORITY_TONE: Record<ReportPriority, BadgeTone> = {
  low: "success",
  medium: "neutral",
  high: "gold",
  critical: "danger",
};

const TRACK_LABEL: Record<MemberTrack, string> = {
  investor: "Investor",
  business: "Business Owner",
};

const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as ReportStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }));

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">{label}</span>
      <p className="font-sans text-sm text-cream">{value}</p>
    </div>
  );
}

/**
 * The Report detail/response screen. Status + Admin response are saved
 * together via one "Save" action into this component's own React state —
 * same stubbed-action caveat as every other detail view in this admin
 * (ApplicationDetailView, MemberDetailView): no backend, no client
 * storage, so a refresh reverts to the original mock. Flagged inline via
 * `actionMessage` rather than pretending it's persisted.
 *
 * `scrollReveal` per section — this is a genuinely long detail view
 * (reporter + report details + an optional attachment + the response
 * form), same "reveals as you scroll" treatment ApplicationDetailView
 * uses for the same reason.
 */
export default function ReportDetailView({
  report,
  member,
  relatedListing,
  relatedInvestment,
  relatedSlot,
}: {
  report: Report;
  member?: Member;
  relatedListing?: BusinessListing;
  relatedInvestment?: InvestmentRecord;
  relatedSlot?: InvestmentSlot;
}) {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [response, setResponse] = useState(report.adminResponse ?? "");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  function handleSave() {
    setActionMessage(
      `Status set to “${STATUS_LABEL[status]}”${response.trim() ? " and your response was saved" : ""}, visible to ${
        member?.nickname ?? "the reporter"
      } in their My Reports view. This is a stubbed action: nothing is persisted (no backend yet), so a refresh reverts to the original values.`
    );
  }

  const whatsAppHref = member
    ? buildWhatsAppLink(member.phone, `Hi ${member.nickname}, this is AUREX Admin regarding your report "${report.subject}".`)
    : undefined;

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <Link href="/reports" className="flex w-fit items-center gap-1.5 font-sans text-sm text-cream-dim transition-colors hover:text-gold-bright">
        <span className="rotate-180">
          <ArrowRightIcon className="size-3" />
        </span>
        Back to inbox
      </Link>

      <PageHeader
        title={report.subject}
        description={`${CATEGORY_LABEL[report.category]} · Submitted ${formatDisplayDate(report.submittedAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={PRIORITY_LABEL[report.priority]} tone={PRIORITY_TONE[report.priority]} />
            <StatusBadge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
          </div>
        }
      />

      {actionMessage && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {actionMessage}
        </motion.div>
      )}

      <motion.section {...scrollReveal} className="flex flex-col gap-5 border border-grid-line bg-panel/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-jakarta text-lg font-semibold text-cream">Reporter</h2>
          {whatsAppHref && (
            <motion.a
              {...hoverScale}
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-gold/30 px-3 py-1.5 font-jakarta text-xs font-medium text-gold-bright transition-colors hover:border-gold hover:bg-gold/5"
            >
              <ChatIcon className="size-3.5" /> Contact via WhatsApp
            </motion.a>
          )}
        </div>
        {member ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nickname" value={member.nickname} />
            <Field label="Full Name" value={member.realName} />
            <Field label="Role" value={TRACK_LABEL[member.track]} />
            <Field label="Email" value={member.email} />
            <Field label="Phone" value={member.phone} />
            <Field label="Country" value={member.country} />
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-dim">This member&rsquo;s account could no longer be found.</p>
        )}
        {member && (
          <Link
            href={`/members/${member.id}`}
            className="flex w-fit items-center gap-1.5 font-jakarta text-sm font-medium text-gold-bright underline-offset-4 transition-colors hover:text-gold-light hover:underline"
          >
            View Member Profile
            <ArrowRightIcon className="size-3" />
          </Link>
        )}
      </motion.section>

      <motion.section {...scrollReveal} className="flex flex-col gap-5 border border-grid-line bg-panel/20 p-6">
        <h2 className="font-jakarta text-lg font-semibold text-cream">Report Details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Category" value={CATEGORY_LABEL[report.category]} />
          <Field label="Priority" value={PRIORITY_LABEL[report.priority]} />
          <Field label="Subject" value={report.subject} />
        </div>
        <Field label="Description" value={report.description} />

        {relatedListing && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Related Record</span>
            <Link
              href={`/listings/${relatedListing.id}`}
              className="flex w-fit items-center gap-1.5 font-jakarta text-sm font-medium text-gold-bright underline-offset-4 transition-colors hover:text-gold-light hover:underline"
            >
              {relatedListing.businessName} (Business Listing)
              <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        )}
        {relatedInvestment && (
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Related Record</span>
            <p className="font-sans text-sm text-cream-dim">
              {formatGhs(relatedInvestment.amountInvestedGhs)} into{" "}
              {relatedSlot ? SLOT_PACKAGE_LABEL[relatedSlot.package] : "an investment slot"}, invested{" "}
              {formatDisplayDate(relatedInvestment.dateInvested)}.
            </p>
            {member && (
              <Link
                href={`/members/${member.id}`}
                className="flex w-fit items-center gap-1.5 font-jakarta text-sm font-medium text-gold-bright underline-offset-4 transition-colors hover:text-gold-light hover:underline"
              >
                View in {member.nickname}&rsquo;s investment history
                <ArrowRightIcon className="size-3" />
              </Link>
            )}
          </div>
        )}
      </motion.section>

      {report.attachment && (
        <motion.section {...scrollReveal} className="flex flex-col gap-4 border border-grid-line bg-panel/20 p-6">
          <h2 className="font-jakarta text-lg font-semibold text-cream">Attachment</h2>
          <DocumentPreview label="Submitted Attachment" fileName={report.attachment.fileName} uploadedAt={report.attachment.uploadedAt} />
        </motion.section>
      )}

      <motion.section {...scrollReveal} className="flex flex-col gap-4 border border-grid-line bg-panel/20 p-6">
        <h2 className="font-jakarta text-lg font-semibold text-cream">Status &amp; Response</h2>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Status</span>
          <Select value={status} onChange={(v) => setStatus(v as ReportStatus)} options={STATUS_OPTIONS} ariaLabel="Report status" triggerClassName="max-w-xs" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Admin Response</span>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            placeholder="Reply visible to the reporter in their My Reports view…"
            className="border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold/50 focus:outline-none"
          />
        </label>

        {report.respondedAt && (
          <p className="font-sans text-xs text-cream-dim">Last responded {formatDisplayDate(report.respondedAt)}.</p>
        )}

        <div>
          <motion.button
            {...hoverScale}
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-5 py-2.5 font-jakarta text-sm font-medium text-amainblack"
          >
            Save
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
