/**
 * The Report/Complaint Inbox's own data — issues Investors and Business
 * Owners have filed via their dashboard's "Report" tab. No backend exists
 * yet; mock data is shaped like what a real report table would hold,
 * spanning all three statuses and both member tracks so the inbox isn't
 * only ever "open".
 *
 * A report always points back at an existing lib/members.ts entry rather
 * than duplicating the reporter's nickname/real name/email/phone here —
 * same normalized-join convention as lib/investments.ts (a record points
 * at a memberId) and lib/members.ts itself (a Business Owner points at a
 * businessListingId). `role` isn't its own field for the same reason:
 * it's just that member's own `track`.
 */

import { getMemberById } from "./members";

export type ReportCategory = "payment" | "technical" | "listing" | "conduct" | "other";
export type ReportPriority = "low" | "medium" | "high" | "critical";
export type ReportStatus = "open" | "in_progress" | "resolved";

export const CATEGORY_LABEL: Record<ReportCategory, string> = {
  payment: "Payment & Transactions",
  technical: "Technical Issue",
  listing: "Business Listing",
  conduct: "Conduct / Dispute",
  other: "Other",
};

export const PRIORITY_LABEL: Record<ReportPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/** Highest-first rank — used for both the "Priority" sort and the
 *  default triage sort's tie-breaker. */
export const PRIORITY_RANK: Record<ReportPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

/** Open-first rank — the default triage sort's primary key. */
export const STATUS_RANK: Record<ReportStatus, number> = {
  open: 0,
  in_progress: 1,
  resolved: 2,
};

export type ReportRelatedRecord =
  | { type: "investment"; recordId: string }
  | { type: "listing"; listingId: string };

export type Report = {
  id: string;
  memberId: string;
  category: ReportCategory;
  subject: string;
  description: string;
  attachment?: { fileName: string; uploadedAt: string };
  relatedRecord?: ReportRelatedRecord;
  priority: ReportPriority;
  status: ReportStatus;
  submittedAt: string;
  adminResponse?: string;
  respondedAt?: string;
};

export const REPORTS: Report[] = [
  {
    id: "rpt-01",
    memberId: "mem-01",
    category: "payment",
    subject: "Deposit not reflected in my AUREX Core investment",
    description:
      "I sent GHS 5,000 via mobile money on 24 Aug for the AUREX Core slot but my dashboard still shows my previous balance. Transaction reference attached.",
    attachment: { fileName: "momo-receipt-24aug.jpg", uploadedAt: "2026-08-24" },
    relatedRecord: { type: "investment", recordId: "inv-01" },
    priority: "high",
    status: "open",
    submittedAt: "2026-08-24",
  },
  {
    id: "rpt-02",
    memberId: "mem-07",
    category: "listing",
    subject: "Funding goal shown incorrectly on our listing",
    description:
      "The public listing page shows a funding goal of GHS 30,000 but we agreed on GHS 40,000 when the listing was approved. This is confusing backers.",
    relatedRecord: { type: "listing", listingId: "list-02" },
    priority: "critical",
    status: "open",
    submittedAt: "2026-08-26",
  },
  {
    id: "rpt-03",
    memberId: "mem-02",
    category: "technical",
    subject: "App crashes when opening slot details on Android",
    description:
      "Every time I tap into the AUREX Ventures slot for GreenHarvest Foods, the app closes immediately. Happens on two different Android phones.",
    priority: "medium",
    status: "in_progress",
    submittedAt: "2026-08-20",
    adminResponse:
      "Passed this to the dev team — they've reproduced it and expect a fix in the next release. Will update you here once it ships.",
    respondedAt: "2026-08-23",
  },
  {
    id: "rpt-04",
    memberId: "mem-06",
    category: "conduct",
    subject: "Investor leaving unprofessional comments on my listing",
    description:
      "One backer has repeatedly messaged me demanding updates in a threatening tone. I'd like this looked into.",
    priority: "low",
    status: "resolved",
    submittedAt: "2026-07-30",
    adminResponse:
      "Reached out to the investor directly and issued a formal warning per our conduct policy. Let us know if it happens again.",
    respondedAt: "2026-08-02",
  },
  {
    id: "rpt-05",
    memberId: "mem-05",
    category: "payment",
    subject: "Requesting refund after my slot closed early",
    description:
      "My AUREX Ventures slot for Atlas Freight Logistics closed early and I hadn't received my principal back yet.",
    relatedRecord: { type: "investment", recordId: "inv-06" },
    priority: "high",
    status: "resolved",
    submittedAt: "2026-08-05",
    adminResponse:
      "Confirmed with finance — your GHS 6,000 principal was returned via mobile money on 10 Aug. Apologies for the delay in confirming here.",
    respondedAt: "2026-08-11",
  },
  {
    id: "rpt-06",
    memberId: "mem-10",
    category: "other",
    subject: "Need documentation of funds raised this year",
    description:
      "Our accountant is asking for a statement of funds raised through AUREX for our year-end filing. Could Admin issue one?",
    priority: "medium",
    status: "open",
    submittedAt: "2026-08-27",
  },
  {
    id: "rpt-07",
    memberId: "mem-06",
    category: "technical",
    subject: "Can't download our funding statement as PDF",
    description:
      "The \"Download Statement\" button on our business dashboard spins forever and never produces a file — we need this for our records.",
    priority: "low",
    status: "in_progress",
    submittedAt: "2026-08-21",
    adminResponse: "Confirmed the export tool is timing out for larger statements — dev team is on it.",
    respondedAt: "2026-08-22",
  },
  {
    id: "rpt-08",
    memberId: "mem-01",
    category: "listing",
    subject: "Interested in more due diligence info before increasing my position",
    description:
      "Before I invest further in the GreenHarvest Foods listing, could Admin share more detail on last quarter's revenue?",
    relatedRecord: { type: "listing", listingId: "list-01" },
    priority: "low",
    status: "resolved",
    submittedAt: "2026-08-12",
    adminResponse: "Shared GreenHarvest Foods' latest financial summary with you via email on 15 Aug.",
    respondedAt: "2026-08-15",
  },
];

export function getReports(): Report[] {
  return REPORTS;
}

export function getReportById(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}

/** The Admin Overview's own "Open Reports" stat — `open` specifically,
 *  not `open` + `in_progress`: "in progress" already has someone on it,
 *  it's the untouched ones that need surfacing on the dashboard. */
export function getOpenReportCount(): number {
  return REPORTS.filter((r) => r.status === "open").length;
}

/** A report's own reporter, resolved from lib/members.ts. Reports never
 *  outlive their member in this mock data, but a real backend could hit
 *  a deleted account, so callers still need to handle `undefined`. */
export function getReportReporter(report: Report) {
  return getMemberById(report.memberId);
}
