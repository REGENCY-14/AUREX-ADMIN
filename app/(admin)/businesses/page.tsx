import type { Metadata } from "next";
import BusinessesView from "@/components/admin/businesses/BusinessesView";
import type { ListingStatus } from "@/lib/businessListings";

export const metadata: Metadata = {
  title: "Businesses | AUREX Admin",
};

type StatusFilter = ListingStatus | "not_listed" | "all";

const VALID_STATUSES: StatusFilter[] = ["pending", "live", "funded", "closed", "not_listed"];

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as StatusFilter) : "all";

  return <BusinessesView initialStatus={initialStatus} />;
}
