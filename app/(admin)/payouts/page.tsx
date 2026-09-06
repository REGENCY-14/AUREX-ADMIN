import type { Metadata } from "next";
import PayoutsView from "@/components/admin/payouts/PayoutsView";

export const metadata: Metadata = {
  title: "Payouts | AUREX Admin",
};

export default function PayoutsPage() {
  return <PayoutsView />;
}
