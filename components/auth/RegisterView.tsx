"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthCard from "@/components/auth/AuthCard";
import AuthField from "@/components/auth/AuthField";
import { hoverScale } from "@/lib/motion";
import { useSession } from "@/lib/auth";
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, SpinnerIcon, CheckIcon } from "@/components/icons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A UI-only demo of what a register screen would look like — there's no
 * `/auth/register` route on Aurex-backend to call (see lib/auth.ts:
 * login/logout are real, but this app doesn't support self-service admin
 * signup), and admin accounts aren't the kind of thing you'd normally
 * want anyone to be able to create for themselves anyway. So this
 * validates the form like the other auth screens, then mocks a delay
 * and shows an honest "there's no real signup behind this yet" success
 * state instead of fabricating a session — same spirit as
 * ForgotPasswordView's mocked "check your email" screen.
 */
export default function RegisterView() {
  const router = useRouter();
  const { isAuthenticated } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Already signed in — send straight through instead of showing the
  // form again.
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    // Same deliberate delay as the other auth forms — there's no network
    // round trip here to wait on for real, see the module comment above.
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 500);
  }

  if (isAuthenticated) return null;

  if (done) {
    return (
      <AuthCard
        title="Request received"
        description={`There's no live sign-up yet — an admin will need to set up ${email} before you can sign in with it.`}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="flex size-11 items-center justify-center border border-gold/30 bg-gold/10 text-gold-bright">
            <CheckIcon className="size-5" />
          </span>
          <Link href="/login" className="w-full">
            <motion.span
              {...hoverScale}
              className="flex w-full items-center justify-center bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-5 py-2.5 font-jakarta text-sm font-medium text-amainblack"
            >
              Back to Sign In
            </motion.span>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Set up admin access to manage AUREX's members, investments, and reports."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-gold-bright transition-colors hover:text-gold-light">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="border border-[#f87171]/30 bg-[#f87171]/5 p-3 font-sans text-sm text-[#f87171]">{error}</div>
        )}

        <AuthField
          label="Full Name"
          icon={<UserIcon className="size-4" />}
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <AuthField
          label="Email"
          icon={<MailIcon className="size-4" />}
          type="email"
          autoComplete="email"
          placeholder="you@aurexgh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthField
          label="Password"
          icon={<LockIcon className="size-4" />}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="text-cream-dim transition-colors hover:text-cream"
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          }
        />

        <AuthField
          label="Confirm Password"
          icon={<LockIcon className="size-4" />}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <motion.button
          {...hoverScale}
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold via-gold-light via-50% to-gold px-5 py-2.5 font-jakarta text-sm font-medium text-amainblack disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <SpinnerIcon className="size-4 animate-spin" />}
          {submitting ? "Creating account…" : "Create Account"}
        </motion.button>
      </form>
    </AuthCard>
  );
}
