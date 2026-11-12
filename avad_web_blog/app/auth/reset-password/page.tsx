"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resetToken) {
      toast.error("Invalid reset session. Restart password reset.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await postJson("/api/auth/forgot/reset", {
        resetToken,
        newPassword: password,
      });
      toast.success("Password reset successful. Sign in with your new password.");
      router.push("/auth/sign-in");
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Change Password" subtitle="Create New Password">
      <form className="space-y-4" onSubmit={onSubmit}>
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
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
          {loading ? "Please wait..." : "Save Password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordContent /></Suspense>;
}
