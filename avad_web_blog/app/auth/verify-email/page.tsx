"use client";

import { Suspense } from "react";

import { VerificationCodePage } from "@/components/auth/verification-code-page";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificationCodePage defaultFlow="email-verification" />
    </Suspense>
  );
}
