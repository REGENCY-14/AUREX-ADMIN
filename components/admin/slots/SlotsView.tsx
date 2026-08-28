"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift, hoverScale } from "@/lib/motion";
import { formatGhs, formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import { type BadgeTone } from "@/components/admin/StatusBadge";
import StatusDot from "@/components/admin/StatusDot";
import Select from "@/components/admin/Select";
import { DANGER_ROW_CLASSNAME } from "@/components/admin/tableStyles";
import ActionsMenu, { type ActionMenuItem } from "@/components/admin/ActionsMenu";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
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

/** The two package tables share every column/action but "Business" (Core
 *  slots never have a linked listing, so that column would be a dead "—"
 *  down the whole table) — factored out once rather than duplicated per
 *  package, called below for "core" and "ventures" in turn. */
function SlotTable({
  slots,
  listingsById,
  showBusinessColumn,
  onPublish,
  onCloseEarly,
  onEdit,
}: {
  slots: InvestmentSlot[];
  listingsById: Record<string, BusinessListing>;
  showBusinessColumn: boolean;
  onPublish: (slot: InvestmentSlot) => void;
  onCloseEarly: (slot: InvestmentSlot) => void;
  onEdit: (slot: InvestmentSlot) => void;
}) {
  function actionItems(slot: InvestmentSlot): ActionMenuItem[] {
    const items: ActionMenuItem[] = [];
    if (slot.status === "draft") {
      items.push({ key: "publish", label: "Publish", tone: "gold", onClick: () => onPublish(slot) });
    }
    if (slot.status === "open") {
      items.push({ key: "closeEarly", label: "Close Early", tone: "danger", onClick: () => onCloseEarly(slot) });
    }
    items.push({ key: "edit", label: "Edit", icon: PencilIcon, onClick: () => onEdit(slot) });
    return items;
  }

  return (
    <>
      <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-grid-line bg-panel/40">
              {showBusinessColumn && (
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Business</th>
              )}
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Min. / Rate</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Window</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
              <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 && (
              <tr>
                <td colSpan={showBusinessColumn ? 5 : 4} className="px-4 py-6 text-center font-sans text-sm text-cream-dim">
                  No slots match this filter.
                </td>
              </tr>
            )}
            {slots.map((slot) => {
              const listing = slot.businessListingId ? listingsById[slot.businessListingId] : undefined;
              return (
                <motion.tr
                  key={slot.id}
                  {...hoverLift}
                  className={`border-b border-grid-line last:border-b-0 hover:bg-panel/30 ${
                    slot.status === "closed" ? DANGER_ROW_CLASSNAME : ""
                  }`}
                >
                  {showBusinessColumn && (
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{listing?.businessName ?? "—"}</td>
                  )}
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
                    <ActionsMenu label={`${SLOT_PACKAGE_LABEL[slot.package]} slot actions`} items={actionItems(slot)} />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
        {slots.length === 0 && (
          <p className="border border-grid-line bg-panel/20 px-4 py-6 text-center font-sans text-sm text-cream-dim">
            No slots match this filter.
          </p>
        )}
        {slots.map((slot) => {
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
                <span className="font-jakarta text-sm font-semibold text-cream">
                  {listing ? listing.businessName : SLOT_PACKAGE_LABEL[slot.package]}
                </span>
                <div className="flex items-center gap-2">
                  <StatusDot label={SLOT_STATUS_LABEL[slot.status]} tone={STATUS_TONE[slot.status]} />
                  <ActionsMenu label={`${SLOT_PACKAGE_LABEL[slot.package]} slot actions`} items={actionItems(slot)} />
                </div>
              </div>
              <span className="font-sans text-xs text-cream-dim">
                {formatGhs(slot.minInvestmentGhs)} min · {slot.ratePercentLabel} ·{" "}
                {slot.opensAt ? formatDisplayDate(slot.opensAt) : "—"} – {slot.closesAt ? formatDisplayDate(slot.closesAt) : "—"}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

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
  const [confirmSlotAction, setConfirmSlotAction] = useState<{ type: "publish" | "closeEarly"; slot: InvestmentSlot } | null>(null);

  const filtered = useMemo(
    () => slots.filter((s) => statusFilter === "all" || s.status === statusFilter),
    [slots, statusFilter]
  );

  const coreSlots = useMemo(() => filtered.filter((s) => s.package === "core"), [filtered]);
  const venturesSlots = useMemo(() => filtered.filter((s) => s.package === "ventures"), [filtered]);

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

      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        <h2 className="font-jakarta text-base font-semibold text-cream">AUREX Core</h2>
        <SlotTable
          slots={coreSlots}
          listingsById={listingsById}
          showBusinessColumn={false}
          onPublish={(slot) => setConfirmSlotAction({ type: "publish", slot })}
          onCloseEarly={(slot) => setConfirmSlotAction({ type: "closeEarly", slot })}
          onEdit={(slot) => setModalSlot(slot)}
        />
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        <h2 className="font-jakarta text-base font-semibold text-cream">AUREX Ventures</h2>
        <SlotTable
          slots={venturesSlots}
          listingsById={listingsById}
          showBusinessColumn={true}
          onPublish={(slot) => setConfirmSlotAction({ type: "publish", slot })}
          onCloseEarly={(slot) => setConfirmSlotAction({ type: "closeEarly", slot })}
          onEdit={(slot) => setModalSlot(slot)}
        />
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

      <ConfirmDialog
        isOpen={confirmSlotAction !== null}
        onClose={() => setConfirmSlotAction(null)}
        onConfirm={() => {
          if (!confirmSlotAction) return;
          if (confirmSlotAction.type === "publish") handlePublishFromList(confirmSlotAction.slot);
          else handleCloseEarly(confirmSlotAction.slot);
        }}
        title={
          confirmSlotAction?.type === "publish"
            ? "Publish this slot?"
            : "Close this slot early?"
        }
        description={
          confirmSlotAction?.type === "publish"
            ? `“${SLOT_PACKAGE_LABEL[confirmSlotAction.slot.package]}” will open for investment immediately.`
            : confirmSlotAction
              ? `“${SLOT_PACKAGE_LABEL[confirmSlotAction.slot.package]}” will stop accepting new investment right away.`
              : undefined
        }
        confirmLabel={confirmSlotAction?.type === "publish" ? "Publish" : "Close Early"}
        tone={confirmSlotAction?.type === "publish" ? "gold" : "danger"}
      />
    </motion.div>
  );
}
