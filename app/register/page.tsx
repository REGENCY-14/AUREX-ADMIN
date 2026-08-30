import type { Metadata } from "next";
import RegisterView from "@/components/auth/RegisterView";

export const metadata: Metadata = {
  title: "Create Account | AUREX Admin",
};

export default function RegisterPage() {
  return <RegisterView />;
}
