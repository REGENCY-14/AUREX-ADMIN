/**
 * Registered AUREX members — approved applicants (see lib/applications.ts)
 * who now have an active account. No backend/auth exists yet, so this is
 * mock data shaped like what a real member lookup would return.
 *
 * A Business Owner member's `businessListingId` points at their listing
 * in lib/businessListings.ts (the Member detail view shows that listing's
 * status per the brief, rather than duplicating listing fields here).
 */

import { apiFetch, apiFetchPaginated } from "@/lib/api/client";

export type MemberTrack = "investor" | "business";
export type MemberStatus = "active" | "suspended";

export type Member = {
  id: string;
  nickname: string;
  realName: string;
  track: MemberTrack;
  email: string;
  phone: string;
  country: string;
  joinDate: string;
  status: MemberStatus;
  /** Business Owners only — see lib/businessListings.ts. */
  businessListingId?: string;
};

export const MEMBERS: Member[] = [
  {
    id: "mem-01",
    nickname: "IronVault",
    realName: "Kwame Mensah",
    track: "investor",
    email: "kwame.mensah@example.com",
    phone: "+233 24 111 2222",
    country: "Ghana",
    joinDate: "2025-11-02",
    status: "active",
  },
  {
    id: "mem-02",
    nickname: "NorthStarX",
    realName: "Ama Boateng",
    track: "investor",
    email: "ama.boateng@example.com",
    phone: "+233 24 222 3333",
    country: "Ghana",
    joinDate: "2025-11-10",
    status: "active",
  },
  {
    id: "mem-03",
    nickname: "SilkRoad88",
    realName: "Yaw Owusu",
    track: "investor",
    email: "yaw.owusu@example.com",
    phone: "+233 24 333 4444",
    country: "Ghana",
    joinDate: "2025-12-01",
    status: "suspended",
  },
  {
    id: "mem-04",
    nickname: "GoldFalcon",
    realName: "Efua Asante",
    track: "investor",
    email: "efua.asante@example.com",
    phone: "+233 24 444 5555",
    country: "Ghana",
    joinDate: "2026-01-15",
    status: "active",
  },
  {
    id: "mem-05",
    nickname: "QuietCapital",
    realName: "Kojo Adjei",
    track: "investor",
    email: "kojo.adjei@example.com",
    phone: "+233 24 555 6666",
    country: "Ghana",
    joinDate: "2026-02-03",
    status: "active",
  },
  {
    id: "mem-06",
    nickname: "HarvestHQ",
    realName: "Abena Sarpong",
    track: "business",
    email: "abena@greenharvestfoods.example.com",
    phone: "+233 24 666 7777",
    country: "Ghana",
    joinDate: "2025-10-20",
    status: "active",
    businessListingId: "list-01",
  },
  {
    id: "mem-07",
    nickname: "FreightAtlas",
    realName: "Kwabena Osei",
    track: "business",
    email: "kwabena@atlasfreight.example.com",
    phone: "+233 24 777 8888",
    country: "Ghana",
    joinDate: "2025-09-15",
    status: "active",
    businessListingId: "list-02",
  },
  {
    id: "mem-08",
    nickname: "BrightHarbor",
    realName: "Adjoa Frimpong",
    track: "investor",
    email: "adjoa.frimpong@example.com",
    phone: "+233 24 888 9999",
    country: "Ghana",
    joinDate: "2026-02-20",
    status: "active",
  },
  {
    id: "mem-09",
    nickname: "VaultKeeper",
    realName: "Nana Yeboah",
    track: "investor",
    email: "nana.yeboah@example.com",
    phone: "+233 24 999 0000",
    country: "Ghana",
    joinDate: "2026-03-01",
    status: "suspended",
  },
  {
    id: "mem-10",
    nickname: "CedarCraftCo",
    realName: "Kwesi Danso",
    track: "business",
    email: "kwesi@cedarcraft.example.com",
    phone: "+233 24 000 1111",
    country: "Ghana",
    joinDate: "2026-01-05",
    status: "active",
    businessListingId: "list-03",
  },
];

export function getMembers(): Member[] {
  return MEMBERS;
}

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

/** For the Investment Recording Tool's member selector — investors only,
 *  active only (a suspended member can't have new investments recorded). */
export function getActiveInvestors(): Member[] {
  return MEMBERS.filter((m) => m.track === "investor" && m.status === "active");
}

type MemberApiRow = {
  id: string;
  nickname: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "pending" | "suspended";
  is_active: boolean;
  track: MemberTrack;
  joined_at: string;
  country: string | null;
  business_name: string | null;
};

function toMember(row: MemberApiRow): Member {
  return {
    id: row.id,
    nickname: row.nickname ?? "—",
    realName: [row.firstname, row.lastname].filter(Boolean).join(" ") || "—",
    track: row.track,
    email: row.email ?? "",
    phone: row.phone ?? "",
    country: row.country ?? "",
    joinDate: row.joined_at,
    status: row.is_active && row.status !== "suspended" ? "active" : "suspended",
  };
}

export async function fetchMembers(filters: { track?: MemberTrack } = {}): Promise<Member[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (filters.track) params.set("track", filters.track);
  try {
    const { data } = await apiFetchPaginated<MemberApiRow>(`/members?${params.toString()}`);
    return data.map(toMember);
  } catch {
    return [];
  }
}

export async function fetchMemberById(id: string): Promise<Member | undefined> {
  try {
    const { data } = await apiFetch<MemberApiRow>(`/members/${id}`);
    return toMember(data);
  } catch {
    return undefined;
  }
}
