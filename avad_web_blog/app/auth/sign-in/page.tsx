"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DASHBOARD_HOME_BY_ROLE } from "@/lib/auth-constants";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

type LoginResponse = {
  requiresPasswordChange: boolean;
  requiresTwoFactor?: boolean;
  verificationToken?: string;
  user?: {
    role: string;
  };
};

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await postJson<LoginResponse>("/api/auth/login", {
        email,
        password,
        remember,
      });

      if (response.requiresPasswordChange) {
        toast.info("Password change required before you can continue.");
        router.push("/auth/change-password");
        return;
      }

      if (response.requiresTwoFactor && response.verificationToken) {
        toast.info("We sent a six-digit verification code to your email.");
        const next = searchParams.get("next");
        const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
        router.push(`/auth/verify-code?flow=login-verification&token=${encodeURIComponent(response.verificationToken)}${nextParam}`);
        return;
      }

      const role = response.user?.role;
      const next = searchParams.get("next");
      const roleHome = role ? DASHBOARD_HOME_BY_ROLE[role] ?? "/dashboard" : "/dashboard";
      const validNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      const destination = role && role !== "MEMBER" ? roleHome : validNext ?? roleHome;
      toast.success("Signed in successfully.");
      router.push(destination);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to sign in. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome Back!" subtitle="Sign in your Account">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-12 rounded-2xl border-[#ddd5ca] bg-white text-sm text-[#2b2337] placeholder:text-[#8e879a]"
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        <div className="mt-2 flex items-center justify-between text-xs text-[#756f80]">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border border-[#cec5b8]"
            />
            Remember Me
          </label>

          <Link href="/auth/forgot-password" className="underline-offset-2 hover:underline">
            Forget Password?
          </Link>
        </div>
        <Button type="submit" className="mt-3 h-12 w-full rounded-2xl text-sm" disabled={loading}>
          {loading ? "Please wait..." : "Continue"}
        </Button>

        <p className="text-center text-sm text-[#6f687b]">
          New here?{" "}
          <Link href={searchParams.get("next") ? `/auth/sign-up?next=${encodeURIComponent(searchParams.get("next") ?? "")}` : "/auth/sign-up"} className="font-semibold text-[#311048] hover:underline">
            Create member account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignInPage() {
  return <Suspense fallback={null}><SignInContent /></Suspense>;
}
