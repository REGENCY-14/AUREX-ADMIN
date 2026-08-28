"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverScale } from "@/lib/motion";

/**
 * Step 0 placeholder only — proves the imported design system (fonts,
 * color tokens, motion variants) renders correctly before any real admin
 * page gets built. Not one of the 7 admin pages from the brief; replace
 * with the actual Admin Overview/Dashboard once Step 0 is confirmed.
 */
export default function DesignSystemCheckPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-10">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex w-full max-w-2xl flex-col items-center gap-6 text-center"
      >
        <motion.p variants={staggerItem} className="font-jakarta text-xs font-medium uppercase tracking-[1.8px] text-gold-muted">
          Step 0 — Design System Check
        </motion.p>
        <motion.h1 variants={staggerItem} className="font-jakarta text-3xl font-semibold text-cream sm:text-4xl">
          AUREX Admin
        </motion.h1>
        <motion.p variants={staggerItem} className="max-w-md font-sans text-sm text-cream-dim sm:text-base">
          Fonts, color tokens, and motion variants imported from the main AUREX site. If this reads in gold/cream on a
          dark ink background with the right type, Step 0 is wired up correctly.
        </motion.p>

        <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {["gold", "gold-bright", "cream", "panel"].map((token) => (
            <span
              key={token}
              className="border border-gold/20 bg-panel/40 px-3 py-1.5 font-mono text-xs text-cream-dim"
            >
              {token}
            </span>
          ))}
        </motion.div>

        <motion.button
          {...hoverScale}
          type="button"
          className="mt-4 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-6 py-3 font-jakarta text-sm text-amainblack"
        >
          hoverScale check
        </motion.button>
      </motion.div>
    </main>
  );
}
