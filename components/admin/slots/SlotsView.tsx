"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift, hoverScale } from "@/lib/motion";
import { formatGhs, formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import { type BadgeTone } from "@/components/admin/StatusBadge";
import StatusDot from "@/components/admin/StatusDot";
import Select from "@/components/admin/Select";
import { DANGER_ROW_CLASSNAME, iconButtonClassName } from "@/components/admin/tableStyles";
import Modal from "@/components/admin/Modal";
import SlotForm, { type SlotFormValues } from "@/components/admin/slots/SlotForm";
import { PencilIcon, PlusIcon } from "@/components/icons";
import {
  SLOT_PACKAGE_LABEL,
  SLOT_STATUS_LABEL,
  canPublishSlot,
  type InvestmentSlot,
  type SlotStatus,
} from "@/lib/investmentSlots";
import type { BusinessListing } from "@/lib/businessListings";

const STATUS_TONE: Record<SlotStatus, BadgeTone> = {
  draft: "neutral",
  open: "gold",
  closed: "danger",
};

function fromFormValues(values: SlotFormValues, existing?: InvestmentSlot): Omit<InvestmentSlot, "id" | "status"> {
  return {
    package: values.package,
    businessListingId: values.package === "ventures" ? values.businessListingId || undefined : undefined,
    minInvestmentGhs: Number(values.minInvestmentGhs) || 0,
    termLabel: values.termLabel || "—",
    ratePercentLabel: values.ratePercentLabel || "—",
    opensAt: values.opensAt || existing?.opensAt || "",
    closesAt: values.closesAt || existing?.closesAt || "",
  };
}

/**
 * Investment Slot Management: list + a create/edit form presented as a
 * modal (rather than a separate route) so Publish/Edit/Close early and
 * the form itself can all mutate one local `slots` array directly — no
 * cross-route state-sharing problem to solve for a mock/no-backend tool.
 * See ApplicationDetailView's own comment for why Applications/Members
 * instead use full detail *pages*: those need room for documents/history
 * a modal can't comfortably hold, this genuinely is just a form.
 */
export default function SlotsView({
  slots: initialSlots,
  listingsById,
  approvedListings,
  initialStatus = "all",
}: {
  slots: InvestmentSlot[];
  listingsById: Record<string, BusinessListing>;
  approvedListings: BusinessListing[];
  initialStatus?: SlotStatus | "all";
}) {
  const [slots, setSlots] = useState(initialSlots);
  const [statusFilter, setStatusFilter] = useState<SlotStatus | "all">(initialStatus);
  const [modalSlot, setModalSlot] = useState<InvestmentSlot | "new" | null>(null);
  const [publishError, setPublishError] = useState<string | undefined>(undefined);
  const [banner, setBanner] = useState<string | null>(null);

  const filtered = useMemo(
    () => slots.filter((s) => statusFilter === "all" || s.status === statusFilter),
    [slots, statusFilter]
  );

  function closeModal() {
    setModalSlot(null);
    setPublishError(undefined);
  }

  function handleSaveDraft(values: SlotFormValues) {
    if (modalSlot === "new") {
      const id = `slot-${Math.random().toString(36).slice(2, 8)}`;
      setSlots((prev) => [...prev, { id, status: "draft", ...fromFormValues(values) }]);
      setBanner("Slot saved as a draft.");
    } else if (modalSlot) {
      const id = modalSlot.id;
      setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...fromFormValues(values, s) } : s)));
      setBanner("Slot updated and kept as a draft.");
    }
    closeModal();
  }

  function handlePublishFromForm(values: SlotFormValues) {
    const draft = fromFormValues(values, modalSlot !== "new" ? modalSlot ?? undefined : undefined);
    if (!canPublishSlot(draft)) {
      setPublishError("Cannot publish: a Ventures slot must be linked to an approved business listing.");
      return;
    }
    if (modalSlot === "new") {
      const id = `slot-${Math.random().toString(36).slice(2, 8)}`;
      setSlots((prev) => [...prev, { id, status: "open", ...draft }]);
    } else if (modalSlot) {
      const id = modalSlot.id;
      setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...draft, status: "open" } : s)));
    }
    setBanner("Slot published — now open for investment.");
    closeModal();
  }

  function handlePublishFromList(slot: InvestmentSlot) {
    if (!canPublishSlot(slot)) {
      setBanner(`Cannot publish “${SLOT_PACKAGE_LABEL[slot.package]}” — it needs a linked, approved business listing first.`);
      return;
    }
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "open" } : s)));
    setBanner("Slot published — now open for investment.");
  }

  function handleCloseEarly(slot: InvestmentSlot) {
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "closed" } : s)));
    setBanner(`“${SLOT_PACKAGE_LABEL[slot.package]}” slot closed early.`);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader
        title="Investment Slot Management"
        description="Publish and manage AUREX Core and Ventures investment slots."
        action={
          <motion.button
            {...hoverScale}
            type="button"
            onClick={() => setModalSlot("new")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2.5 font-jakarta text-sm font-medium text-amainblack"
          >
            <PlusIcon className="size-3.5" /> Create Slot
          </motion.button>
        }
      />

      {banner && (
        <motion.div variants={staggerItem} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {banner}
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as SlotStatus | "all")}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "draft", label: "Draft" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
          ]}
          ariaLabel="Filter by status"
        />
        <span className="font-sans text-xs text-cream-dim">
          {filtered.length} of {slots.length}
        </span>
      </motion.div>

      <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-grid-line bg-panel/40">
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Package</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Business</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Min. / Rate</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Window</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((slot) => {
              const listing = slot.businessListingId ? listingsById[slot.businessListingId] : undefined;
              return (
                <motion.tr
                  key={slot.id}
                  {...hoverLift}
                  className={`border-b border-grid-line last:border-b-0 hover:bg-panel/30 ${
                    slot.status === "closed" ? DANGER_ROW_CLASSNAME : ""
                  }`}
                >
                  <td className="px-4 py-3 font-jakarta text-sm font-medium text-cream">{SLOT_PACKAGE_LABEL[slot.package]}</td>
                  <td className="px-4 py-3 font-sans text-sm text-cream-dim">{listing?.businessName ?? "—"}</td>
                  <td className="px-4 py-3 font-sans text-sm text-cream-dim">
                    {formatGhs(slot.minInvestmentGhs)} · {slot.ratePercentLabel}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-cream-dim">
                    {slot.opensAt ? formatDisplayDate(slot.opensAt) : "—"} – {slot.closesAt ? formatDisplayDate(slot.closesAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot label={SLOT_STATUS_LABEL[slot.status]} tone={STATUS_TONE[slot.status]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {slot.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => handlePublishFromList(slot)}
                          className="border border-gold/30 px-2.5 py-1 font-jakarta text-xs font-medium text-gold-bright transition-colors hover:border-gold hover:bg-gold/5"
                        >
                          Publish
                        </button>
                      )}
                      {slot.status === "open" && (
                        <button
                          type="button"
                          onClick={() => handleCloseEarly(slot)}
                          className="border border-[#f87171]/30 px-2.5 py-1 font-jakarta text-xs font-medium text-[#f87171] transition-colors hover:border-[#f87171] hover:bg-[#f87171]/10"
                        >
                          Close Early
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setModalSlot(slot)}
                        aria-label={`Edit ${SLOT_PACKAGE_LABEL[slot.package]} slot`}
                        className={iconButtonClassName("neutral")}
                      >
                        <PencilIcon className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
        {filtered.map((slot) => {
          const listing = slot.businessListingId ? listingsById[slot.businessListingId] : undefined;
          return (
            <motion.div
              key={slot.id}
              {...hoverLift}
              className={`flex flex-col gap-2 border border-grid-line bg-panel/20 p-4 ${
                slot.status === "closed" ? DANGER_ROW_CLASSNAME : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-jakarta text-sm font-semibold text-cream">{SLOT_PACKAGE_LABEL[slot.package]}</span>
                <StatusDot label={SLOT_STATUS_LABEL[slot.status]} tone={STATUS_TONE[slot.status]} />
              </div>
              {listing && <span className="font-sans text-sm text-cream-dim">{listing.businessName}</span>}
              <span className="font-sans text-xs text-cream-dim">
                {formatGhs(slot.minInvestmentGhs)} min · {slot.ratePercentLabel} ·{" "}
                {slot.opensAt ? formatDisplayDate(slot.opensAt) : "—"} – {slot.closesAt ? formatDisplayDate(slot.closesAt) : "—"}
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {slot.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => handlePublishFromList(slot)}
                    className="border border-gold/30 px-2.5 py-1 font-jakarta text-xs font-medium text-gold-bright"
                  >
                    Publish
                  </button>
                )}
                {slot.status === "open" && (
                  <button
                    type="button"
                    onClick={() => handleCloseEarly(slot)}
                    className="border border-[#f87171]/30 px-2.5 py-1 font-jakarta text-xs font-medium text-[#f87171]"
                  >
                    Close Early
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalSlot(slot)}
                  aria-label={`Edit ${SLOT_PACKAGE_LABEL[slot.package]} slot`}
                  className={iconButtonClassName("neutral")}
                >
                  <PencilIcon className="size-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <Modal
        isOpen={modalSlot !== null}
        onClose={closeModal}
        title={modalSlot === "new" ? "Create Investment Slot" : "Edit Investment Slot"}
        description="Ventures slots must link to an approved business listing before they can be published."
      >
        <SlotForm
          key={modalSlot === "new" ? "new" : modalSlot?.id}
          slot={modalSlot && modalSlot !== "new" ? modalSlot : undefined}
          approvedListings={approvedListings}
          onCancel={closeModal}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishFromForm}
          publishError={publishError}
        />
      </Modal>
    </motion.div>
  );
}
