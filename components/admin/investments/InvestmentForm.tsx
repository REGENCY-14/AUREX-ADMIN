"use client";

import { useState } from "react";
import { hoverScale } from "@/lib/motion";
import { motion } from "framer-motion";
import { UploadIcon } from "@/components/icons";
import { SLOT_PACKAGE_LABEL, type InvestmentSlot } from "@/lib/investmentSlots";
import type { Member } from "@/lib/members";

const INPUT_CLASSNAME =
  "w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold/50 focus:outline-none";
const LABEL_CLASSNAME = "flex flex-col gap-1.5";
const LABEL_TEXT_CLASSNAME = "font-sans text-xs uppercase tracking-wide text-cream-dim";

export type InvestmentFormValues = {
  memberId: string;
  slotId: string;
  amountInvestedGhs: string;
  dateInvested: string;
  proofOfPaymentFileName?: string;
  notes: string;
};

const EMPTY_VALUES: InvestmentFormValues = {
  memberId: "",
  slotId: "",
  amountInvestedGhs: "",
  dateInvested: "",
  notes: "",
};

/**
 * The Investment Recording Tool's form. Slot options are limited to
 * `openSlots` (passed in already filtered) — recording a fresh deposit
 * against a draft or already-closed slot isn't a real scenario. A
 * top-up (an existing member investing again, even into the same slot)
 * submits through this exact same form and always creates a new record —
 * there's no "edit an existing investment's amount" path here on purpose,
 * per the brief, to preserve history.
 *
 * The file input is real (native <input type="file">) but only ever
 * reads the file's name into state — there's no file storage backend
 * yet, and this admin app doesn't use localStorage/sessionStorage to
 * fake persisting the file itself.
 */
export default function InvestmentForm({
  investors,
  openSlots,
  onSubmit,
}: {
  investors: Member[];
  openSlots: InvestmentSlot[];
  onSubmit: (values: InvestmentFormValues) => void;
}) {
  const [values, setValues] = useState<InvestmentFormValues>(EMPTY_VALUES);

  function set<K extends keyof InvestmentFormValues>(key: K, value: InvestmentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.memberId && values.slotId && Number(values.amountInvestedGhs) > 0 && values.dateInvested;

  return (
    <form
      className="flex flex-col gap-4 border border-grid-line bg-panel/20 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit(values);
        setValues(EMPTY_VALUES);
      }}
    >
      <h2 className="font-jakarta text-lg font-semibold text-cream">Record an Investment</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Member</span>
          <select value={values.memberId} onChange={(e) => set("memberId", e.target.value)} className={INPUT_CLASSNAME}>
            <option value="">— Select an investor —</option>
            {investors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nickname}
              </option>
            ))}
          </select>
        </label>

        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Slot / Package</span>
          <select value={values.slotId} onChange={(e) => set("slotId", e.target.value)} className={INPUT_CLASSNAME}>
            <option value="">— Select an open slot —</option>
            {openSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {SLOT_PACKAGE_LABEL[s.package]} ({s.ratePercentLabel})
              </option>
            ))}
          </select>
        </label>

        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Amount Invested (GHS)</span>
          <input
            type="number"
            min={0}
            value={values.amountInvestedGhs}
            onChange={(e) => set("amountInvestedGhs", e.target.value)}
            placeholder="e.g. 5000"
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className={LABEL_CLASSNAME}>
          <span className={LABEL_TEXT_CLASSNAME}>Date Invested</span>
          <input type="date" value={values.dateInvested} onChange={(e) => set("dateInvested", e.target.value)} className={INPUT_CLASSNAME} />
        </label>
      </div>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Proof of Payment (optional)</span>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 border border-grid-line px-3 py-2 font-jakarta text-xs font-medium text-cream-dim transition-colors hover:text-cream">
            <UploadIcon className="size-3.5" />
            Choose File
            <input
              type="file"
              className="sr-only"
              onChange={(e) => set("proofOfPaymentFileName", e.target.files?.[0]?.name)}
            />
          </label>
          <span className="truncate font-sans text-xs text-cream-dim">{values.proofOfPaymentFileName ?? "No file selected"}</span>
        </div>
      </label>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Notes (optional)</span>
        <textarea
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="e.g. Top-up into existing Ventures slot"
          className={INPUT_CLASSNAME}
        />
      </label>

      <div>
        <motion.button
          {...hoverScale}
          type="submit"
          disabled={!canSubmit}
          className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-5 py-2.5 font-jakarta text-sm font-medium text-amainblack disabled:cursor-not-allowed disabled:opacity-40"
        >
          Record Investment
        </motion.button>
      </div>
    </form>
  );
}
