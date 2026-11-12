import { NewsletterForm } from "@/components/forms/newsletter-form";

type NewsletterSectionProps = {
  className?: string;
};

export function NewsletterSection({ className }: NewsletterSectionProps) {
  return (
    <section className={className}>
      <div className="mx-auto w-full max-w-[920px] px-4 pb-5 text-center md:px-6">
        <h2 className="border-b border-[var(--avad-border)] pb-3 font-serif text-[clamp(1.9rem,2.8vw,3rem)] font-bold text-[var(--avad-text-strong)]">
          Subscribe to Our Newsletter
        </h2>
        <NewsletterForm />
      </div>
    </section>
  );
}
