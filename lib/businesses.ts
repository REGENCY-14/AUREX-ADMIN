import { apiFetch } from "@/lib/api/client";
import { cached } from "@/lib/cache";

export type ApprovedBusiness = { id: string; name: string };

export async function fetchApprovedBusinesses(): Promise<ApprovedBusiness[]> {
  try {
    const { data } = await cached("businesses:approved", () => apiFetch<ApprovedBusiness[]>("/businesses"));
    return data;
  } catch {
    return [];
  }
}
