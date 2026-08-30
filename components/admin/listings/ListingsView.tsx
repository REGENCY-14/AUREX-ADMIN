"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/motion";
import { formatGhs } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import { type BadgeTone } from "@/components/admin/StatusBadge";
import StatusDot from "@/components/admin/StatusDot";
import Select from "@/components/admin/Select";
import EmptyState from "@/components/admin/EmptyState";
import { DANGER_ROW_CLASSNAME, iconButtonClassName } from "@/components/admin/tableStyles";
import { PencilIcon, BriefcaseIcon, SearchIcon } from "@/components/icons";
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
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ListingStatus | "all")}
          options={[
            { value: "all", label: "All Statuses" },
            ...(Object.keys(LISTING_STATUS_LABEL) as ListingStatus[]).map((status) => ({
              value: status,
              label: LISTING_STATUS_LABEL[status],
            })),
          ]}
          ariaLabel="Filter by status"
        />
        <span className="font-sans text-xs text-cream-dim">
          {filtered.length} of {listings.length}
        </span>
      </motion.div>

      {filtered.length === 0 ? (
        listings.length === 0 ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No business listings yet"
            description="Listings submitted by business owners will show up here once they're added."
          />
        ) : (
          <EmptyState
            icon={SearchIcon}
            title="No listings match this filter"
            description="Try a different status."
            action={
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="border border-grid-line px-3 py-2 font-jakarta text-xs font-medium text-cream-dim transition-colors hover:text-cream"
              >
                Clear filter
              </button>
            }
          />
        )
      ) : (
        <>
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
              <motion.tr
                key={listing.id}
                {...hoverLift}
                className={`border-b border-grid-line last:border-b-0 hover:bg-panel/30 ${
                  listing.status === "closed" ? DANGER_ROW_CLASSNAME : ""
                }`}
              >
                <td className="px-4 py-3 font-jakarta text-sm font-medium text-cream">{listing.businessName}</td>
                <td className="px-4 py-3 font-sans text-sm text-cream-dim">{listing.ownerNickname}</td>
                <td className="px-4 py-3">
                  <StatusDot label={LISTING_STATUS_LABEL[listing.status]} tone={STATUS_TONE[listing.status]} />
                </td>
                <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatGhs(listing.fundingGoalGhs)}</td>
                <td className="px-4 py-3 font-sans text-sm text-cream-dim">
                  {formatGhs(listing.amountRaisedGhs)} ({getFundingPercent(listing)}%)
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setEditingListing(listing)}
                    aria-label={`Edit ${listing.businessName}`}
                    className={iconButtonClassName("gold")}
                  >
                    <PencilIcon className="size-3.5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
        {filtered.map((listing) => (
          <motion.div
            key={listing.id}
            {...hoverLift}
            className={`flex flex-col gap-2 border border-grid-line bg-panel/20 p-4 ${
              listing.status === "closed" ? DANGER_ROW_CLASSNAME : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-jakarta text-sm font-semibold text-cream">{listing.businessName}</span>
              <StatusDot label={LISTING_STATUS_LABEL[listing.status]} tone={STATUS_TONE[listing.status]} />
            </div>
            <span className="font-sans text-sm text-cream-dim">{listing.ownerNickname}</span>
            <span className="font-sans text-xs text-cream-dim">
              {formatGhs(listing.amountRaisedGhs)} raised of {formatGhs(listing.fundingGoalGhs)} ({getFundingPercent(listing)}%)
            </span>
            <button
              type="button"
              onClick={() => setEditingListing(listing)}
              aria-label={`Edit ${listing.businessName}`}
              className={`mt-1 ${iconButtonClassName("gold")}`}
            >
              <PencilIcon className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </motion.div>
        </>
      )}

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
