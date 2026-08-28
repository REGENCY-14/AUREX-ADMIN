import type { Metadata } from "next";
import ListingsView from "@/components/admin/listings/ListingsView";
import { getBusinessListings, type ListingStatus } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Business Listings | AUREX Admin",
};

const VALID_STATUSES: ListingStatus[] = ["pending", "live", "funded", "closed"];

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as ListingStatus) : "all";

  return <ListingsView listings={getBusinessListings()} initialStatus={initialStatus} />;
}
