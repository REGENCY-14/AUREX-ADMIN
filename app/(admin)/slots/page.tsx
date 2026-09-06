import type { Metadata } from "next";
import SlotsView from "@/components/admin/slots/SlotsView";
import type { SlotStatus } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Investment Slots | AUREX Admin",
};

const VALID_STATUSES: SlotStatus[] = ["pending", "approved", "rejected", "active", "closed"];

export default async function SlotsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as SlotStatus) : "all";

  return <SlotsView initialStatus={initialStatus} />;
}
