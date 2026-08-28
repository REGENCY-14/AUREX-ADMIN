"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift, hoverScale } from "@/lib/motion";
import { formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ContentForm, { type ContentFormValues } from "@/components/admin/content/ContentForm";
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, TrashIcon } from "@/components/icons";
import type { ContentBlock } from "@/lib/homeContent";

/**
 * Home Page Content Management: announcement blocks, reorderable via
 * simple up/down controls (drag-and-drop would need a new dependency
 * this admin app doesn't have — plain buttons cover "reorder" without
 * one, and stay fully keyboard-usable, which drag handles alone
 * wouldn't). Add/Edit share the same modal form as Slots/Listings;
 * Remove now asks first too, via ConfirmDialog — per feedback that
 * every important action should confirm, not only outright deletion,
 * so this one, which is exactly outright deletion, definitely does.
 */
export default function ContentView({ blocks: initialBlocks }: { blocks: ContentBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | "new" | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [confirmRemoveBlock, setConfirmRemoveBlock] = useState<ContentBlock | null>(null);

  function move(id: string, direction: -1 | 1) {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((b) => b.id === id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return prev;
      const reordered = [...sorted];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered.map((block, i) => ({ ...block, order: i + 1 }));
    });
  }

  function remove(block: ContentBlock) {
    setBlocks((prev) => prev.filter((b) => b.id !== block.id).map((b, i) => ({ ...b, order: i + 1 })));
    setBanner(`"${block.title}" removed.`);
  }

  function handleSave(values: ContentFormValues) {
    if (editingBlock === "new") {
      const id = `content-${Math.random().toString(36).slice(2, 8)}`;
      setBlocks((prev) => [
        ...prev,
        { id, title: values.title, body: values.body, state: values.state, order: prev.length + 1, updatedAt: new Date().toISOString().slice(0, 10) },
      ]);
      setBanner("Block added.");
    } else if (editingBlock) {
      const id = editingBlock.id;
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, title: values.title, body: values.body, state: values.state, updatedAt: new Date().toISOString().slice(0, 10) } : b
        )
      );
      setBanner("Block updated.");
    }
    setEditingBlock(null);
  }

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader
        title="Home Page Content"
        description="Announcement blocks shown on the public AUREX home page, in this order."
        action={
          <motion.button
            {...hoverScale}
            type="button"
            onClick={() => setEditingBlock("new")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2.5 font-jakarta text-sm font-medium text-amainblack"
          >
            <PlusIcon className="size-3.5" /> Add Block
          </motion.button>
        }
      />

      {banner && (
        <motion.div variants={staggerItem} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {banner}
        </motion.div>
      )}

      {sorted.length === 0 ? (
        <motion.p variants={staggerItem} className="border border-grid-line bg-panel/20 p-8 text-center font-sans text-sm text-cream-dim">
          No content blocks yet.
        </motion.p>
      ) : (
        <motion.div variants={staggerItem} className="flex flex-col gap-3">
          {sorted.map((block, index) => (
            <motion.div key={block.id} {...hoverLift} className="flex flex-col gap-3 border border-grid-line bg-panel/20 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-jakarta text-sm font-semibold text-cream">{block.title}</span>
                  <StatusBadge label={block.state === "published" ? "Published" : "Draft"} tone={block.state === "published" ? "gold" : "neutral"} />
                </div>
                <p className="max-w-2xl font-sans text-sm text-cream-dim">{block.body}</p>
                <span className="font-sans text-xs text-cream-dim">Updated {formatDisplayDate(block.updatedAt)}</span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(block.id, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex size-8 items-center justify-center border border-grid-line text-cream-dim transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUpIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(block.id, 1)}
                  disabled={index === sorted.length - 1}
                  aria-label="Move down"
                  className="flex size-8 items-center justify-center border border-grid-line text-cream-dim transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowDownIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock(block)}
                  className="border border-grid-line px-2.5 py-1.5 font-jakarta text-xs font-medium text-cream-dim transition-colors hover:text-cream"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveBlock(block)}
                  aria-label="Remove"
                  className="flex size-8 items-center justify-center border border-[#f87171]/30 text-[#f87171] transition-colors hover:border-[#f87171] hover:bg-[#f87171]/10"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        isOpen={editingBlock !== null}
        onClose={() => setEditingBlock(null)}
        title={editingBlock === "new" ? "Add Content Block" : "Edit Content Block"}
      >
        <ContentForm
          key={editingBlock === "new" ? "new" : editingBlock?.id}
          block={editingBlock && editingBlock !== "new" ? editingBlock : undefined}
          onCancel={() => setEditingBlock(null)}
          onSave={handleSave}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmRemoveBlock !== null}
        onClose={() => setConfirmRemoveBlock(null)}
        onConfirm={() => {
          if (confirmRemoveBlock) remove(confirmRemoveBlock);
        }}
        title="Remove this content block?"
        description={confirmRemoveBlock ? `“${confirmRemoveBlock.title}” will no longer show on the public site.` : undefined}
        confirmLabel="Remove"
        tone="danger"
      />
    </motion.div>
  );
}
