import { formatGhs } from "@/lib/formatters";
import { getFundingPercent, type BusinessListing } from "@/lib/businessListings";

/**
 * One meter per business listing — "a single ratio against a limit" is
 * the dataviz skill's own recommended form for exactly this job, not a
 * grouped bar chart (raised vs. goal as two separate bars would make the
 * reader do the division themselves; the meter already shows it).
 *
 * Same track/fill treatment as the main AUREX site's own
 * FundingProgressSection.tsx (bg-grid-line track, gold gradient fill,
 * green for funded, graphite for closed) — reused rather than
 * reinvented, so a listing's progress bar looks identical whether a
 * business owner sees it on their own dashboard or Admin sees it here.
 * Every value (raised/goal/percent) is a direct text label beside the
 * meter, never color-only.
 */
export default function FundingMeterList({ listings }: { listings: BusinessListing[] }) {
  if (listings.length === 0) {
    return <p className="font-sans text-sm text-cream-dim">No business listings yet.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {listings.map((listing) => {
        const percent = getFundingPercent(listing);
        const isFunded = listing.status === "funded";
        const isClosed = listing.status === "closed";

        return (
          <div key={listing.id} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="font-jakarta text-sm font-medium text-cream">{listing.businessName}</span>
              <span className="font-sans text-xs text-cream-dim">
                {formatGhs(listing.amountRaisedGhs)} of {formatGhs(listing.fundingGoalGhs)} · {percent}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-grid-line bg-grid-line">
              <div
                className={`h-full rounded-full ${
                  isFunded ? "bg-[#4ade80]" : isClosed ? "bg-graphite" : "bg-gradient-to-r from-gold via-gold-light to-gold-bright"
                }`}
                style={{ width: `${Math.max(percent, percent > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
