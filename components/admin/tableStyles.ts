/**
 * Shared table-row visual treatments, introduced per feedback with a
 * reference employee table: a flagged row (rejected/suspended/closed —
 * this brand's "danger" tone) gets a colored left border plus a faint
 * tint of that same color instead of blending in with every other row,
 * and a plain text action becomes a small tinted, circular icon button.
 * Square everywhere else in this app stays square — only this marker
 * border and the icon button's own shape are round, per that feedback's
 * "ignore the rounded-md" (take the design, not the reference's own
 * card/button corner radius).
 */
export const DANGER_ROW_CLASSNAME = "border-l-2 border-l-[#f87171] bg-[#f87171]/5";

const ICON_BUTTON_TONE_CLASSNAME = {
  gold: "bg-gold/10 text-gold-bright hover:bg-gold/20",
  danger: "bg-[#f87171]/10 text-[#f87171] hover:bg-[#f87171]/20",
  neutral: "bg-cream-dim/10 text-cream-dim hover:bg-cream-dim/20 hover:text-cream",
} as const;

export function iconButtonClassName(tone: keyof typeof ICON_BUTTON_TONE_CLASSNAME = "neutral") {
  return `flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${ICON_BUTTON_TONE_CLASSNAME[tone]}`;
}

/** A small initials avatar for person-rows (Applications, Members) —
 *  this repo has no member photos, so this stands in for the reference
 *  table's avatar column honestly rather than faking a headshot. */
export const AVATAR_CLASSNAME =
  "flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 font-jakarta text-xs font-semibold text-gold-bright";
