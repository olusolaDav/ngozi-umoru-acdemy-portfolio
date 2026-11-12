"use client";

import { ArrowLeft, Pencil, UserCog, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

const roleCards = [
  { label: "Moderator", value: "MODERATOR", icon: UserCog, description: "Can manage most dashboard resources except sensitive admin operations." },
  { label: "Blogger", value: "BLOGGER", icon: Pencil, description: "Can manage blog content and blog related workflow only." },
] as const;

export default function InviteUserPage() {
  const [selectedRole, setSelectedRole] = useState<"MODERATOR" | "BLOGGER">("MODERATOR");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await postJson<{ message: string }>("/api/users/invite", {
        fullName,
        email,
        role: selectedRole,
      });

      toast.success(response.message);
      setFullName("");
      setEmail("");
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to add user. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-[#241438] dark:text-[#f2ebff]">Invite Team Member</h1>
          <p className="mt-2 text-sm text-[#675d7c] dark:text-[#c9bbdc]">Create a secure invite and email temporary credentials in one step.</p>
        </div>

        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 rounded-full border border-[#d6cce6] bg-white px-4 py-2 text-xs font-semibold text-[#3c3052] hover:bg-[#f8f4fc] dark:border-[#4d4061] dark:bg-[#2b1f3b] dark:text-[#efe6fb] dark:hover:bg-[#352646]"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-[#d7e0f4] bg-gradient-to-b from-[#f8fbff] to-[#eef4ff] p-6 sm:p-8 dark:border-[#3a4154] dark:from-[#222b3f] dark:to-[#1d2333]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4d67a5] dark:text-[#a8c3ff]">Step 1</p>
          <h2 className="mt-2 font-serif text-3xl text-[#1f2033] dark:text-[#eef4ff]">Choose a Role</h2>
          <p className="mt-2 text-sm text-[#606985] dark:text-[#c2ccdf]">Select the access level that matches the user responsibilities.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {roleCards.map((item) => {
              const Icon = item.icon;
              const active = item.value === selectedRole;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedRole(item.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-[#2e63dd] bg-[#e9f1ff] shadow-sm dark:border-[#8db3ff] dark:bg-[#2d3a54]"
                      : "border-[#d8deea] bg-white hover:border-[#b9c7e0] dark:border-[#495270] dark:bg-[#202737] dark:hover:border-[#7e90b8]"
                  }`}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#dbe8ff] text-[#2f5ec2] dark:bg-[#364563] dark:text-[#c5d8ff]">
                    <Icon size={24} />
                  </span>
                  <p className="mt-3 font-semibold text-[#22283a] dark:text-[#eff4ff]">{item.label}</p>
                  <p className="mt-1 text-xs text-[#66708d] dark:text-[#bfcae1]">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e6deef] bg-white p-6 sm:p-8 dark:border-[#473857] dark:bg-[#241b31]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6d6282] dark:text-[#c5b8d8]">Step 2</p>
          <div className="mt-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff3ff] text-[#3d5fc2] dark:bg-[#2f2740] dark:text-[#d3c8e8]">
            <UserRound size={24} />
          </div>
          <h3 className="mt-4 font-serif text-3xl text-[#241438] dark:text-[#f2ebff]">Add {selectedRole === "MODERATOR" ? "Moderator" : "Blogger"}</h3>
          <p className="mt-2 text-sm text-[#6d6282] dark:text-[#c5b8d8]">An onboarding email with temporary credentials will be sent automatically.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="h-12 rounded-2xl border-[#ddd5ca] dark:border-[#504064] dark:bg-[#2e2340] dark:text-[#f2ebff]"
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 rounded-2xl border-[#ddd5ca] dark:border-[#504064] dark:bg-[#2e2340] dark:text-[#f2ebff]"
            />

            <div className="rounded-2xl border border-[#eadff2] bg-[#faf6ff] px-4 py-3 text-xs text-[#6e6384] dark:border-[#4f4061] dark:bg-[#2f2441] dark:text-[#cfbfdc]">
              The invited user will be prompted to update their password on first sign-in.
            </div>

            <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
              {loading ? "Sending invite..." : `Send ${selectedRole === "MODERATOR" ? "Moderator" : "Blogger"} Invite`}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
