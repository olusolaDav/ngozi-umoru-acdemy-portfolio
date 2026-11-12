"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteCode, setAdminInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await postJson("/api/auth/register/admin", {
        fullName,
        email,
        password,
        adminInviteCode,
      });

      toast.success("Account created. Enter the 6-digit code sent to your email.");
      router.push(`/auth/verify-code?flow=email-verification&email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to create admin account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Admin Access" subtitle="Create Admin Account">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          className="h-12 rounded-2xl border-[#ddd5ca] bg-white"
        />
        <Input
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-12 rounded-2xl border-[#ddd5ca] bg-white"
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
        <Input
          placeholder="Admin Invite Code"
          value={adminInviteCode}
          onChange={(event) => setAdminInviteCode(event.target.value)}
          required
          className="h-12 rounded-2xl border-[#ddd5ca] bg-white"
        />
        <Button type="submit" className="mt-3 h-12 w-full rounded-2xl text-sm" disabled={loading}>
          {loading ? "Please wait..." : "Create Admin Account"}
        </Button>

        <p className="text-center text-sm text-[#6f687b]">
          Already onboarded?{" "}
          <Link href="/auth/sign-in" className="font-semibold text-[#311048] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
