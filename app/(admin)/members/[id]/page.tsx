import type { Metadata } from "next";
import MemberDetailView from "@/components/admin/members/MemberDetailView";

export const metadata: Metadata = {
  title: "Member | AUREX Admin",
};

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemberDetailView id={id} />;
}
