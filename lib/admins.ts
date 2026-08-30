/**
 * Admin-role accounts, including ones still awaiting approval from
 * `/auth/register-admin` (see RegisterView's own "an existing admin will
 * need to approve your account" copy). Aurex-backend has no dedicated
 * pending-admin list endpoint yet — `/users` (list all users, admin-only)
 * is the only one that reaches these accounts today, so this fetches
 * everyone and filters to `role: "admin"` client-side, same "fetch
 * broad, filter locally" convention already used for applications/
 * members. There's likewise no approve/reject/suspend endpoint for
 * these accounts yet — see AdminsView's own comment for how that's
 * handled.
 */

import { apiFetchPaginated } from "@/lib/api/client";

export type AdminStatus = "pending" | "active" | "suspended";

export type Admin = {
  id: string;
  nickname: string;
  realName: string;
  email: string;
  phone: string;
  status: AdminStatus;
  isSuperAdmin: boolean;
  createdAt: string;
};

// Matches the shape /auth/register-admin's own response returns for its
// `user` object (confirmed directly against the live backend — this
// isn't in Aurex-backend's Swagger docs, which are stale for anything
// admin-related).
type UserApiRow = {
  id: string;
  nickname: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  role: string | null;
  createdAt: string;
};

function toAdmin(row: UserApiRow): Admin {
  const realName = [row.firstname, row.lastname].filter(Boolean).join(" ");
  return {
    id: row.id,
    nickname: row.nickname || realName || "—",
    realName: realName || "—",
    email: row.email ?? "",
    phone: row.phone ?? "",
    status: row.isActive ? "active" : row.status === "suspended" ? "suspended" : "pending",
    isSuperAdmin: row.isSuperAdmin,
    createdAt: row.createdAt,
  };
}

export async function fetchAdmins(): Promise<Admin[]> {
  try {
    const { data } = await apiFetchPaginated<UserApiRow>("/users?limit=100");
    return data.filter((row) => row.role === "admin").map(toAdmin);
  } catch {
    return [];
  }
}
