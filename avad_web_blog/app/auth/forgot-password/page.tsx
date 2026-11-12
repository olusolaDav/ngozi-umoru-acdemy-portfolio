"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await postJson<{ message: string; accountExists?: boolean }>("/api/auth/forgot/request", { email });
      if (response.accountExists === false) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push(`/auth/verify-code?flow=password-reset&email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to send verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter the email address with your account and we'll send a confirmation code to reset your password."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-12 rounded-2xl border-[#ddd5ca] bg-white"
        />
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
          {loading ? "Please wait..." : "Send Code"}
        </Button>
      </form>
    </AuthShell>
  );
}
