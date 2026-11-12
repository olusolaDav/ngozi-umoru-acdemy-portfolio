"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

function MemberSignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await postJson("/api/auth/register/member", {
        fullName,
        email,
        password,
      });
      toast.success("Account created. Enter the 6-digit code sent to your email.");
      const next = searchParams.get("next");
      const params = new URLSearchParams({
        flow: "email-verification",
        email: email.trim().toLowerCase(),
      });
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        params.set("next", next);
      }
      router.push(`/auth/verify-code?${params.toString()}`);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to create account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome Back!" subtitle="Create your Account">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input
          placeholder="Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          className="h-12 rounded-2xl border-[#ddd5ca] bg-white text-sm text-[#2b2337] placeholder:text-[#8e879a]"
        />
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
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" className="mt-3 h-12 w-full rounded-2xl text-sm" disabled={loading}>
          {loading ? "Please wait..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-[#6f687b]">
          Are you a member already?{" "}
          <Link
            href={searchParams.get("next") ? `/auth/sign-in?next=${encodeURIComponent(searchParams.get("next") ?? "")}` : "/auth/sign-in"}
            className="font-semibold text-[#311048] hover:underline"
          >
            Sign in
          </Link>
        </p>

     
      </form>
    </AuthShell>
  );
}

export default function MemberSignUpPage() {
  return <Suspense fallback={null}><MemberSignUpContent /></Suspense>;
}
