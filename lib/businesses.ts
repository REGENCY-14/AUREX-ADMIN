import { apiFetch } from "@/lib/api/client";
import { cached } from "@/lib/cache";
import { createMember, getMembers, type Member } from "@/lib/members";
import { fetchBusinessListings, type BusinessListing } from "@/lib/businessListings";

export type ApprovedBusiness = { id: string; name: string };

export async function fetchApprovedBusinesses(): Promise<ApprovedBusiness[]> {
  try {
    const { data } = await cached("businesses:approved", () => apiFetch<ApprovedBusiness[]>("/businesses"));
    return data;
  } catch {
    return [];
  }
}

/**
 * A business, from either of its two possible origins:
 *  - "admin_added": created directly by an admin (Add Business flow
 *    below) — mock/in-memory, no backend endpoint exists for this yet,
 *    same convention as MEMBERS in lib/members.ts. Swap
 *    getBusinesses()/createBusiness() for real apiFetch calls (like
 *    lib/packages.ts#createPackage) once one does.
 *  - "application": came from the Applications approval pipeline and
 *    has a real, backend-tracked funding listing (lib/businessListings.ts).
 *
 * getAllBusinesses() merges both into this one shape so admins manage
 * every business — self-added or member-owned, listed or not — from a
 * single Businesses page instead of two separate ones. Only
 * "application" rows carry a `listing` (and are editable, via the
 * existing lib/businessListings.ts#updateBusinessListing) since only
 * they have a real funding record behind them.
 */
export type BusinessOwnerType = "admin" | "member";
export type BusinessSource = "admin_added" | "application";

export type Business = {
  id: string;
  name: string;
  /** Free-text category — only set on "admin_added" rows; "application" rows don't carry one. */
  category: string;
  description: string;
  ownerType: BusinessOwnerType;
  /** Set only when ownerType === "member" — the member who owns/invests in this business. */
  ownerMemberId?: string;
  ownerMemberNickname?: string;
  /** Set only on "admin_added" rows — "application" rows don't carry a creation date. */
  createdAt?: string;
  source: BusinessSource;
  /** Set only on "application" rows — the funding/listing side of this business. */
  listing?: BusinessListing;
};

export type CreateBusinessInput = {
  name: string;
  category: string;
  description: string;
  ownerType: BusinessOwnerType;
  /** "Existing Member" branch — id of a member already in lib/members.ts's MEMBERS. */
  ownerMemberId?: string;
  /** "New Member" branch — creates the member (track: "investor") before creating the business. */
  newOwner?: { nickname: string; realName: string; email: string; phone: string; country: string };
};

const BUSINESSES: Business[] = [];

export function getBusinesses(): Business[] {
  return BUSINESSES;
}

function fromListing(listing: BusinessListing): Business {
  return {
    id: listing.id,
    name: listing.businessName,
    category: "",
    description: listing.description,
    ownerType: "member",
    ownerMemberNickname: listing.ownerNickname,
    source: "application",
    listing,
  };
}

/** The merged list this app's Businesses page renders: every admin-added
 *  business plus every real business listing, as one shape. */
export async function getAllBusinesses(): Promise<Business[]> {
  const listings = await fetchBusinessListings();
  return [...BUSINESSES, ...listings.map(fromListing)];
}

export function createBusiness(input: CreateBusinessInput): Business {
  let owner: Member | undefined;
  if (input.ownerType === "member") {
    if (input.newOwner) {
      owner = createMember({ ...input.newOwner, track: "investor" });
    } else if (input.ownerMemberId) {
      owner = getMembers().find((m) => m.id === input.ownerMemberId);
    }
  }

  const business: Business = {
    id: `biz-${Date.now()}`,
    name: input.name,
    category: input.category,
    description: input.description,
    ownerType: input.ownerType,
    ownerMemberId: owner?.id,
    ownerMemberNickname: owner?.nickname,
    createdAt: new Date().toISOString().slice(0, 10),
    source: "admin_added",
  };
  BUSINESSES.push(business);
  return business;
}
