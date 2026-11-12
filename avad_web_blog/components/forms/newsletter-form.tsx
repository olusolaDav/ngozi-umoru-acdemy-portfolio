"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/http";

const newsletterSchema = z.object({
  email: z.email(),
});

type NewsletterSchema = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const form = useForm<NewsletterSchema>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: NewsletterSchema) => {
    try {
      await postJson("/api/subscriptions", { email: values.email });
      toast.success("You have been subscribed to AVAD updates.");
      form.reset();
    } catch {
      toast.error("Unable to subscribe right now. Please try again.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto mt-6 flex max-w-[760px] flex-col gap-3.5">
      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        <div className="relative w-full sm:w-[430px]">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--avad-text-soft)]" size={18} />
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <Input id="newsletter-email" placeholder="Email address" type="email" autoComplete="email" required aria-invalid={!!form.formState.errors.email} className="h-10 w-full rounded-2xl border-[#d8d1e9] bg-[#f8f8fd] pl-10" {...form.register("email")} />
        </div>
        <Button type="submit" size="lg" className="h-10 w-full rounded-2xl px-8 text-base sm:w-auto sm:min-w-[120px]">
          Subscribe
        </Button>
      </div>
      {form.formState.errors.email ? <p className="text-center text-xs text-[#b42318]">{form.formState.errors.email.message}</p> : null}
    </form>
  );
}
