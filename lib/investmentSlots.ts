/**
 * Investment slots Admin has drafted, published, or closed — the same
 * concept as the main AUREX site's own lib/investmentSlots.ts (a package
 * type, a business only when it's a Ventures slot, a minimum/term/rate/
 * window), extended here with the states this admin tool actually needs
 * to manage: `draft` (created but not yet published — the "Create/Edit
 * form" state before Publish), `open` (published, visible on the public
 * site), and `closed` (either closed early or naturally past its window).
 */

import type { BusinessListing } from "./businessListings";
import { getApprovedListings, getBusinessListingById } from "./businessListings";

export type SlotPackage = "core" | "ventures";
export type SlotStatus = "draft" | "open" | "closed";

export const SLOT_PACKAGE_LABEL: Record<SlotPackage, string> = {
  core: "AUREX Core",
  ventures: "AUREX Ventures",
};

export const SLOT_STATUS_LABEL: Record<SlotStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};

export type InvestmentSlot = {
  id: string;
  package: SlotPackage;
  /** Only set (and only valid) for Ventures slots. */
  businessListingId?: string;
  minInvestmentGhs: number;
  termLabel: string;
  ratePercentLabel: string;
  opensAt: string;
  closesAt: string;
  status: SlotStatus;
};

export const INVESTMENT_SLOTS: InvestmentSlot[] = [
  {
    id: "slot-01",
    package: "core",
    minInvestmentGhs: 500,
    termLabel: "6-month term",
    ratePercentLabel: "8% p.a.",
    opensAt: "2026-02-01",
    closesAt: "2026-12-30",
    status: "open",
  },
  {
    id: "slot-02",
    package: "ventures",
    businessListingId: "list-01",
    minInvestmentGhs: 2000,
    termLabel: "12-month term",
    ratePercentLabel: "14% p.a.",
    opensAt: "2026-02-10",
    closesAt: "2026-11-15",
    status: "open",
  },
  {
    id: "slot-03",
    package: "ventures",
    businessListingId: "list-02",
    minInvestmentGhs: 1500,
    termLabel: "9-month term",
    ratePercentLabel: "11% p.a.",
    opensAt: "2025-11-01",
    closesAt: "2025-12-20",
    status: "closed",
  },
  {
    id: "slot-04",
    package: "core",
    minInvestmentGhs: 1000,
    termLabel: "3-month term",
    ratePercentLabel: "6% p.a.",
    opensAt: "2026-09-01",
    closesAt: "2026-12-01",
    status: "draft",
  },
  {
    id: "slot-05",
    package: "ventures",
    minInvestmentGhs: 3000,
    termLabel: "12-month term",
    ratePercentLabel: "15% p.a.",
    opensAt: "2026-09-15",
    closesAt: "2027-09-15",
    // Deliberately left without a businessListingId — demonstrates the
    // "can't publish a Ventures slot without a linked approved listing"
    // validation on the Slot Management page.
    status: "draft",
  },
];

export function getInvestmentSlots(): InvestmentSlot[] {
  return INVESTMENT_SLOTS;
}

export function getInvestmentSlotById(id: string): InvestmentSlot | undefined {
  return INVESTMENT_SLOTS.find((s) => s.id === id);
}

export function getLinkedListing(slot: InvestmentSlot): BusinessListing | undefined {
  return slot.businessListingId ? getBusinessListingById(slot.businessListingId) : undefined;
}

/** A slot is publishable when it's not a Ventures slot at all (Core pools
 *  into AUREX itself, no business to check), or when its linked business
 *  listing exists and is approved (past `pending`) — per the brief's own
 *  validation rule. */
export function canPublishSlot(slot: Pick<InvestmentSlot, "package" | "businessListingId">): boolean {
  if (slot.package !== "ventures") return true;
  if (!slot.businessListingId) return false;
  return getApprovedListings().some((l) => l.id === slot.businessListingId);
}
