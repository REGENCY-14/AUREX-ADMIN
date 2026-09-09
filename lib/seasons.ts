import { apiFetch } from "@/lib/api/client";
import { cached, invalidate } from "@/lib/cache";

export type SeasonStatus = "draft" | "active" | "ended";

export type Season = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
};

type SeasonApiRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: SeasonStatus;
};

function toSeason(row: SeasonApiRow): Season {
  return { id: row.id, name: row.name, startDate: row.start_date, endDate: row.end_date, status: row.status };
}

export async function fetchSeasons(): Promise<Season[]> {
  try {
    const { data } = await cached("seasons:", () => apiFetch<SeasonApiRow[]>("/seasons"));
    return data.map(toSeason);
  } catch {
    return [];
  }
}

export async function createSeason(input: { name: string; startDate: string; endDate: string }): Promise<Season> {
  const { data } = await apiFetch<SeasonApiRow>("/seasons", {
    method: "POST",
    body: { name: input.name, start_date: input.startDate, end_date: input.endDate },
  });
  invalidate("seasons");
  return toSeason(data);
}

export async function activateSeason(id: string): Promise<Season> {
  const { data } = await apiFetch<SeasonApiRow>(`/seasons/${id}/activate`, { method: "PATCH" });
  invalidate("seasons");
  return toSeason(data);
}

export async function endSeason(id: string): Promise<Season> {
  const { data } = await apiFetch<SeasonApiRow>(`/seasons/${id}/end`, { method: "PATCH" });
  invalidate("seasons");
  return toSeason(data);
}
