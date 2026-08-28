"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { staggerItem, hoverLift } from "@/lib/motion";

/**
 * One at-a-glance stat tile on the Admin Overview page — always a link
 * into the section it summarizes, per the brief ("each stat links into
 * its relevant section below"). `hoverLift` (not `hoverScale`) matches
 * the main site's own card-hover treatment for a clickable tile, rather
 * than a scale-up meant for buttons.
 *
 * The gradient-and-glow bar under the value takes its design cue from a
 * reference budget-meter card (a gradient track with a glowing position
 * marker) per feedback — this is the tile the reference was actually
 * meant for, not the Overview status bars it got applied to first. It's
 * a purely decorative accent, not a fake progress readout: none of these
 * four counts is naturally a share of some total, so there's no honest
 * percentage to plot — just this brand's own gold gradient with a
 * glowing dot at the end, echoing that marker without inventing data.
 * Square corners throughout, per the same feedback's "ignore the
 * rounded-md" — this brand's tiles don't adopt the reference's rounding.
 */
export default function StatCard({
  label,
  value,
  href,
  sublabel,
}: {
  label: string;
  value: string;
  href: string;
  sublabel?: string;
}) {
  return (
    <motion.div variants={staggerItem}>
      <Link href={href} className="block h-full">
        <motion.div
          {...hoverLift}
          className="flex h-full flex-col gap-2 border border-gold/20 bg-panel/40 p-5 backdrop-blur-2xl transition-colors hover:border-gold/40 sm:p-6"
        >
          <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">{label}</span>
          <span className="font-jakarta text-2xl font-bold text-gold-bright sm:text-3xl">{value}</span>
          {sublabel && <span className="font-sans text-xs text-cream-dim">{sublabel}</span>}
          <div className="relative mt-1 h-1 w-full">
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "linear-gradient(90deg, var(--color-gold-deep), var(--color-gold-bright))" }}
            />
            <div
              className="absolute right-0 top-1/2 size-2 -translate-y-1/2"
              style={{ backgroundColor: "var(--color-gold-bright)", boxShadow: "0 0 8px 2px var(--color-gold-bright)" }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
