import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberDetailView from "@/components/admin/members/MemberDetailView";
import { getMemberById } from "@/lib/members";
import { getInvestmentRecordsByMember } from "@/lib/investments";
import { getInvestmentSlots, type InvestmentSlot } from "@/lib/investmentSlots";
import { getBusinessListingById } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Member | AUREX Admin",
};

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();

  const investmentRecords = getInvestmentRecordsByMember(member.id);
  const slotsById = getInvestmentSlots().reduce<Record<string, InvestmentSlot>>((acc, slot) => {
    acc[slot.id] = slot;
    return acc;
  }, {});
  const listing = member.businessListingId ? getBusinessListingById(member.businessListingId) : undefined;

  return (
    <MemberDetailView member={member} investmentRecords={investmentRecords} slotsById={slotsById} listing={listing} />
  );
}
