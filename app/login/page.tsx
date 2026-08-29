import type { Metadata } from "next";
import { Suspense } from "react";
import LoginView from "@/components/auth/LoginView";

export const metadata: Metadata = {
  title: "Sign In | AUREX Admin",
};

// LoginView reads ?next= via useSearchParams, which Next requires to sit
// behind a Suspense boundary (otherwise the whole route opts out of
// static generation with a build-time warning).
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
