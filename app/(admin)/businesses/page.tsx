import type { Metadata } from "next";
import BusinessesView from "@/components/admin/businesses/BusinessesView";

export const metadata: Metadata = {
  title: "Businesses | AUREX Admin",
};

export default function BusinessesPage() {
  return <BusinessesView />;
}
