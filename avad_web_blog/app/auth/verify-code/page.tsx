"use client";

import { Suspense } from "react";

import { VerificationCodePage } from "@/components/auth/verification-code-page";

export default function VerifyCodePage() {
  return (
    <Suspense fallback={null}>
      <VerificationCodePage defaultFlow="password-reset" />
    </Suspense>
  );
}
