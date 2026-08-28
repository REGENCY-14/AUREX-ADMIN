import type { Metadata } from "next";
import MembersView from "@/components/admin/members/MembersView";
import { getMembers } from "@/lib/members";

export const metadata: Metadata = {
  title: "Members | AUREX Admin",
};

export default function MembersPage() {
  return <MembersView members={getMembers()} />;
}
