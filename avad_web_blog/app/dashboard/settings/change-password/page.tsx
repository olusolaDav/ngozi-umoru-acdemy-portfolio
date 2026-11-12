"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { professionalErrorMessage } from "@/lib/error-messages";
import { patchJson } from "@/lib/http";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onConfirmChangePassword() {
    setLoading(true);

    try {
      await patchJson("/api/users/me/password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated. Please sign in again.");
      setConfirmOpen(false);
      router.push("/auth/sign-in");
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to update password. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setConfirmOpen(true);
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 sm:p-8">
      <ConfirmationModal
        open={confirmOpen}
        loading={loading}
        title="Confirm Password Change"
        description="Are you sure you want to update your password now? You will be signed out after this change."
        confirmLabel="Update Password"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void onConfirmChangePassword();
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-[var(--avad-text-strong)]">Change Password</h1>
          <p className="mt-2 text-sm text-[var(--avad-text-soft)]">Create and confirm your new password</p>
        </div>
        <Link href="/dashboard/settings" className="mt-2 text-[var(--avad-ring)]">
          <ArrowLeft size={22} />
        </Link>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <PasswordInput
          placeholder="Current Password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <PasswordInput
          placeholder="New Password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={8}
        />
        <PasswordInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
          {loading ? "Saving..." : "Save Password"}
        </Button>
      </form>
    </section>
  );
}
