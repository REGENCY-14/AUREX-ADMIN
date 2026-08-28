"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/motion";
import { formatGhs } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ListingForm, { type ListingFormValues } from "@/components/admin/listings/ListingForm";
import { LISTING_STATUS_LABEL, getFundingPercent, type BusinessListing, type ListingStatus } from "@/lib/businessListings";

const STATUS_TONE: Record<ListingStatus, BadgeTone> = {
  pending: "neutral",
  live: "gold",
  funded: "success",
  closed: "danger",
};

/**
 * Business Listing Management: list + an edit form as a modal (same
 * reasoning as SlotsView — this is a single form, not a rich detail
 * view, so a modal keeps the create/edit-and-see-it-reflected loop
 * working without a separate route to thread state through).
 */
export default function ListingsView({
  listings: initialListings,
  initialStatus = "all",
}: {
  listings: BusinessListing[];
  initialStatus?: ListingStatus | "all";
}) {
  const [listings, setListings] = useState(initialListings);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "all">(initialStatus);
  const [editingListing, setEditingListing] = useState<BusinessListing | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const filtered = useMemo(
    () => listings.filter((l) => statusFilter === "all" || l.status === statusFilter),
    [listings, statusFilter]
  );

  function handleSave(values: ListingFormValues) {
    if (!editingListing) return;
    setListings((prev) =>
      prev.map((l) =>
        l.id === editingListing.id
          ? { ...l, description: values.description, fundingGoalGhs: Number(values.fundingGoalGhs) || 0, status: values.status }
          : l
      )
    );
    setBanner(`${editingListing.businessName} updated.`);
    setEditingListing(null);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader title="Business Listing Management" description="Every business AUREX Ventures has reviewed, published, or closed." />

      {banner && (
        <motion.div variants={staggerItem} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {banner}
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ListingStatus | "all")}
          className="border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream focus:border-gold/50 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(LISTING_STATUS_LABEL) as ListingStatus[]).map((status) => (
            <option key={status} value={status}>
              {LISTING_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
        <span className="font-sans text-xs text-cream-dim">
          {filtered.length} of {listings.length}
        </span>
      </motion.div>

      <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-grid-line bg-panel/40">
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Business</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Owner</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Funding Goal</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Raised</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing) => (
              <motion.tr key={listing.id} {...hoverLift} className="border-b border-grid-line last:border-b-0 hover:bg-panel/30">
                <td className="px-4 py-3 font-jakarta text-sm font-medium text-cream">{listing.businessName}</td>
                <td className="px-4 py-3 font-sans text-sm text-cream-dim">{listing.ownerNickname}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={LISTING_STATUS_LABEL[listing.status]} tone={STATUS_TONE[listing.status]} />
                </td>
                <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatGhs(listing.fundingGoalGhs)}</td>
                <td className="px-4 py-3 font-sans text-sm text-cream-dim">
                  {formatGhs(listing.amountRaisedGhs)} ({getFundingPercent(listing)}%)
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setEditingListing(listing)}
                    className="border border-grid-line px-2.5 py-1 font-jakarta text-xs font-medium text-cream-dim transition-colors hover:text-cream"
                  >
                    Edit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
        {filtered.map((listing) => (
          <motion.div key={listing.id} {...hoverLift} className="flex flex-col gap-2 border border-grid-line bg-panel/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="font-jakarta text-sm font-semibold text-cream">{listing.businessName}</span>
              <StatusBadge label={LISTING_STATUS_LABEL[listing.status]} tone={STATUS_TONE[listing.status]} />
            </div>
            <span className="font-sans text-sm text-cream-dim">{listing.ownerNickname}</span>
            <span className="font-sans text-xs text-cream-dim">
              {formatGhs(listing.amountRaisedGhs)} raised of {formatGhs(listing.fundingGoalGhs)} ({getFundingPercent(listing)}%)
            </span>
            <button
              type="button"
              onClick={() => setEditingListing(listing)}
              className="mt-1 w-fit border border-grid-line px-2.5 py-1 font-jakarta text-xs font-medium text-cream-dim"
            >
              Edit
            </button>
          </motion.div>
        ))}
      </motion.div>

      <Modal
        isOpen={editingListing !== null}
        onClose={() => setEditingListing(null)}
        title={editingListing ? `Edit ${editingListing.businessName}` : ""}
      >
        {editingListing && <ListingForm listing={editingListing} onCancel={() => setEditingListing(null)} onSave={handleSave} />}
      </Modal>
    </motion.div>
  );
}
