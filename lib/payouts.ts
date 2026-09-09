import { apiFetch, apiFetchPaginated } from "@/lib/api/client";
import { cached, invalidate } from "@/lib/cache";

export type PayoutStatus = "scheduled" | "paid" | "missed" | "late";

export type Payout = {
  id: string;
  investmentId: string;
  nickname: string;
  packageName: string;
  businessName?: string;
  amountGhs: number;
  paidAmountGhs?: number;
  scheduledDate: string;
  paidDate?: string;
  status: PayoutStatus;
  seasonId?: string;
};

type PayoutApiRow = {
  id: string;
  investment_id: string;
  nickname: string | null;
  package_name: string;
  business_name: string | null;
  amount: string;
  paid_amount: string | null;
  scheduled_date: string;
  paid_date: string | null;
  status: PayoutStatus;
  season_id: string | null;
};

function toPayout(row: PayoutApiRow): Payout {
  return {
    id: row.id,
    investmentId: row.investment_id,
    nickname: row.nickname ?? "—",
    packageName: row.package_name,
    businessName: row.business_name ?? undefined,
    amountGhs: Number(row.amount),
    paidAmountGhs: row.paid_amount ? Number(row.paid_amount) : undefined,
    scheduledDate: row.scheduled_date,
    paidDate: row.paid_date ?? undefined,
    status: row.status,
    seasonId: row.season_id ?? undefined,
  };
}

export async function fetchPayouts(filters: { status?: PayoutStatus } = {}): Promise<Payout[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (filters.status) params.set("status", filters.status);
  try {
    const { data } = await cached(`payouts:${params.toString()}`, () =>
      apiFetchPaginated<PayoutApiRow>(`/payouts?${params.toString()}`),
    );
    return data.map(toPayout);
  } catch {
    return [];
  }
}

export async function markPayoutPaid(id: string, amountGhs?: number): Promise<Payout> {
  const { data } = await apiFetch<PayoutApiRow>(`/payouts/${id}/paid`, {
    method: "PATCH",
    body: amountGhs !== undefined ? { amount: amountGhs } : {},
  });
  invalidate("payouts");
  return toPayout(data);
}

export async function markPayoutMissed(id: string): Promise<Payout> {
  const { data } = await apiFetch<PayoutApiRow>(`/payouts/${id}/missed`, { method: "PATCH" });
  invalidate("payouts");
  return toPayout(data);
}

export function isPayoutLate(payout: Payout): boolean {
  return payout.status === "scheduled" && payout.scheduledDate < new Date().toISOString().slice(0, 10);
}
