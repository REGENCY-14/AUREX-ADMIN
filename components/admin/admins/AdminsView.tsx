"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/motion";
import { formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import { type BadgeTone } from "@/components/admin/StatusBadge";
import StatusDot from "@/components/admin/StatusDot";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import ActionsMenu, { type ActionMenuItem } from "@/components/admin/ActionsMenu";
import { AVATAR_CLASSNAME, DANGER_ROW_CLASSNAME } from "@/components/admin/tableStyles";
import { CheckIcon, XIcon, SearchIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { useSession } from "@/lib/auth";
import { fetchAdmins, type Admin, type AdminStatus } from "@/lib/admins";

const STATUS_TONE: Record<AdminStatus, BadgeTone> = {
  pending: "neutral",
  active: "gold",
  suspended: "danger",
};

const STATUS_LABEL: Record<AdminStatus, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
};

type AdminAction = "approve" | "reject" | "suspend" | "reactivate";

/** Copy for the one shared ConfirmDialog below, keyed by action — same
 *  lookup-over-ternary-chain convention as SlotsView's own CONFIRM_COPY. */
const CONFIRM_COPY: Record<
  AdminAction,
  { title: string; description: (admin: Admin) => string; confirmLabel: string; tone: "gold" | "danger" }
> = {
  approve: {
    title: "Approve this admin?",
    description: (admin) => `${admin.nickname} will be granted full admin access.`,
    confirmLabel: "Approve",
    tone: "gold",
  },
  reject: {
    title: "Reject this admin request?",
    description: (admin) => `${admin.nickname}'s admin request will be rejected.`,
    confirmLabel: "Reject",
    tone: "danger",
  },
  suspend: {
    title: "Suspend this admin?",
    description: (admin) => `${admin.nickname} will lose admin access until reactivated.`,
    confirmLabel: "Suspend",
    tone: "danger",
  },
  reactivate: {
    title: "Reactivate this admin?",
    description: (admin) => `${admin.nickname} will regain full admin access.`,
    confirmLabel: "Reactivate",
    tone: "gold",
  },
};

/**
 * Admin account management — every admin-role user, including ones still
 * awaiting approval from `/auth/register-admin` (a real, working
 * endpoint — see RegisterView) and backed by the real `/users` endpoint
 * (also real, admin-only). What Aurex-backend doesn't have yet is any
 * approve/reject/suspend endpoint for these accounts, so — same
 * situation MemberDetailView's own suspend toggle was already in before
 * `/members` grew a real backend — these actions are honest local-only
 * stubs (`applyAction` below) rather than calls to a guessed endpoint
 * that would just 404. Swap that in once the backend exposes one.
 */
export default function AdminsView() {
  const { session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: AdminAction; admin: Admin } | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    fetchAdmins().then((rows) => {
      if (!cancelled) {
        setAdmins(rows);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) => a.nickname.toLowerCase().includes(q) || a.realName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    );
  }, [admins, query]);

  function actionItems(admin: Admin): ActionMenuItem[] {
    if (admin.status === "pending") {
      return [
        { key: "approve", label: "Approve", tone: "gold", icon: CheckIcon, onClick: () => setConfirmAction({ type: "approve", admin }) },
        { key: "reject", label: "Reject", tone: "danger", icon: XIcon, onClick: () => setConfirmAction({ type: "reject", admin }) },
      ];
    }
    if (admin.status === "active") {
      return [{ key: "suspend", label: "Suspend", tone: "danger", onClick: () => setConfirmAction({ type: "suspend", admin }) }];
    }
    return [{ key: "reactivate", label: "Reactivate", tone: "gold", onClick: () => setConfirmAction({ type: "reactivate", admin }) }];
  }

  function applyAction() {
    if (!confirmAction) return;
    const { type, admin } = confirmAction;
    const next: AdminStatus | null = type === "approve" || type === "reactivate" ? "active" : type === "suspend" ? "suspended" : null;
    if (next) {
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, status: next } : a)));
    } else {
      // Rejecting a pending request drops it from the list entirely,
      // same as it never having shown up here — there's no "rejected
      // admin" state worth keeping visible.
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    }
    const verb = type === "approve" ? "approved" : type === "reject" ? "rejected" : type === "suspend" ? "suspended" : "reactivated";
    setActionMessage(`${admin.nickname} was ${verb}. Stubbed: nothing is persisted (no backend yet).`);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader title="Admin Management" description="Approve pending sign-ups and manage every admin account." />

      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim"
        >
          {actionMessage}
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cream-dim" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by nickname, name, or email…"
          className="w-full border border-grid-line bg-panel/60 py-2 pl-9 pr-3 font-sans text-sm text-cream placeholder:text-cream-dim/60 focus:border-gold/50 focus:outline-none"
        />
      </motion.div>

      {isLoading ? (
        <motion.div
          variants={staggerItem}
          className="flex items-center justify-center gap-2 border border-grid-line bg-panel/20 p-8 font-sans text-sm text-cream-dim"
        >
          <SpinnerIcon className="size-4 animate-spin" /> Loading admins…
        </motion.div>
      ) : filtered.length === 0 ? (
        admins.length === 0 ? (
          <EmptyState
            icon={UserIcon}
            title="No admin accounts yet"
            description="Admin sign-ups will show up here as soon as someone registers."
          />
        ) : (
          <EmptyState
            icon={SearchIcon}
            title={`No admins match “${query}”`}
            description="Try a different nickname, name, or email."
            action={
              <button
                type="button"
                onClick={() => setQuery("")}
                className="border border-grid-line px-3 py-2 font-jakarta text-xs font-medium text-cream-dim transition-colors hover:text-cream"
              >
                Clear search
              </button>
            }
          />
        )
      ) : (
        <>
          <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-grid-line bg-panel/40">
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Nickname</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Full Name</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Email</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Joined</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Status</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin) => (
                  <motion.tr
                    key={admin.id}
                    {...hoverLift}
                    className={`border-b border-grid-line last:border-b-0 ${admin.status === "suspended" ? DANGER_ROW_CLASSNAME : ""}`}
                  >
                    <td className="p-0">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className={AVATAR_CLASSNAME}>{admin.nickname.slice(0, 2).toUpperCase()}</span>
                        <span className="font-jakarta text-sm font-medium text-cream">{admin.nickname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{admin.realName}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{admin.email}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatDisplayDate(admin.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusDot label={STATUS_LABEL[admin.status]} tone={STATUS_TONE[admin.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionsMenu label={`${admin.nickname} actions`} items={actionItems(admin)} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
            {filtered.map((admin) => (
              <div
                key={admin.id}
                className={`flex flex-col gap-3 border border-grid-line bg-panel/20 p-4 ${admin.status === "suspended" ? DANGER_ROW_CLASSNAME : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={AVATAR_CLASSNAME}>{admin.nickname.slice(0, 2).toUpperCase()}</span>
                    <span className="font-jakarta text-sm font-semibold text-cream">{admin.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot label={STATUS_LABEL[admin.status]} tone={STATUS_TONE[admin.status]} />
                    <ActionsMenu label={`${admin.nickname} actions`} items={actionItems(admin)} />
                  </div>
                </div>
                <span className="font-sans text-sm text-cream-dim">
                  {admin.realName} · {admin.email}
                </span>
                <span className="font-sans text-xs text-cream-dim">Joined {formatDisplayDate(admin.createdAt)}</span>
              </div>
            ))}
          </motion.div>
        </>
      )}

      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={applyAction}
        title={confirmAction ? CONFIRM_COPY[confirmAction.type].title : ""}
        description={confirmAction ? CONFIRM_COPY[confirmAction.type].description(confirmAction.admin) : undefined}
        confirmLabel={confirmAction ? CONFIRM_COPY[confirmAction.type].confirmLabel : undefined}
        tone={confirmAction ? CONFIRM_COPY[confirmAction.type].tone : undefined}
      />
    </motion.div>
  );
}
