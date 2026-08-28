"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useSidebarCollapsed } from "@/lib/sidebarState";
import { getPendingApplicationCount } from "@/lib/applications";
import { getOpenReportCount } from "@/lib/reports";
import {
  GridIcon,
  InboxIcon,
  UsersIcon,
  LayersIcon,
  CoinsIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  AlertIcon,
  LogOutIcon,
  ChevronDownIcon,
} from "@/components/icons";

type NavLink = {
  label: string;
  href: string;
  icon: (props: import("react").SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Which live count (see NAV_BADGE_COUNTS below) this link's badge
   *  shows, if any — a key, not a boolean: two links both wanting a
   *  badge need two different numbers, not one shared `pendingCount`
   *  variable slapped on whichever link happens to ask for one. */
  badgeKey?: "pendingApplications" | "openReports";
};

const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/", icon: GridIcon },
  { label: "Applications", href: "/applications", icon: InboxIcon, badgeKey: "pendingApplications" },
  { label: "Members", href: "/members", icon: UsersIcon },
  { label: "Investment Slots", href: "/slots", icon: LayersIcon },
  { label: "Record Investment", href: "/investments", icon: CoinsIcon },
  { label: "Business Listings", href: "/listings", icon: BriefcaseIcon },
  { label: "Home Content", href: "/content", icon: MegaphoneIcon },
  { label: "Reports", href: "/reports", icon: AlertIcon, badgeKey: "openReports" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

// The full "AUREX" lockup (icon + wordmark baked into one image, from
// Figma), one export per theme — a real light/dark pair rather than the
// old single icon-only mark reused unchanged in both themes. Each export
// carries its own natural pixel size (they aren't identical aspect
// ratios) so the <Image> below can be given real width/height and scaled
// by CSS height alone, keeping it undistorted.
const LOGO = {
  light: { src: "/brand/logo-lockup-light.png", width: 68, height: 48 },
  dark: { src: "/brand/logo-lockup-dark.png", width: 68, height: 51 },
} as const;

/**
 * Swapped in below `md` (phone-width screens) instead of the real shell
 * — see AdminShell's own doc comment for why. Deliberately minimal: no
 * nav, no actions, nothing for a phone user to reach for, just the brand
 * mark and a plain explanation of what to do instead.
 */
function UnsupportedViewport({ logo }: { logo: (typeof LOGO)[keyof typeof LOGO] }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-6 py-12 text-center md:hidden">
      <Image src={logo.src} alt="AUREX" width={logo.width} height={logo.height} className="h-10 w-auto shrink-0" />
      <AlertIcon className="size-7 text-gold-bright" />
      <h1 className="font-jakarta text-lg font-semibold text-cream">Tablet or Larger Required</h1>
      <p className="max-w-xs font-sans text-sm text-cream-dim">
        AUREX Admin manages live investment slots, member accounts, and financial records — actions that need more
        room than a phone screen can safely give. Please switch to a tablet or laptop to continue.
      </p>
    </div>
  );
}

/**
 * The admin app shell: one fixed left sidebar, same at every viewport
 * width — no more separate "collapses to a top bar + hamburger dropdown
 * below `lg`" pattern. That pattern (still how the main site's own
 * Navbar.tsx behaves) existed here to cope with a full-width sidebar
 * having nowhere to go on narrow screens; now that the sidebar collapses
 * to a narrow icon rail on its own (the chevron toggle below), that's
 * the one affordance this shell needs for tight widths, so the hamburger
 * variant is redundant per feedback and dropped rather than kept
 * alongside it.
 *
 * The collapse toggle's state lives in lib/sidebarState.ts, not a plain
 * useState here — per feedback, it needs to stay collapsed across a
 * route change, but PageTransition (components/PageTransition.tsx) keys
 * its wrapper on the pathname, which remounts this whole shell on every
 * navigation. A useState would reset on each of those; the module-level
 * store lib/sidebarState.ts uses (same reasoning as lib/theme.ts) does
 * not. Still not synced to localStorage, so a real page reload starts
 * expanded — the ask was "survives navigating", not "survives a reload".
 *
 * Deliberately no AnimatedBackground here (see that component's own
 * comment) — this shell wraps every list/table-heavy admin screen.
 *
 * "Admin User" + Log out are stubs: there's no real auth/session yet (per
 * the brief, that's separate work) — this just proves out where that
 * information will eventually go.
 *
 * Below `md` (phone-width screens), this shell doesn't render its
 * children at all — it swaps in `UnsupportedViewport` instead. Per
 * feedback: unlike the main AUREX site, this admin manages live
 * investment slots, funds, and member accounts, and its list→detail
 * flows and multi-field forms genuinely don't fit safely on a phone —
 * so rather than keep shrinking every screen down to a phone-width
 * card reflow, the floor is tablet-and-up, with a clear message below
 * it instead of a half-usable layout. `md:hidden`/`hidden md:flex` (CSS
 * only, no JS viewport check) so there's no hydration flash of the
 * wrong one before a media query can run, same technique already used
 * for every table→card breakpoint in this app, just applied once here
 * instead of per view.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const badgeCounts = {
    pendingApplications: getPendingApplicationCount(),
    openReports: getOpenReportCount(),
  } as const;
  // Swaps the logo lockup itself per theme (see LOGO above) rather than
  // reusing one icon-only mark in both — same reasoning as the main
  // site's own BrandMark: a mark tuned for one background reads wrong
  // (or vanishes) against the other once the theme toggle (components/
  // ThemeToggle.tsx) is switched.
  const { theme } = useTheme();
  const logo = LOGO[theme];

  return (
    <>
      <UnsupportedViewport logo={logo} />

      <div className="hidden min-h-screen w-full flex-1 flex-row md:flex">
        <aside
          className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-grid-line bg-panel/40 transition-[width] duration-200 ease-in-out ${
            collapsed ? "w-[76px]" : "w-64"
          }`}
        >
          <div
            className={`flex border-b border-grid-line ${
              collapsed ? "flex-col items-center gap-3 px-3 py-4" : "items-center justify-between gap-2 px-5 py-5"
            }`}
          >
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <Image src={logo.src} alt="AUREX" width={logo.width} height={logo.height} className="h-8 w-auto shrink-0" />
              {!collapsed && <span className="whitespace-nowrap font-jakarta text-sm font-semibold text-cream">Admin</span>}
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex size-7 shrink-0 items-center justify-center text-cream-dim transition-colors hover:text-gold-bright"
            >
              <ChevronDownIcon className={`size-4 transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>

          <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
            {NAV_LINKS.map(({ label, href, icon: Icon, badgeKey }) => {
              const active = isActive(pathname, href);
              const badgeCount = badgeKey ? badgeCounts[badgeKey] : 0;
              return (
                <motion.div key={href} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                  <Link
                    href={href}
                    title={collapsed ? label : undefined}
                    className={`relative flex items-center gap-2 px-3 py-2.5 font-jakarta text-sm font-medium transition-colors ${
                      collapsed ? "justify-center" : "justify-between"
                    } ${active ? "bg-gold/10 text-gold-bright" : "text-cream-dim hover:bg-panel/60 hover:text-cream"}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      {!collapsed && label}
                    </span>
                    {badgeCount > 0 && (
                      <span
                        className={`flex shrink-0 items-center justify-center rounded-full bg-gold-bright/90 font-jakarta font-bold text-amainblack ${
                          collapsed ? "absolute -right-1 -top-1 size-4 text-[9px]" : "size-5 text-[10px]"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div
            className={`flex items-center border-t border-grid-line py-4 ${
              collapsed ? "justify-center px-3" : "justify-between gap-2 px-5"
            }`}
          >
            {!collapsed && (
              <div className="flex flex-col gap-0.5">
                <span className="font-jakarta text-sm font-medium text-cream">Admin User</span>
                <span className="font-sans text-xs text-cream-dim">admin@aurexgh.com</span>
              </div>
            )}
            <button
              type="button"
              aria-label="Log out"
              title={collapsed ? "Log out" : undefined}
              className="text-cream-dim transition-colors hover:text-gold-bright"
            >
              <LogOutIcon className="size-4" />
            </button>
          </div>
        </aside>

        <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col">{children}</main>
      </div>
    </>
  );
}
