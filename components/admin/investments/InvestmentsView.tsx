"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift, hoverScale } from "@/lib/motion";
import { formatGhs, formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import Modal from "@/components/admin/Modal";
import InvestmentForm, { type InvestmentFormValues } from "@/components/admin/investments/InvestmentForm";
import { SLOT_PACKAGE_LABEL, type InvestmentSlot } from "@/lib/investmentSlots";
import type { Member } from "@/lib/members";
import type { InvestmentRecord } from "@/lib/investments";

/**
 * The Investment Recording Tool: a form (creates a new record — a top-up
 * is always a new record, never an edit, per the brief) plus the table of
 * existing records with a separate "Update Earnings" action per row. One
 * page, local state — no cross-route persistence problem to solve here.
 */
export default function InvestmentsView({
  records: initialRecords,
  investors,
  openSlots,
  membersById,
  slotsById,
}: {
  records: InvestmentRecord[];
  investors: Member[];
  openSlots: InvestmentSlot[];
  membersById: Record<string, Member>;
  slotsById: Record<string, InvestmentSlot>;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [banner, setBanner] = useState<string | null>(null);
  const [editingEarnings, setEditingEarnings] = useState<InvestmentRecord | null>(null);
  const [earningsInput, setEarningsInput] = useState("");

  function handleRecord(values: InvestmentFormValues) {
    const member = membersById[values.memberId];
    const id = `inv-${Math.random().toString(36).slice(2, 8)}`;
    const record: InvestmentRecord = {
      id,
      memberId: values.memberId,
      slotId: values.slotId,
      amountInvestedGhs: Number(values.amountInvestedGhs) || 0,
      dateInvested: values.dateInvested,
      proofOfPaymentFileName: values.proofOfPaymentFileName,
      notes: values.notes || undefined,
      earningsToDateGhs: 0,
      lastEarningsUpdate: values.dateInvested,
    };
    setRecords((prev) => [record, ...prev]);
    setBanner(`Recorded ${formatGhs(record.amountInvestedGhs)} for ${member?.nickname ?? "member"}.`);
  }

  function openEarningsModal(record: InvestmentRecord) {
    setEditingEarnings(record);
    setEarningsInput(String(record.earningsToDateGhs));
  }

  function handleSaveEarnings() {
    if (!editingEarnings) return;
    const value = Number(earningsInput) || 0;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === editingEarnings.id
          ? { ...r, earningsToDateGhs: value, lastEarningsUpdate: new Date().toISOString().slice(0, 10) }
          : r
      )
    );
    setBanner(`Earnings to date updated for ${membersById[editingEarnings.memberId]?.nickname ?? "member"}.`);
    setEditingEarnings(null);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader title="Investment Recording Tool" description="Record new investments and keep each one's earnings to date up to date." />

      {banner && (
        <motion.div variants={staggerItem} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {banner}
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <InvestmentForm investors={investors} openSlots={openSlots} onSubmit={handleRecord} />
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        <h2 className="font-jakarta text-lg font-semibold text-cream">All Investment Records</h2>

        <div className="hidden overflow-x-auto border border-grid-line lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-grid-line bg-panel/40">
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Member</th>
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Slot</th>
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Amount</th>
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Date</th>
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Earnings to Date</th>
                <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Update</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <motion.tr key={record.id} {...hoverLift} className="border-b border-grid-line last:border-b-0 hover:bg-panel/30">
                  <td className="px-4 py-3 font-jakarta text-sm font-medium text-cream">{membersById[record.memberId]?.nickname ?? "—"}</td>
                  <td className="px-4 py-3 font-sans text-sm text-cream-dim">
                    {slotsById[record.slotId] ? SLOT_PACKAGE_LABEL[slotsById[record.slotId].package] : "—"}
                  </td>
                  <td className="px-4 py-3 font-jakarta text-sm font-semibold text-gold-bright">{formatGhs(record.amountInvestedGhs)}</td>
                  <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatDisplayDate(record.dateInvested)}</td>
                  <td className="px-4 py-3 font-sans text-sm text-cream-dim">
                    {formatGhs(record.earningsToDateGhs)}{" "}
                    <span className="text-xs">(as of {formatDisplayDate(record.lastEarningsUpdate)})</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEarningsModal(record)}
                      className="border border-grid-line px-2.5 py-1 font-jakarta text-xs font-medium text-cream-dim transition-colors hover:text-cream"
                    >
                      Update Earnings
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          {records.map((record) => (
            <motion.div key={record.id} {...hoverLift} className="flex flex-col gap-2 border border-grid-line bg-panel/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-jakarta text-sm font-semibold text-cream">{membersById[record.memberId]?.nickname ?? "—"}</span>
                <span className="font-jakarta text-sm font-semibold text-gold-bright">{formatGhs(record.amountInvestedGhs)}</span>
              </div>
              <span className="font-sans text-sm text-cream-dim">
                {slotsById[record.slotId] ? SLOT_PACKAGE_LABEL[slotsById[record.slotId].package] : "—"} · {formatDisplayDate(record.dateInvested)}
              </span>
              <span className="font-sans text-xs text-cream-dim">
                Earnings to date: {formatGhs(record.earningsToDateGhs)} (as of {formatDisplayDate(record.lastEarningsUpdate)})
              </span>
              <button
                type="button"
                onClick={() => openEarningsModal(record)}
                className="mt-1 w-fit border border-grid-line px-2.5 py-1 font-jakarta text-xs font-medium text-cream-dim"
              >
                Update Earnings
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Modal
        isOpen={editingEarnings !== null}
        onClose={() => setEditingEarnings(null)}
        title="Update Earnings to Date"
        description="Manually recorded, same as the original figure — this doesn't calculate anything automatically."
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Earnings to Date (GHS)</span>
            <input
              type="number"
              min={0}
              value={earningsInput}
              onChange={(e) => setEarningsInput(e.target.value)}
              className="w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream focus:border-gold/50 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-grid-line pt-4">
            <button type="button" onClick={() => setEditingEarnings(null)} className="font-sans text-sm text-cream-dim transition-colors hover:text-cream">
              Cancel
            </button>
            <motion.button
              {...hoverScale}
              type="button"
              onClick={handleSaveEarnings}
              className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2 font-jakarta text-sm font-medium text-amainblack"
            >
              Save
            </motion.button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
