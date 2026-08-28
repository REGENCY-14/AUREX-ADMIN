"use client";

import { useState } from "react";
import type { ContentBlock, ContentBlockState } from "@/lib/homeContent";

const INPUT_CLASSNAME =
  "w-full border border-grid-line bg-panel/60 px-3 py-2 font-sans text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold/50 focus:outline-none";
const LABEL_CLASSNAME = "flex flex-col gap-1.5";
const LABEL_TEXT_CLASSNAME = "font-sans text-xs uppercase tracking-wide text-cream-dim";

export type ContentFormValues = { title: string; body: string; state: ContentBlockState };

export default function ContentForm({
  block,
  onCancel,
  onSave,
}: {
  block?: ContentBlock;
  onCancel: () => void;
  onSave: (values: ContentFormValues) => void;
}) {
  const [values, setValues] = useState<ContentFormValues>({
    title: block?.title ?? "",
    body: block?.body ?? "",
    state: block?.state ?? "draft",
  });

  function set<K extends keyof ContentFormValues>(key: K, value: ContentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.title.trim()) return;
        onSave(values);
      }}
    >
      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Title</span>
        <input type="text" value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. New Ventures slot open" className={INPUT_CLASSNAME} />
      </label>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>Body</span>
        <textarea value={values.body} onChange={(e) => set("body", e.target.value)} rows={4} className={INPUT_CLASSNAME} />
      </label>

      <label className={LABEL_CLASSNAME}>
        <span className={LABEL_TEXT_CLASSNAME}>State</span>
        <select value={values.state} onChange={(e) => set("state", e.target.value as ContentBlockState)} className={INPUT_CLASSNAME}>
          <option value="draft">Draft (not shown on the public site)</option>
          <option value="published">Published</option>
        </select>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-grid-line pt-4">
        <button type="button" onClick={onCancel} className="font-sans text-sm text-cream-dim transition-colors hover:text-cream">
          Cancel
        </button>
        <button type="submit" className="bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2 font-jakarta text-sm font-medium text-amainblack">
          {block ? "Save Changes" : "Add Block"}
        </button>
      </div>
    </form>
  );
}
