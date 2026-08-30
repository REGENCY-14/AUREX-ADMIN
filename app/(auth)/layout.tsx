import PageTransition from "@/components/PageTransition";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
