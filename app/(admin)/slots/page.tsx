import type { Metadata } from "next";
import SlotsView from "@/components/admin/slots/SlotsView";
import { getInvestmentSlots, type SlotStatus } from "@/lib/investmentSlots";
import { getBusinessListings, getApprovedListings, type BusinessListing } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Investment Slots | AUREX Admin",
};

const VALID_STATUSES: SlotStatus[] = ["draft", "open", "closed"];

export default async function SlotsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as SlotStatus) : "all";

  const listingsById = getBusinessListings().reduce<Record<string, BusinessListing>>((acc, listing) => {
    acc[listing.id] = listing;
    return acc;
  }, {});

  return (
    <SlotsView
      slots={getInvestmentSlots()}
      listingsById={listingsById}
      approvedListings={getApprovedListings()}
      initialStatus={initialStatus}
    />
  );
}
