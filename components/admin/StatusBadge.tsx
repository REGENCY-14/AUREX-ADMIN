// Generic status pill, same visual recipe the main site's own dashboard
// badges use (components/dashboard/InvestmentSlotCard.tsx,
// ListingStatusSection.tsx): rounded-full border, uppercase, tiny type.
// Each domain (applications/members/slots/listings) maps its own status
// enum to one of these four tones rather than this component knowing
// about every possible status string.
export type BadgeTone = "neutral" | "gold" | "success" | "danger";

// "danger" reuses #f87171 — not a new color: it's the same red the main
// site's own Leaderboard.tsx trend indicator and FormField.tsx error
// state already use for "declining"/negative, just applied to admin
// status pills instead of a trend arrow.
const TONE_CLASSNAME: Record<BadgeTone, string> = {
  neutral: "border-grid-line text-cream-dim",
  gold: "border-gold/30 text-gold-bright",
  success: "border-gold-bright/50 bg-gold-bright/10 text-gold-bright",
  danger: "border-[#f87171]/30 text-[#f87171]",
};

export default function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-0.5 font-jakarta text-[10px] font-medium uppercase tracking-wide ${TONE_CLASSNAME[tone]}`}
    >
      {label}
    </span>
  );
}
