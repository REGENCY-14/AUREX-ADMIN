import type { Metadata } from "next";
import InvestmentsView from "@/components/admin/investments/InvestmentsView";

export const metadata: Metadata = {
  title: "Record Investment | AUREX Admin",
};

export default function InvestmentsPage() {
  return <InvestmentsView />;
}
