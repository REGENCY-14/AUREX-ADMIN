"use client";

import { useState } from "react";
import Select from "@/components/admin/Select";
import DatePicker from "@/components/admin/DatePicker";
import type { BusinessListing } from "@/lib/businessListings";
import type { InvestmentSlot, SlotPackage } from "@/lib/investmentSlots";

const INPUT_CLASSNAME =
  "w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold/50 focus:outline-none";
const LABEL_CLASSNAME = "flex flex-col gap-1.5";
const LABEL_TEXT_CLASSNAME = "font-sans text-xs uppercase tracking-wide text-cream-dim";

export type SlotFormValues = {
  package: SlotPackage;
  businessListingId: string;
  minInvestmentGhs: string;
  termLabel: string;
  ratePercentLabel: string;
  opensAt: string;
  closesAt: string;
};

function toFormValues(slot?: InvestmentSlot): SlotFormValues {
  return {
    package: slot?.package ?? "core",
    businessListingId: slot?.businessListingId ?? "",
    minInvestmentGhs: slot ? String(slot.minInvestmentGhs) : "",
    termLabel: slot?.termLabel ?? "",
    ratePercentLabel: slot?.ratePercentLabel ?? "",
    opensAt: slot?.opensAt ?? "",
    closesAt: slot?.closesAt ?? "",
  };
}

/**
 * The Investment Slot create/edit form — shared by both, since editing a
 * draft/open slot is the same field set as creating one. Rendered inside
 * components/admin/Modal.tsx by SlotsView.
 *
 * The business selector only appears (and is required to publish) for a
 * Ventures slot — `approvedListings` is already filtered to "past
 * pending" by the caller (see lib/businessListings.ts's own
 * getApprovedListings), per the brief's own validation rule.
 */
export default function SlotForm({
  slot,
  approvedListings,
  onCancel,
  onSaveDraft,
  onPublish,
  publishError,
}: {
  slot?: InvestmentSlot;
  approvedListings: BusinessListing[];
  onCancel: () => void;
  onSaveDraft: (values: SlotFormValues) => void;
  onPublish: (values: SlotFormValues) => void;
  publishError?: string;
}) {
  const [values, setValues] = useState<SlotFormValues>(() => toFormValues(slot));

  function set<K extends keyof SlotFormValues>(key: K, value: SlotFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Package Type</span>
        <Select
          value={values.package}
          onChange={(v) => set("package", v as SlotPackage)}
          options={[
            { value: "core", label: "AUREX Core" },
            { value: "ventures", label: "AUREX Ventures" },
          ]}
        />
      </label>

      {values.package === "ventures" && (
        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Linked Business (approved listings only)</span>
          <Select
            value={values.businessListingId}
            onChange={(v) => set("businessListingId", v)}
            options={[
              { value: "", label: "— Select a business —" },
              ...approvedListings.map((listing) => ({ value: listing.id, label: listing.businessName })),
            ]}
          />
        </label>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Minimum Investment (GHS)</span>
          <input
            type="number"
            min={0}
            value={values.minInvestmentGhs}
            onChange={(e) => set("minInvestmentGhs", e.target.value)}
            placeholder="e.g. 2000"
            className={INPUT_CLASSNAME}
          />
        </label>
        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Interest Rate</span>
          <input
            type="text"
            value={values.ratePercentLabel}
            onChange={(e) => set("ratePercentLabel", e.target.value)}
            placeholder="e.g. 14% p.a."
            className={INPUT_CLASSNAME}
          />
        </label>
      </div>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Term</span>
        <input
          type="text"
          value={values.termLabel}
          onChange={(e) => set("termLabel", e.target.value)}
          placeholder="e.g. 12-month term"
          className={INPUT_CLASSNAME}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Opens</span>
          <DatePicker value={values.opensAt} onChange={(v) => set("opensAt", v)} ariaLabel="Opens on" />
        </label>
        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Closes</span>
          <DatePicker value={values.closesAt} onChange={(v) => set("closesAt", v)} ariaLabel="Closes on" />
        </label>
      </div>

      {publishError && <p className="font-sans text-sm text-[#f87171]">{publishError}</p>}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-grid-line pt-4">
        <button type="button" onClick={onCancel} className="font-sans text-sm text-cream-dim transition-colors hover:text-cream">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSaveDraft(values)}
          className="border border-gold/30 px-4 py-2 font-jakarta text-sm font-medium text-gold-bright transition-colors hover:border-gold hover:bg-gold/5"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => onPublish(values)}
          className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2 font-jakarta text-sm font-medium text-amainblack"
        >
          Publish
        </button>
      </div>
    </form>
  );
}
