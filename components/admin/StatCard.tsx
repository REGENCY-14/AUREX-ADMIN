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
        </motion.div>
      </Link>
    </motion.div>
  );
}
