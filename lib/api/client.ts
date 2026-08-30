const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1234/api/v1";

export class ApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ApiEnvelope<T> = { success: true; message?: string; data: T };
export type PaginatedEnvelope<T> = {
  success: true;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

function getAdminToken(): string | null {
  return null;
}

async function parse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(
      json?.error?.message ?? "Something went wrong. Please try again.",
      res.status,
      json?.error?.code,
    );
  }
  return json as T;
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  return parse<ApiEnvelope<T>>(res);
}

export async function apiFetchPaginated<T = unknown>(path: string): Promise<PaginatedEnvelope<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { ...authHeaders() },
  });
  return parse<PaginatedEnvelope<T>>(res);
}
