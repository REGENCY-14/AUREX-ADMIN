"use client";

import { useState } from "react";
import type { BusinessListing, ListingStatus } from "@/lib/businessListings";
import { LISTING_STATUS_LABEL } from "@/lib/businessListings";

const INPUT_CLASSNAME =
  "w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold/50 focus:outline-none";
const LABEL_CLASSNAME = "flex flex-col gap-1.5";
const LABEL_TEXT_CLASSNAME = "font-sans text-xs uppercase tracking-wide text-cream-dim";

export type ListingFormValues = {
  description: string;
  fundingGoalGhs: string;
  status: ListingStatus;
};

/**
 * The Business Listing edit form — description, funding goal, and status
 * only, per the brief ("only Admin edits this, never the business
 * owner"). Business name/owner/funding purpose/backer count/raised
 * amount aren't editable here on purpose — raised/backers are derived
 * from real investment activity once that exists, not something Admin
 * hand-types on a listing.
 */
export default function ListingForm({
  listing,
  onCancel,
  onSave,
}: {
  listing: BusinessListing;
  onCancel: () => void;
  onSave: (values: ListingFormValues) => void;
}) {
  const [values, setValues] = useState<ListingFormValues>({
    description: listing.description,
    fundingGoalGhs: String(listing.fundingGoalGhs),
    status: listing.status,
  });

  function set<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
      }}
    >
      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Description</span>
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className={INPUT_CLASSNAME}
        />
      </label>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Funding Goal (GHS)</span>
        <input
          type="number"
          min={0}
          value={values.fundingGoalGhs}
          onChange={(e) => set("fundingGoalGhs", e.target.value)}
          className={INPUT_CLASSNAME}
        />
      </label>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Status</span>
        <select value={values.status} onChange={(e) => set("status", e.target.value as ListingStatus)} className={INPUT_CLASSNAME}>
          {(Object.keys(LISTING_STATUS_LABEL) as ListingStatus[]).map((status) => (
            <option key={status} value={status}>
              {LISTING_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-grid-line pt-4">
        <button type="button" onClick={onCancel} className="font-sans text-sm text-cream-dim transition-colors hover:text-cream">
          Cancel
        </button>
        <button type="submit" className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2 font-jakarta text-sm font-medium text-amainblack">
          Save Changes
        </button>
      </div>
    </form>
  );
}
