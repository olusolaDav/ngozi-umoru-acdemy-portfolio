"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";
import { Input } from "@/components/ui/input";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter at least 2 characters for your name."),
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(2, "Please enter a subject with at least 2 characters."),
  message: z.string().trim().min(10, "Please write a message with at least 10 characters."),
}).refine((value) => !value.phone || value.phone.length >= 7, {
  message: "Phone number must be at least 7 characters.",
  path: ["phone"],
});

type ContactSchema = z.infer<typeof contactSchema>;

type ContactSubmitResponse = {
  message?: string;
};

export function ContactForm() {
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const form = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactSchema) => {
    try {
      const payload = {
        ...values,
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
      };

      const response = await postJson<ContactSubmitResponse>("/api/contact/messages", payload);
      toast.success(response.message ?? "Message sent successfully. Our team will get back to you shortly.");
      form.reset();
      setShowPhoneInput(false);
    } catch (error) {
      toast.error(professionalErrorMessage(error, "Unable to send message right now. Please try again."));
    }
  };

  const togglePhoneInput = () => {
    setShowPhoneInput((current) => {
      if (current) {
        form.setValue("phone", "", { shouldValidate: true });
      }

      return !current;
    });
  };

  const invalidFieldClassName = "border-[#b42318] focus:border-[#b42318] focus:ring-[#fda29b]";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[30px] border border-[var(--avad-border)] bg-[var(--avad-bg-elevated)] p-6 shadow-sm md:p-7">
      <h3 className="font-serif text-[52px] font-bold leading-none text-[var(--avad-text-strong)]">Get In Touch</h3>
      <p className="mt-2 text-base text-[var(--avad-text-soft)]">You can reach us anytime</p>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold text-[var(--avad-text-soft)]">Name <span aria-hidden="true">*</span><span className="sr-only"> required</span></label>
          <Input
            id="contact-name"
            placeholder="Name (required)"
            required
            className={form.formState.errors.name ? invalidFieldClassName : undefined}
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          {form.formState.errors.name ? <p className="mt-1 text-xs text-[#b42318]">{form.formState.errors.name.message}</p> : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-[var(--avad-text-soft)]">Email <span aria-hidden="true">*</span><span className="sr-only"> required</span></label>
          <Input
            id="contact-email"
            placeholder="Email (required)"
            type="email"
            required
            className={form.formState.errors.email ? invalidFieldClassName : undefined}
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          {form.formState.errors.email ? <p className="mt-1 text-xs text-[#b42318]">{form.formState.errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold text-[var(--avad-text-soft)]">Subject <span aria-hidden="true">*</span><span className="sr-only"> required</span></label>
          <Input
            id="contact-subject"
            placeholder="Subject (required)"
            required
            className={form.formState.errors.subject ? invalidFieldClassName : undefined}
            aria-invalid={!!form.formState.errors.subject}
            {...form.register("subject")}
          />
          {form.formState.errors.subject ? (
            <p className="mt-1 text-xs text-[#b42318]">{form.formState.errors.subject.message}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={togglePhoneInput}
          className="h-10 rounded-xl border border-dashed border-[var(--avad-border)] px-3 text-sm text-[var(--avad-text-soft)] transition hover:border-[var(--avad-ring)] hover:text-[var(--avad-text)] md:text-left"
        >
          {showPhoneInput ? "Remove phone number" : "Add phone number (optional)"}
        </button>
        {showPhoneInput ? (
          <div className="md:col-span-2">
            <Input
              id="contact-phone"
              placeholder="Phone number (optional)"
              className={form.formState.errors.phone ? invalidFieldClassName : undefined}
              aria-invalid={!!form.formState.errors.phone}
              {...form.register("phone")}
            />
            <p className="mt-1 text-xs text-[var(--avad-text-soft)]">Include country code if possible (example: +234...)</p>
            {form.formState.errors.phone ? (
              <p className="mt-1 text-xs text-[#b42318]">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <label htmlFor="contact-message" className="mt-4 block text-xs font-semibold text-[var(--avad-text-soft)]">Message <span aria-hidden="true">*</span><span className="sr-only"> required</span></label>
      <textarea
        data-writing-assistance
        id="contact-message"
        placeholder="Write your message here"
        required
        className={`mt-1 h-44 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm text-[var(--avad-text)] outline-none transition ${
          form.formState.errors.message
            ? "border-[#b42318] focus:border-[#b42318] focus:ring-2 focus:ring-[#fda29b]"
            : "border-[var(--avad-border)] focus:border-[var(--avad-ring)]"
        }`}
        aria-invalid={!!form.formState.errors.message}
        {...form.register("message")}
      />
      {form.formState.errors.message ? <p className="mt-1 text-xs text-[#b42318]">{form.formState.errors.message.message}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting} className="mt-6 h-12 w-full rounded-2xl">
        Send Message
      </Button>
    </form>
  );
}
