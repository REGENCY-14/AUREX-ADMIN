import type { Metadata } from "next";
import MembersView from "@/components/admin/members/MembersView";

export const metadata: Metadata = {
  title: "Members | AUREX Admin",
};

export default function MembersPage() {
  return <MembersView />;
}
