import type { Metadata } from "next";
import InvestmentsView from "@/components/admin/investments/InvestmentsView";
import { getInvestmentRecords } from "@/lib/investments";
import { getActiveInvestors, getMembers, type Member } from "@/lib/members";
import { getInvestmentSlots, type InvestmentSlot } from "@/lib/investmentSlots";

export const metadata: Metadata = {
  title: "Record Investment | AUREX Admin",
};

export default function InvestmentsPage() {
  const slots = getInvestmentSlots();
  const members = getMembers();

  const membersById = members.reduce<Record<string, Member>>((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {});
  const slotsById = slots.reduce<Record<string, InvestmentSlot>>((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  return (
    <InvestmentsView
      records={getInvestmentRecords()}
      investors={getActiveInvestors()}
      openSlots={slots.filter((s) => s.status === "open")}
      membersById={membersById}
      slotsById={slotsById}
    />
  );
}
