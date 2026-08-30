import type { Metadata } from "next";
import ForgotPasswordView from "@/components/auth/ForgotPasswordView";

export const metadata: Metadata = {
  title: "Forgot Password | AUREX Admin",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
