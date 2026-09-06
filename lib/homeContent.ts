import { apiFetch } from "@/lib/api/client";

export type ContentBlockState = "draft" | "published";

export type ContentBlock = {
  id: string;
  title: string;
  body: string;
  state: ContentBlockState;
  order: number;
  updatedAt: string;
};

type ContentBlockApiRow = {
  id: string;
  title: string;
  body: string;
  state: ContentBlockState;
  order: number;
  updated_at: string;
};

function toContentBlock(row: ContentBlockApiRow): ContentBlock {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    state: row.state,
    order: row.order,
    updatedAt: row.updated_at.slice(0, 10),
  };
}

export async function fetchContentBlocks(): Promise<ContentBlock[]> {
  try {
    const { data } = await apiFetch<ContentBlockApiRow[]>("/content-blocks");
    return data.map(toContentBlock);
  } catch {
    return [];
  }
}

export async function createContentBlock(input: { title: string; body: string }): Promise<ContentBlock> {
  const { data } = await apiFetch<ContentBlockApiRow>("/content-blocks", { method: "POST", body: input });
  return toContentBlock(data);
}

export async function updateContentBlock(
  id: string,
  input: { title?: string; body?: string; state?: ContentBlockState },
): Promise<ContentBlock> {
  const { data } = await apiFetch<ContentBlockApiRow>(`/content-blocks/${id}`, { method: "PATCH", body: input });
  return toContentBlock(data);
}

export async function moveContentBlock(id: string, direction: "up" | "down"): Promise<ContentBlock[]> {
  const { data } = await apiFetch<ContentBlockApiRow[]>(`/content-blocks/${id}/move`, {
    method: "PATCH",
    body: { direction },
  });
  return data.map(toContentBlock);
}

export async function deleteContentBlock(id: string): Promise<void> {
  await apiFetch(`/content-blocks/${id}`, { method: "DELETE" });
}
