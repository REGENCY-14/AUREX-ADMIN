"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift, hoverScale } from "@/lib/motion";
import { formatGhs, formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import Select from "@/components/admin/Select";
import DatePicker from "@/components/admin/DatePicker";
import Modal from "@/components/admin/Modal";
import EmptyState from "@/components/admin/EmptyState";
import StatusDot from "@/components/admin/StatusDot";
import { type BadgeTone } from "@/components/admin/StatusBadge";
import ActionsMenu, { type ActionMenuItem } from "@/components/admin/ActionsMenu";
import { CalendarIcon, PlusIcon, SpinnerIcon } from "@/components/icons";
import {
  fetchPayouts,
  markPayoutPaid,
  markPayoutMissed,
  isPayoutLate,
  type Payout,
  type PayoutStatus,
} from "@/lib/payouts";
import { fetchSeasons, createSeason, activateSeason, endSeason, type Season } from "@/lib/seasons";
import { ApiError } from "@/lib/api/client";
import { useSession } from "@/lib/auth";

const STATUS_TONE: Record<PayoutStatus, BadgeTone> = {
  scheduled: "neutral",
  paid: "success",
  missed: "danger",
  late: "danger",
};

const STATUS_LABEL: Record<PayoutStatus, string> = {
  scheduled: "Scheduled",
  paid: "Paid",
  missed: "Missed",
  late: "Late",
};

const SEASON_STATUS_TONE: Record<Season["status"], BadgeTone> = {
  draft: "neutral",
  active: "gold",
  ended: "neutral",
};

function displayStatus(payout: Payout): PayoutStatus {
  return isPayoutLate(payout) ? "late" : payout.status;
}

function amountCellText(payout: Payout): string {
  if (payout.status === "paid" && payout.paidAmountGhs !== undefined && payout.paidAmountGhs !== payout.amountGhs) {
    return `${formatGhs(payout.paidAmountGhs)} of ${formatGhs(payout.amountGhs)} scheduled`;
  }
  return formatGhs(payout.amountGhs);
}

function SeasonForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (values: { name: string; startDate: string; endDate: string }) => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = name.trim() && startDate && endDate && !isSubmitting;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setIsSubmitting(true);
        try {
          await onSave({ name, startDate, endDate });
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Season Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Q1 2026"
          className="w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold/50 focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Start Date</span>
          <DatePicker value={startDate} onChange={setStartDate} ariaLabel="Season start date" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">End Date</span>
          <DatePicker value={endDate} onChange={setEndDate} ariaLabel="Season end date" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-grid-line pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="font-sans text-sm text-cream-dim transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2 font-jakarta text-sm font-medium text-amainblack disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? <SpinnerIcon className="mx-auto size-4 animate-spin" /> : "Create Season"}
        </button>
      </div>
    </form>
  );
}

