"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift, hoverScale } from "@/lib/motion";
import { formatDisplayDate } from "@/lib/formatters";
import PageHeader from "@/components/admin/PageHeader";
import Modal from "@/components/admin/Modal";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import StatusDot from "@/components/admin/StatusDot";
import BusinessForm from "@/components/admin/businesses/BusinessForm";
import { BriefcaseIcon, PlusIcon } from "@/components/icons";
import { getBusinesses, createBusiness, type Business, type CreateBusinessInput } from "@/lib/businesses";
import { getMembers } from "@/lib/members";

const PAGE_SIZE = 10;

function ownerLabel(business: Business): string {
  return business.ownerType === "admin" ? "AUREX (Admin)" : (business.ownerMemberNickname ?? "—");
}

export default function BusinessesView() {
  const [businesses, setBusinesses] = useState<Business[]>(() => getBusinesses());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // getMembers() returns the live, mutated-in-place MEMBERS array — no
  // memoization needed, this always reflects members created by this
  // view's own "New Member" branch.
  const members = getMembers();

  const totalPages = Math.max(1, Math.ceil(businesses.length / PAGE_SIZE));
  const paginated = useMemo(() => businesses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [businesses, page]);

  async function handleCreate(input: CreateBusinessInput) {
    const created = createBusiness(input);
    setBusinesses((prev) => [created, ...prev]);
    setPage(1);
    setBanner(`“${created.name}” added, owned by ${ownerLabel(created)}.`);
    setIsModalOpen(false);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"
    >
      <PageHeader
        title="Businesses"
        description="Add a business — your own, or on behalf of an existing or new member."
        action={
          <motion.button
            {...hoverScale}
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2.5 font-jakarta text-sm font-medium text-amainblack"
          >
            <PlusIcon className="size-3.5" /> Add Business
          </motion.button>
        }
      />

      {banner && (
        <motion.div variants={staggerItem} className="border border-gold/30 bg-gold/5 p-4 font-sans text-sm text-cream-dim">
          {banner}
        </motion.div>
      )}

      {businesses.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title="No businesses yet"
          description="Add one to get started — it can belong to AUREX or to a member."
          action={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-4 py-2.5 font-jakarta text-sm font-medium text-amainblack"
            >
              <PlusIcon className="size-3.5" /> Add Business
            </button>
          }
        />
      ) : (
        <>
          <motion.div variants={staggerItem} className="hidden overflow-x-auto border border-grid-line lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-grid-line bg-panel/40">
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Business</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Category</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Owner</th>
                  <th className="px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-cream-dim">Added</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((business) => (
                  <motion.tr key={business.id} {...hoverLift} className="border-b border-grid-line last:border-b-0 hover:bg-panel/30">
                    <td className="px-4 py-3 font-jakarta text-sm font-medium text-cream">{business.name}</td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{business.category}</td>
                    <td className="px-4 py-3">
                      <StatusDot label={ownerLabel(business)} tone={business.ownerType === "admin" ? "gold" : "neutral"} />
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-cream-dim">{formatDisplayDate(business.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col gap-3 lg:hidden">
            {paginated.map((business) => (
              <motion.div key={business.id} {...hoverLift} className="flex flex-col gap-2 border border-grid-line bg-panel/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-jakarta text-sm font-semibold text-cream">{business.name}</span>
                  <StatusDot label={ownerLabel(business)} tone={business.ownerType === "admin" ? "gold" : "neutral"} />
                </div>
                <span className="font-sans text-xs text-cream-dim">
                  {business.category} · Added {formatDisplayDate(business.createdAt)}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Business"
        description="It can be AUREX's own business, or added on behalf of a member — existing or brand new."
      >
        <BusinessForm members={members} onSubmit={handleCreate} />
      </Modal>
    </motion.div>
  );
}
