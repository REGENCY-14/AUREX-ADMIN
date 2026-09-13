import type { Metadata } from "next";
import BusinessDetailView from "@/components/admin/businesses/BusinessDetailView";

export const metadata: Metadata = {
  title: "Business | AUREX Admin",
};

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessDetailView id={id} />;
}
