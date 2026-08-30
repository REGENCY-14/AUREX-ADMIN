import { apiFetch, apiFetchPaginated } from "@/lib/api/client";

// "admin" isn't in Aurex-backend's documented /applications type enum yet
// (investor/business only, per its Swagger docs) — this is here ahead of
// that backend support, so this queue is ready to list/approve pending
// admin sign-ups (see RegisterView's "request received" copy) the moment
// it lands. Until then, filtering by "admin" here just won't find
// anything.
export type ApplicationTrack = "investor" | "business" | "admin";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type DocumentRef = { fileName: string; uploadedAt: string; url: string };

export type Application = {
  id: string;
  nickname: string;
  realName: string;
  email: string;
  phone: string;
  country: string;
  track: ApplicationTrack;
  submittedAt: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  idDocument?: DocumentRef;
  // Business Owner track only:
  businessName?: string;
  businessDescription?: string;
  fundingRange?: string;
  businessRegDocument?: DocumentRef;
};

const FUNDING_RANGE_LABELS: Record<string, string> = {
  "under-10000": "Under GHS 10,000",
  "10000-50000": "GHS 10,000 – 50,000",
  "50000-200000": "GHS 50,000 – 200,000",
  "200000-plus": "GHS 200,000+",
};

export function formatFundingRange(value?: string): string {
  if (!value) return "—";
  return FUNDING_RANGE_LABELS[value] ?? value;
}

// Matches Aurex-backend's `applications` table shape exactly (raw row,
// snake_case, JSON-serialized dates as strings) — the applications
// endpoints return the row as-is, same convention as /payments.
type ApplicationApiRow = {
  id: string;
  type: ApplicationTrack;
  date_submitted: string;
  status: ApplicationStatus;
  full_name: string;
  email: string;
  phone_country: string;
  phone_number: string;
  nickname: string;
  id_document_url: string | null;
  country_of_residence: string | null;
  business_name: string | null;
  country_of_operation: string | null;
  business_description: string | null;
  funding_amount: string | null;
  business_registration_document_url: string | null;
  created_at: string;
};

type ApplicationLogApiRow = {
  id: string;
  change: unknown;
  updated_by: string;
  updated_on: string;
};

function fileNameFromUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || url);
  } catch {
    return url;
  }
}

function toDocumentRef(url: string | null, uploadedAt: string): DocumentRef | undefined {
  const fileName = fileNameFromUrl(url);
  return fileName && url ? { fileName, uploadedAt, url } : undefined;
}

function findRejectionReason(logs: ApplicationLogApiRow[]): string | undefined {
  for (const log of logs) {
    const change = log.change;
    if (change && typeof change === "object" && (change as Record<string, unknown>).event === "rejected") {
      const reason = (change as Record<string, unknown>).reason;
      if (typeof reason === "string") return reason;
    }
  }
  return undefined;
}

function toApplication(row: ApplicationApiRow, logs: ApplicationLogApiRow[] = []): Application {
  return {
    id: row.id,
    // An admin application has no nickname of its own — falls back to
    // the applicant's name.
    nickname: row.nickname || row.full_name,
    realName: row.full_name,
    email: row.email,
    // Admin applications don't collect a phone number — only build this
    // when both halves are actually present.
    phone: row.phone_country && row.phone_number ? `${row.phone_country} ${row.phone_number}` : "",
    country: row.country_of_residence ?? row.country_of_operation ?? "",
    track: row.type,
    submittedAt: row.date_submitted,
    status: row.status,
    rejectionReason: findRejectionReason(logs),
    idDocument: toDocumentRef(row.id_document_url, row.created_at),
    businessName: row.business_name ?? undefined,
    businessDescription: row.business_description ?? undefined,
    fundingRange: row.funding_amount ?? undefined,
    businessRegDocument: toDocumentRef(row.business_registration_document_url, row.created_at),
  };
}

export async function getApplications(filters: { status?: ApplicationStatus } = {}): Promise<Application[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (filters.status) params.set("status", filters.status);
  try {
    const { data } = await apiFetchPaginated<ApplicationApiRow>(`/applications?${params.toString()}`);
    return data.map((row) => toApplication(row));
  } catch {
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  try {
    const { data } = await apiFetch<{ application: ApplicationApiRow; logs: ApplicationLogApiRow[] }>(
      `/applications/${id}`,
    );
    return toApplication(data.application, data.logs);
  } catch {
    return undefined;
  }
}

export async function getPendingApplicationCount(): Promise<number> {
  try {
    const { pagination } = await apiFetchPaginated<ApplicationApiRow>("/applications?status=pending&limit=1");
    return pagination.total;
  } catch {
    return 0;
  }
}

export async function approveApplication(id: string): Promise<Application> {
  const { data } = await apiFetch<ApplicationApiRow>(`/applications/${id}/approve`, {
    method: "PATCH",
  });
  return toApplication(data);
}

export async function rejectApplication(id: string, reason?: string): Promise<Application> {
  const { data } = await apiFetch<ApplicationApiRow>(`/applications/${id}/reject`, {
    method: "PATCH",
    body: reason ? { reason } : {},
  });
  return toApplication(data);
}