export default function PayoutsView() {
  const { session } = useSession();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">("all");
  const [banner, setBanner] = useState<string | null>(null);
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [payingPayout, setPayingPayout] = useState<Payout | null>(null);
  const [payAmountInput, setPayAmountInput] = useState("");
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    Promise.all([fetchPayouts(), fetchSeasons()]).then(([payoutRows, seasonRows]) => {
      if (cancelled) return;
      setPayouts(payoutRows);
      setSeasons(seasonRows);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const filtered = statusFilter === "all" ? payouts : payouts.filter((p) => displayStatus(p) === statusFilter);

  function openPayModal(payout: Payout) {
    setPayingPayout(payout);
    setPayAmountInput(String(payout.amountGhs));
  }

  async function handleConfirmPaid() {
    if (!payingPayout) return;
    const amount = Number(payAmountInput);
    if (!(amount > 0)) return;
    setIsMarkingPaid(true);
    try {
      const updated = await markPayoutPaid(payingPayout.id, amount);
      setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setBanner(`Marked ${formatGhs(amount)} paid to ${updated.nickname}.`);
      setPayingPayout(null);
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Failed to mark payout paid.");
    } finally {
      setIsMarkingPaid(false);
    }
  }

  async function handleMarkMissed(payout: Payout) {
    try {
      const updated = await markPayoutMissed(payout.id);
      setPayouts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setBanner(`Marked ${updated.nickname}'s payout missed.`);
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Failed to mark payout missed.");
    }
  }

  async function handleCreateSeason(values: { name: string; startDate: string; endDate: string }) {
    try {
      const season = await createSeason(values);
      setSeasons((prev) => [season, ...prev]);
      setBanner(`Season "${season.name}" created.`);
      setSeasonModalOpen(false);
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Failed to create season.");
    }
  }

  async function handleActivateSeason(season: Season) {
    try {
      const updated = await activateSeason(season.id);
      setSeasons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setBanner(`Season "${updated.name}" activated.`);
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Failed to activate season.");
    }
  }

  async function handleEndSeason(season: Season) {
    try {
      const updated = await endSeason(season.id);
      setSeasons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setBanner(`Season "${updated.name}" ended.`);
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Failed to end season.");
    }
  }

  function seasonActions(season: Season): ActionMenuItem[] {
    const items: ActionMenuItem[] = [];
    if (season.status === "draft") items.push({ key: "activate", label: "Activate", tone: "gold", onClick: () => handleActivateSeason(season) });
    if (season.status === "active") items.push({ key: "end", label: "End", tone: "danger", onClick: () => handleEndSeason(season) });
    return items;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader
        title="Payouts & Seasons"
        description="Scheduled payouts are generated automatically when an investment activates. Marking one paid updates that investment's earnings."
        action={
          <motion.button
            {...hoverScale}
            type="button"
            onClick={() => setSeasonModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2.5 font-jakarta text-sm font-medium text-amainblack"
          >
            <PlusIcon className="size-3.5" /> New Season
          </motion.button>
        }
      />

      {banner && (
        <motion.div variants={staggerItem} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {banner}
        </motion.div>
      )}

      {isLoading ? (
        <motion.div
          variants={staggerItem}
          className="flex items-center justify-center gap-2 border border-grid-line bg-panel/20 p-8 font-sans text-sm text-cream-dim"
        >
          <SpinnerIcon className="size-4 animate-spin" /> Loading payouts…
        </motion.div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="flex flex-col gap-3">
            <h2 className="font-jakarta text-base font-semibold text-cream">Seasons</h2>
            {seasons.length === 0 ? (
              <p className="font-sans text-sm text-cream-dim">
                No seasons yet — payouts still generate fine without one, they just won&apos;t be tagged to a season.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {seasons.map((season) => (
                  <div
                    key={season.id}
                    className="flex flex-wrap items-center justify-between gap-3 border border-grid-line bg-panel/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-jakarta text-sm font-medium text-cream">{season.name}</span>
                      <span className="font-sans text-xs text-cream-dim">
                        {formatDisplayDate(season.startDate)} – {formatDisplayDate(season.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusDot
                        label={season.status === "draft" ? "Draft" : season.status === "active" ? "Active" : "Ended"}
                        tone={SEASON_STATUS_TONE[season.status]}
                      />
                      {seasonActions(season).length > 0 && <ActionsMenu label={`${season.name} actions`} items={seasonActions(season)} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as PayoutStatus | "all")}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "scheduled", label: "Scheduled" },
                { value: "late", label: "Late" },
                { value: "paid", label: "Paid" },
                { value: "missed", label: "Missed" },
              ]}
              ariaLabel="Filter by status"
            />
            <span className="font-sans text-xs text-cream-dim">
              {filtered.length} of {payouts.length}
            </span>
          </motion.div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No payouts to show"
              description="Payouts appear here once a member's investment is recorded and activated."
            />
          ) : (
            <>
              <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-grid-line bg-panel/40">
                      <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Member</th>
                      <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Package</th>
                      <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Amount</th>
                      <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Scheduled</th>
                      <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
                      <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((payout) => {
                      const status = displayStatus(payout);
                      const actions: ActionMenuItem[] =
                        payout.status === "scheduled"
                          ? [
                              { key: "paid", label: "Mark Paid", tone: "gold", onClick: () => openPayModal(payout) },
                              { key: "missed", label: "Mark Missed", tone: "danger", onClick: () => handleMarkMissed(payout) },
                            ]
                          : [];
                      return (
                        <motion.tr key={payout.id} {...hoverLift} className="border-b border-grid-line last:border-b-0 hover:bg-panel/30">
                          <td className="px-4 py-3 font-jakarta text-sm font-medium text-cream">{payout.nickname}</td>
                          <td className="px-4 py-3 font-sans text-sm text-cream-dim">{payout.businessName ?? payout.packageName}</td>
                          <td className="px-4 py-3 font-jakarta text-sm font-semibold text-gold-bright">{amountCellText(payout)}</td>
                          <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatDisplayDate(payout.scheduledDate)}</td>
                          <td className="px-4 py-3">
                            <StatusDot label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
                          </td>
                          <td className="px-4 py-3">{actions.length > 0 && <ActionsMenu label={`${payout.nickname} payout actions`} items={actions} />}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>

              <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
                {filtered.map((payout) => {
                  const status = displayStatus(payout);
                  const actions: ActionMenuItem[] =
                    payout.status === "scheduled"
                      ? [
                          { key: "paid", label: "Mark Paid", tone: "gold", onClick: () => openPayModal(payout) },
                          { key: "missed", label: "Mark Missed", tone: "danger", onClick: () => handleMarkMissed(payout) },
                        ]
                      : [];
                  return (
                    <motion.div key={payout.id} {...hoverLift} className="flex flex-col gap-2 border border-grid-line bg-panel/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-jakarta text-sm font-semibold text-cream">{payout.nickname}</span>
                        <div className="flex items-center gap-2">
                          <StatusDot label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
                          {actions.length > 0 && <ActionsMenu label={`${payout.nickname} payout actions`} items={actions} />}
                        </div>
                      </div>
                      <span className="font-sans text-sm text-cream-dim">{payout.businessName ?? payout.packageName}</span>
                      <span className="font-sans text-xs text-cream-dim">
                        {amountCellText(payout)} · Scheduled {formatDisplayDate(payout.scheduledDate)}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </>
      )}

      <Modal isOpen={seasonModalOpen} onClose={() => setSeasonModalOpen(false)} title="Create Season">
        <SeasonForm onCancel={() => setSeasonModalOpen(false)} onSave={handleCreateSeason} />
      </Modal>

      <Modal
        isOpen={payingPayout !== null}
        onClose={() => setPayingPayout(null)}
        title="Record Payout Payment"
        description="Defaults to the scheduled amount — lower it if the business could only pay part of it this round."
      >
        <div className="flex flex-col gap-4">
          {payingPayout && (
            <p className="font-sans text-sm text-cream-dim">
              Scheduled: {formatGhs(payingPayout.amountGhs)} to {payingPayout.nickname}
            </p>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">Amount Actually Paid (GHS)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={payAmountInput}
              onChange={(e) => setPayAmountInput(e.target.value)}
              className="w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream focus:border-gold/50 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-grid-line pt-4">
            <button
              type="button"
              onClick={() => setPayingPayout(null)}
              disabled={isMarkingPaid}
              className="font-sans text-sm text-cream-dim transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <motion.button
              {...hoverScale}
              type="button"
              onClick={handleConfirmPaid}
              disabled={!(Number(payAmountInput) > 0) || isMarkingPaid}
              className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2 font-jakarta text-sm font-medium text-amainblack disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isMarkingPaid ? <SpinnerIcon className="mx-auto size-4 animate-spin" /> : "Confirm Paid"}
            </motion.button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
