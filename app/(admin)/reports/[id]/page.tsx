import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReportDetailView from "@/components/admin/reports/ReportDetailView";
import { getReportById } from "@/lib/reports";
import { getMemberById } from "@/lib/members";
import { getInvestmentRecords } from "@/lib/investments";
import { getInvestmentSlotById } from "@/lib/investmentSlots";
import { getBusinessListingById } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Report | AUREX Admin",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getReportById(id);
  if (!report) notFound();

  const member = getMemberById(report.memberId);

  // Pulled into a local first: narrowing `report.relatedRecord?.type` inline
  // doesn't survive into the `.find()` callback below (a fresh property
  // read TS can't carry the narrowing into), a local const does.
  const relatedRecord = report.relatedRecord;

  const relatedListing = relatedRecord?.type === "listing" ? getBusinessListingById(relatedRecord.listingId) : undefined;

  const relatedInvestment =
    relatedRecord?.type === "investment" ? getInvestmentRecords().find((r) => r.id === relatedRecord.recordId) : undefined;
  const relatedSlot = relatedInvestment ? getInvestmentSlotById(relatedInvestment.slotId) : undefined;

  return (
    <ReportDetailView
      report={report}
      member={member}
      relatedListing={relatedListing}
      relatedInvestment={relatedInvestment}
      relatedSlot={relatedSlot}
    />
  );
}
