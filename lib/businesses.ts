import { apiFetch } from "@/lib/api/client";
import { cached } from "@/lib/cache";
import { createMember, getMembers, type Member } from "@/lib/members";

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
 * Businesses an admin adds directly (Add Business flow) — distinct from
 * ApprovedBusiness above (a real-backend-fetched row used only to
 * populate the Investment Slots "Linked Business" select) and from
 * BusinessListing (lib/businessListings.ts, populated by the Applications
 * approval pipeline). No backend endpoint exists for this yet, so this
 * is mock/in-memory, same convention as MEMBERS in lib/members.ts — swap
 * getBusinesses()/createBusiness() for real apiFetch calls (like
 * lib/packages.ts#createPackage) once one does.
 */
export type BusinessOwnerType = "admin" | "member";

export type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  ownerType: BusinessOwnerType;
  /** Set only when ownerType === "member" — the member who owns/invests in this business. */
  ownerMemberId?: string;
  ownerMemberNickname?: string;
  createdAt: string;
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
  };
  BUSINESSES.push(business);
  return business;
}
