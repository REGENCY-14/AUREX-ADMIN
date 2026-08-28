"use client";

import { useState } from "react";

export type BarSegment = {
  key: string;
  label: string;
  value: number;
  /** A real CSS color value — a var(--color-*) reference so theme-flipped
   *  tokens (e.g. cream-dim) still flip correctly, or a literal hex for
   *  this brand's theme-neutral accents (e.g. #4ade80/#f87171) — rather
   *  than a Tailwind class, since this now also drives the track's own
   *  gradient and glow, which can't take a class. Still each caller's
   *  own already-established color per the brief's "don't invent new
   *  colors" rule — see SegmentedBar's two call sites for which existing
   *  token/accent each status or track maps to. */
  color: string;
};

/**
 * A part-to-whole proportion bar — used for both "Applications by
 * Status" (a genuine status breakdown: pending/approved/rejected, so it
 * wears this brand's existing status colors, not invented categorical
 * hues) and "Members by Track" (investor vs business owner: since this
 * brand has only one real hue family, that split is drawn as *emphasis*
 * — one accent + one neutral — rather than pretending two invented hues
 * are a validated categorical pair).
 *
 * Per feedback with a reference screenshot (a budget-meter card with a
 * flowing gradient track and a glowing position marker): the track is
 * now one continuous gradient — each segment's true boundary is still a
 * hard color change (proportions stay exact), just blended over a couple
 * of percentage points either side so the whole bar reads as one flowing
 * spectrum instead of flat blocks — and the hovered/focused segment gets
 * a soft glow instead of the old "dim the others" treatment, echoing
 * that marker's halo. The reference's own rounded-md card/button corners
 * are deliberately NOT carried over — this brand's bars and cards stay
 * square-cornered; only the legend's status dot is round, as a marker,
 * not a corner radius.
 *
 * The whole bar still gets a hairline outer border, since in light mode
 * none of this brand's accent fills clear the 3:1 mark-contrast floor
 * against a near-white surface — the border keeps the bar's shape
 * legible regardless, and the legend's always-visible counts (not
 * hover-only) are the mandatory secondary encoding that check requires.
 */
export default function SegmentedBar({ segments, ariaLabel }: { segments: BarSegment[]; ariaLabel: string }) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);

  const gradient = buildGradient(visible, total);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {/* Ambient echo of the reference's marker glow — a soft blurred
            copy of the bar's own gradient sitting behind it. */}
        <div aria-hidden className="absolute inset-0 opacity-40 blur-md" style={{ backgroundImage: gradient }} />

        <div
          role="img"
          aria-label={ariaLabel}
          className="relative flex h-4 w-full border border-grid-line"
          style={{ backgroundImage: gradient }}
        >
          {visible.map((segment) => {
            const percent = total > 0 ? (segment.value / total) * 100 : 0;
            return (
              <div
                key={segment.key}
                className="relative flex items-center justify-center"
                style={{ flex: `${percent} 0 0%` }}
                onPointerEnter={() => setHoverKey(segment.key)}
                onPointerLeave={() => setHoverKey(null)}
                tabIndex={0}
                onFocus={() => setHoverKey(segment.key)}
                onBlur={() => setHoverKey(null)}
              >
                {hoverKey === segment.key && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ boxShadow: `inset 0 0 0 1px ${segment.color}, 0 0 10px 1px ${segment.color}` }}
                    />
                    <div className="pointer-events-none absolute bottom-full z-10 mb-2 flex flex-col items-center gap-0.5 whitespace-nowrap border border-gold/20 bg-panel px-2.5 py-1.5 shadow-lg">
                      <span className="font-jakarta text-sm font-semibold text-cream">{segment.value}</span>
                      <span className="font-sans text-xs text-cream-dim">
                        {segment.label} · {Math.round(percent)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend — always visible, never hover-only, so every value here
          is reachable without the tooltip above. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <span key={segment.key} className="flex items-center gap-2 font-sans text-sm text-cream-dim">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color, boxShadow: `0 0 6px 1px ${segment.color}` }}
            />
            {segment.label} <span className="font-jakarta font-semibold text-cream">{segment.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Builds one linear-gradient across the whole bar: each segment holds
 *  its true color for the bulk of its width, blending into the next
 *  segment's color over ~2 percentage points at the shared boundary so
 *  proportions stay exact but the transition reads as one flowing
 *  spectrum rather than a hard cut. */
function buildGradient(visible: BarSegment[], total: number): string {
  if (visible.length === 0) return "var(--color-grid-line)";
  if (visible.length === 1) return visible[0].color;

  const stops: string[] = [];
  let cursor = 0;
  visible.forEach((segment, i) => {
    const percent = total > 0 ? (segment.value / total) * 100 : 0;
    const start = cursor;
    const end = cursor + percent;
    const next = visible[i + 1];
    const blend = next ? Math.min(2, percent / 2, ((next.value / total) * 100) / 2) : 0;

    stops.push(`${segment.color} ${start.toFixed(2)}%`);
    stops.push(`${segment.color} ${(end - blend).toFixed(2)}%`);
    if (next) stops.push(`${next.color} ${(end + blend).toFixed(2)}%`);

    cursor = end;
  });

  return `linear-gradient(90deg, ${stops.join(", ")})`;
}
