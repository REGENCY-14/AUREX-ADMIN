import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, DM_Sans, Inter, Manrope, Barlow } from "next/font/google";
import { MotionConfig } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

// Same next/font/google setup as the main AUREX site's app/layout.tsx —
// same families, weights, and CSS variable names, since app/globals.css's
// `@theme inline` block (imported verbatim from that repo) references
// these exact --font-* variables.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AUREX Admin",
  description: "Internal admin tools for the AUREX platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${dmSans.variable} ${inter.variable} ${manrope.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-ink">
        {/* reducedMotion="user" makes every motion.* element in this app
            honor prefers-reduced-motion automatically — same single source
            of motion-safety as the main site, kept here so no admin page
            has to opt in itself.

            No AnimatedBackground here, unlike the main site's root layout:
            per the admin brief, decorative ambient background vectors are
            reserved for the (not-yet-built) login screen only, not the
            list/table-heavy screens every other admin page is. */}
        <MotionConfig reducedMotion="user">
          <PageTransition>{children}</PageTransition>
        </MotionConfig>
      </body>
    </html>
  );
}
