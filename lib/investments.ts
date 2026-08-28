/**
 * Individual investment records — the output of the Investment Recording
 * Tool. Each record is one deposit against one member + one slot; a
 * top-up is its own new record rather than an edit to a prior one
 * (per the brief, to preserve history), so a member can have several
 * records against the same or different slots.
 *
 * `earningsToDateGhs` is a manually-recorded, point-in-time figure Admin
 * updates over time via a separate action (not calculated from the rate/
 * term) — same "Admin types it in after the fact" convention the main
 * site's own investor-holdings mock data uses.
 */

export type InvestmentRecord = {
  id: string;
  memberId: string;
  slotId: string;
  amountInvestedGhs: number;
  dateInvested: string;
  proofOfPaymentFileName?: string;
  notes?: string;
  earningsToDateGhs: number;
  lastEarningsUpdate: string;
};

export const INVESTMENT_RECORDS: InvestmentRecord[] = [
  {
    id: "inv-01",
    memberId: "mem-01",
    slotId: "slot-01",
    amountInvestedGhs: 5000,
    dateInvested: "2026-01-10",
    proofOfPaymentFileName: "ironvault-deposit-1.pdf",
    earningsToDateGhs: 320,
    lastEarningsUpdate: "2026-08-01",
  },
  {
    id: "inv-02",
    memberId: "mem-01",
    slotId: "slot-02",
    amountInvestedGhs: 10000,
    dateInvested: "2026-02-01",
    proofOfPaymentFileName: "ironvault-deposit-2.pdf",
    notes: "Top-up into GreenHarvest Ventures slot.",
    earningsToDateGhs: 980,
    lastEarningsUpdate: "2026-08-10",
  },
  {
    id: "inv-03",
    memberId: "mem-02",
    slotId: "slot-02",
    amountInvestedGhs: 8000,
    dateInvested: "2026-02-15",
    proofOfPaymentFileName: "northstarx-deposit-1.pdf",
    earningsToDateGhs: 700,
    lastEarningsUpdate: "2026-08-05",
  },
  {
    id: "inv-04",
    memberId: "mem-04",
    slotId: "slot-01",
    amountInvestedGhs: 5000,
    dateInvested: "2026-01-20",
    earningsToDateGhs: 210,
    lastEarningsUpdate: "2026-08-01",
  },
  {
    id: "inv-05",
    memberId: "mem-04",
    slotId: "slot-02",
    amountInvestedGhs: 3000,
    dateInvested: "2026-03-01",
    notes: "Top-up into GreenHarvest Ventures slot.",
    earningsToDateGhs: 245,
    lastEarningsUpdate: "2026-08-15",
  },
  {
    id: "inv-06",
    memberId: "mem-05",
    slotId: "slot-03",
    amountInvestedGhs: 6000,
    dateInvested: "2025-11-25",
    proofOfPaymentFileName: "quietcapital-deposit-1.pdf",
    notes: "Matured — slot closed 20 Dec 2025.",
    earningsToDateGhs: 540,
    lastEarningsUpdate: "2026-06-30",
  },
  {
    id: "inv-07",
    memberId: "mem-08",
    slotId: "slot-01",
    amountInvestedGhs: 2500,
    dateInvested: "2026-03-05",
    earningsToDateGhs: 90,
    lastEarningsUpdate: "2026-08-01",
  },
];

export function getInvestmentRecords(): InvestmentRecord[] {
  return INVESTMENT_RECORDS;
}

export function getInvestmentRecordsByMember(memberId: string): InvestmentRecord[] {
  return INVESTMENT_RECORDS.filter((r) => r.memberId === memberId);
}

export function getTotalInvestedByMember(memberId: string): number {
  return getInvestmentRecordsByMember(memberId).reduce((sum, r) => sum + r.amountInvestedGhs, 0);
}

/** Platform-wide total across every record — the Admin Overview's own
 *  "total amount invested" stat. */
export function getTotalPlatformInvested(): number {
  return INVESTMENT_RECORDS.reduce((sum, r) => sum + r.amountInvestedGhs, 0);
}

export type MonthlyInvestedPoint = { label: string; cumulativeGhs: number };

/** Total amount invested, running cumulative by month — the Overview
 *  trend chart's data. Cumulative (not "invested that month" alone)
 *  since the reader's real question is "how big has the book gotten",
 *  the same number the "Total Invested" stat tile already answers for
 *  right now; this just shows how it got there. */
export function getMonthlyInvestedTrend(): MonthlyInvestedPoint[] {
  const byMonth = new Map<string, number>();
  for (const record of INVESTMENT_RECORDS) {
    const [year, month] = record.dateInvested.split("-");
    const key = `${year}-${month}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + record.amountInvestedGhs);
  }

  const sortedKeys = [...byMonth.keys()].sort();
  let running = 0;
  return sortedKeys.map((key) => {
    running += byMonth.get(key) ?? 0;
    const [year, month] = key.split("-").map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    return { label, cumulativeGhs: running };
  });
}
