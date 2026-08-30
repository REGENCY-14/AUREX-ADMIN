/**
 * Editable announcement/update blocks shown on the public AUREX home
 * page — e.g. "New Ventures slot open", "Platform maintenance notice".
 * No CMS/backend exists yet; mock data shaped like what a real content
 * table would hold. `order` controls display order on the public site;
 * only `published` blocks are meant to actually show there — `draft`
 * blocks are visible here in Admin only, for review before publishing.
 */

export type ContentBlockState = "draft" | "published";

export type ContentBlock = {
  id: string;
  title: string;
  body: string;
  state: ContentBlockState;
  order: number;
  updatedAt: string;
};

export const CONTENT_BLOCKS: ContentBlock[] = [
  {
    id: "content-01",
    title: "New Ventures slot: GreenHarvest Foods",
    body: "AUREX Ventures has opened a new 12-month slot backing GreenHarvest Foods' cold-storage expansion, at 14% p.a.",
    state: "published",
    order: 1,
    updatedAt: "2026-02-10",
  },
  {
    id: "content-02",
    title: "AUREX Core rate holds steady at 8% p.a.",
    body: "Our flagship Core package continues to offer a steady 8% p.a. return on a 6-month term.",
    state: "published",
    order: 2,
    updatedAt: "2026-02-01",
  },
  {
    id: "content-03",
    title: "Scheduled maintenance: 30 Aug, 11pm–1am GMT",
    body: "The AUREX platform will be briefly unavailable for scheduled maintenance. Investments and applications are unaffected.",
    state: "draft",
    order: 3,
    updatedAt: "2026-08-26",
  },
];

export function getContentBlocks(): ContentBlock[] {
  return [...CONTENT_BLOCKS].sort((a, b) => a.order - b.order);
}
