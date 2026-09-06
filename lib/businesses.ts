import { apiFetch } from "@/lib/api/client";

export type ApprovedBusiness = { id: string; name: string };

export async function fetchApprovedBusinesses(): Promise<ApprovedBusiness[]> {
  try {
    const { data } = await apiFetch<ApprovedBusiness[]>("/businesses");
    return data;
  } catch {
    return [];
  }
}
