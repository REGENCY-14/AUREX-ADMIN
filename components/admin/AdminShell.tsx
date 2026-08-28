"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { getPendingApplicationCount } from "@/lib/applications";
import {
  GridIcon,
  InboxIcon,
  UsersIcon,
  LayersIcon,
  CoinsIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  MenuIcon,
  CloseIcon,
  LogOutIcon,
} from "@/components/icons";

type NavLink = {
  label: string;
  href: string;
  icon: (props: import("react").SVGProps<SVGSVGElement>) => React.ReactElement;
  countBadge?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/", icon: GridIcon },
  { label: "Applications", href: "/applications", icon: InboxIcon, countBadge: true },
  { label: "Members", href: "/members", icon: UsersIcon },
  { label: "Investment Slots", href: "/slots", icon: LayersIcon },
  { label: "Record Investment", href: "/investments", icon: CoinsIcon },
  { label: "Business Listings", href: "/listings", icon: BriefcaseIcon },
  { label: "Home Content", href: "/content", icon: MegaphoneIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The admin app shell: a fixed left sidebar from `lg`, collapsing to a top
 * bar + slide-down nav below it — same "fixed chrome, collapses to a
 * hamburger dropdown" pattern as the main site's own Navbar.tsx, just a
 * vertical sidebar instead of a horizontal bar (this is an internal tool
 * with 7 sections, not a handful of marketing links).
 *
 * Deliberately no AnimatedBackground here (see that component's own
 * comment) — this shell wraps every list/table-heavy admin screen.
 *
 * "Admin User" + Log out are stubs: there's no real auth/session yet (per
 * the brief, that's separate work) — this just proves out where that
 * information will eventually go.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pendingCount = getPendingApplicationCount();
  const headerRef = useRef<HTMLDivElement>(null);
  // The dark-mode export reads as a near-white icon that vanishes against
  // a light sidebar/topbar once the theme toggle (components/
  // ThemeToggle.tsx) is switched — swap to the light-mode export the same
  // way the main site's own BrandMark does, rather than leaving the logo
  // one-theme-only.
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? "/brand/logo-mark-about-icon.png" : "/brand/logo-mark-icon.png";

  useEffect(() => {
    if (!mobileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col lg:flex-row">
      {/* Desktop sidebar — fixed, full height, hidden below lg. */}
      <aside className="hidden shrink-0 border-r border-grid-line bg-panel/40 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col">
        <div className="flex items-center gap-2 border-b border-grid-line px-5 py-5">
          <div className="relative size-8 shrink-0 overflow-hidden">
            <Image src={logoSrc} alt="" fill sizes="32px" className="object-cover" />
          </div>
          <span className="font-jakarta text-sm font-semibold text-cream">AUREX Admin</span>
        </div>

        <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {NAV_LINKS.map(({ label, href, icon: Icon, countBadge }) => {
            const active = isActive(pathname, href);
            return (
              <motion.div key={href} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                <Link
                  href={href}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 font-jakarta text-sm font-medium transition-colors ${
                    active ? "bg-gold/10 text-gold-bright" : "text-cream-dim hover:bg-panel/60 hover:text-cream"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </span>
                  {countBadge && pendingCount > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-bright/90 font-jakarta text-[10px] font-bold text-amainblack">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-grid-line px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-jakarta text-sm font-medium text-cream">Admin User</span>
            <span className="font-sans text-xs text-cream-dim">admin@aurexgh.com</span>
          </div>
          <button type="button" aria-label="Log out" className="text-cream-dim transition-colors hover:text-gold-bright">
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </aside>

      {/* Mobile/tablet top bar — visible below lg. */}
      <div ref={headerRef} className="sticky top-0 z-40 border-b border-grid-line bg-ink/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative size-7 shrink-0 overflow-hidden">
              <Image src={logoSrc} alt="" fill sizes="28px" className="object-cover" />
            </div>
            <span className="font-jakarta text-sm font-semibold text-cream">AUREX Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center text-cream"
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              id="admin-mobile-nav"
              aria-label="Admin sections"
              variants={slideUp}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-col gap-1 border-t border-grid-line bg-ink p-3"
            >
              {NAV_LINKS.map(({ label, href, icon: Icon, countBadge }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 font-jakarta text-sm font-medium ${
                      active ? "bg-gold/10 text-gold-bright" : "text-cream-dim"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      {label}
                    </span>
                    {countBadge && pendingCount > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-bright/90 font-jakarta text-[10px] font-bold text-amainblack">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-grid-line px-3 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-jakarta text-sm font-medium text-cream">Admin User</span>
                  <span className="font-sans text-xs text-cream-dim">admin@aurexgh.com</span>
                </div>
                <button type="button" aria-label="Log out" className="text-cream-dim transition-colors hover:text-gold-bright">
                  <LogOutIcon className="size-4" />
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col">{children}</main>
    </div>
  );
}
