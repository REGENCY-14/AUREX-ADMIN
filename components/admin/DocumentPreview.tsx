"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easing, hoverScale } from "@/lib/motion";
import { formatDisplayDate } from "@/lib/formatters";
import { DocumentIcon, CloseIcon } from "@/components/icons";

/**
 * A row for one uploaded document (ID scan, business registration
 * certificate, proof of payment) with a "View" action that opens a modal
 * preview. There's no real file storage yet, so every document renders
 * the same mock placeholder image (public/mock/document-placeholder.svg)
 * — this component is about proving the review interaction (open, look,
 * close), not a real file viewer.
 */
export default function DocumentPreview({
  label,
  fileName,
  uploadedAt,
}: {
  label: string;
  fileName: string;
  uploadedAt?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border border-grid-line bg-panel/20 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <DocumentIcon className="size-5 shrink-0 text-gold-muted" />
          <div className="flex min-w-0 flex-col">
            <span className="font-sans text-xs uppercase tracking-wide text-cream-dim">{label}</span>
            <span className="truncate font-jakarta text-sm text-cream">{fileName}</span>
          </div>
        </div>
        <motion.button
          {...hoverScale}
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 border border-gold/30 px-3 py-1.5 font-jakarta text-xs font-medium text-gold-bright transition-colors hover:border-gold hover:bg-gold/5"
        >
          View
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-amainblack/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.35, ease: easing.smooth }}
              className="relative flex w-full max-w-lg flex-col gap-4 border border-gold/20 bg-panel/95 p-6 backdrop-blur-2xl"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center text-cream-dim transition-colors hover:text-gold-bright"
              >
                <CloseIcon className="size-4" />
              </button>
              <div className="flex flex-col gap-1 pr-8">
                <h2 className="font-jakarta text-lg font-semibold text-cream">{label}</h2>
                <p className="font-sans text-xs text-cream-dim">
                  {fileName}
                  {uploadedAt && ` (uploaded ${formatDisplayDate(uploadedAt)})`}
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mock/document-placeholder.svg"
                alt=""
                className="w-full border border-grid-line"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
