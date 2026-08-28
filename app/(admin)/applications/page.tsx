import type { Metadata } from "next";
import ApplicationsView from "@/components/admin/applications/ApplicationsView";
import { getApplications, type ApplicationStatus } from "@/lib/applications";

export const metadata: Metadata = {
  title: "Applications | AUREX Admin",
};

const VALID_STATUSES: ApplicationStatus[] = ["pending", "approved", "rejected"];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const initialStatus = (VALID_STATUSES as string[]).includes(status ?? "") ? (status as ApplicationStatus) : "all";

  return <ApplicationsView applications={getApplications()} initialStatus={initialStatus} />;
}
