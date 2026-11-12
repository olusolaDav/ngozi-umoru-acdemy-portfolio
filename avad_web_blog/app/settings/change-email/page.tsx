"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { professionalErrorMessage } from "@/lib/error-messages";
import { patchJson } from "@/lib/http";

export default function MemberChangeEmailPage() {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onConfirmChangeEmail() {
    setLoading(true);

    try {
      const response = await patchJson<{ message: string }>("/api/users/me/email", {
        newEmail,
        password,
      });
      toast.success(response.message);
      setPassword("");
      setNewEmail("");
      setConfirmOpen(false);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to update email. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  return (
    <section className="mx-auto my-10 w-full max-w-xl rounded-3xl border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 sm:p-8">
      <ConfirmationModal
        open={confirmOpen}
        loading={loading}
        title="Confirm Email Change"
        description="Update your email address with this new value?"
        confirmLabel="Update Email"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void onConfirmChangeEmail();
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-[var(--avad-text-strong)]">Update Email</h1>
          <p className="mt-2 text-sm text-[var(--avad-text-soft)]">Keep your account details up to date</p>
        </div>
        <Link href="/settings" className="mt-2 text-[var(--avad-text)]">
          <ArrowLeft size={22} />
        </Link>
      </div>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Input
          type="email"
          placeholder="New Email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          required
          className="h-12 rounded-2xl border-[var(--avad-border)]"
        />
        <Input
          type="password"
          placeholder="Current Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="h-12 rounded-2xl border-[var(--avad-border)]"
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#b6864f] via-[#663166] to-[#34114f] text-white"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </section>
  );
}
