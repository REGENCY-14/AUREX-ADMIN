/**
 * Business listings — the Ventures-side businesses AUREX has approved to
 * raise funding. No backend exists yet, so this is realistic mock data
 * shaped like what a real listings table would hold. Referenced by
 * lib/investmentSlots.ts (a Ventures slot links to one of these) and
 * lib/members.ts (a Business Owner member owns one of these).
 *
 * `status` is the one field only Admin ever changes — never the business
 * owner, per the brief. "Approved" (as in "a Ventures slot can only link
 * to an approved business listing") means anything past `pending`: once
 * Admin has taken a listing live, it's approved, whether it's currently
 * live, fully funded, or since closed.
 */

export type ListingStatus = "pending" | "live" | "funded" | "closed";

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  pending: "Pending Review",
  live: "Live",
  funded: "Funded",
  closed: "Closed",
};

export type BusinessListing = {
  id: string;
  businessName: string;
  ownerNickname: string;
  description: string;
  fundingPurpose: string;
  fundingGoalGhs: number;
  amountRaisedGhs: number;
  backerCount: number;
  status: ListingStatus;
  businessRegDocument: { fileName: string; uploadedAt: string };
};

export const BUSINESS_LISTINGS: BusinessListing[] = [
  {
    id: "list-01",
    businessName: "GreenHarvest Foods",
    ownerNickname: "HarvestHQ",
    description:
      "GreenHarvest Foods packages and distributes locally-grown produce across Accra, working directly with smallholder farmers.",
    fundingPurpose: "A second cold-storage facility to serve two new markets.",
    fundingGoalGhs: 50_000,
    amountRaisedGhs: 32_000,
    backerCount: 14,
    status: "live",
    businessRegDocument: { fileName: "greenharvest-certificate.pdf", uploadedAt: "2025-10-10" },
  },
  {
    id: "list-02",
    businessName: "Atlas Freight Logistics",
    ownerNickname: "FreightAtlas",
    description: "Atlas Freight Logistics runs a fleet of trucks moving goods between Accra, Kumasi, and Takoradi.",
    fundingPurpose: "Three additional trucks to cover a new Takoradi route.",
    fundingGoalGhs: 40_000,
    amountRaisedGhs: 40_000,
    backerCount: 21,
    status: "funded",
    businessRegDocument: { fileName: "atlas-freight-certificate.pdf", uploadedAt: "2025-09-08" },
  },
  {
    id: "list-03",
    businessName: "CedarCraft Furniture",
    ownerNickname: "CedarCraftCo",
    description: "CedarCraft Furniture designs and builds solid-wood furniture, sold direct-to-consumer and wholesale.",
    fundingPurpose: "A larger workshop space and two more carpenters.",
    fundingGoalGhs: 30_000,
    amountRaisedGhs: 0,
    backerCount: 0,
    status: "pending",
    businessRegDocument: { fileName: "cedarcraft-certificate.pdf", uploadedAt: "2026-08-18" },
  },
  {
    id: "list-04",
    businessName: "Accra Brew Collective",
    ownerNickname: "BrewCollectiveHQ",
    description: "Accra Brew Collective is a small-batch craft brewery supplying bars and restaurants across the city.",
    fundingPurpose: "New fermentation tanks to triple monthly output.",
    fundingGoalGhs: 25_000,
    amountRaisedGhs: 18_000,
    backerCount: 9,
    status: "closed",
    businessRegDocument: { fileName: "accra-brew-certificate.pdf", uploadedAt: "2025-08-01" },
  },
];

export function getBusinessListings(): BusinessListing[] {
  return BUSINESS_LISTINGS;
}

export function getBusinessListingById(id: string): BusinessListing | undefined {
  return BUSINESS_LISTINGS.find((l) => l.id === id);
}

/** "Approved" = anything past `pending` — the only status a Ventures
 *  investment slot is allowed to link to (see lib/investmentSlots.ts's own
 *  publish validation). */
export function getApprovedListings(): BusinessListing[] {
  return BUSINESS_LISTINGS.filter((l) => l.status !== "pending");
}

/** Whole-percent progress toward the funding goal, capped at 100. */
export function getFundingPercent(listing: BusinessListing): number {
  if (listing.fundingGoalGhs <= 0) return 0;
  return Math.min(100, Math.round((listing.amountRaisedGhs / listing.fundingGoalGhs) * 100));
}
