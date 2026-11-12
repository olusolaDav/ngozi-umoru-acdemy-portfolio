"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DASHBOARD_HOME_BY_ROLE } from "@/lib/auth-constants";
import { professionalErrorMessage } from "@/lib/error-messages";
import { postJson } from "@/lib/http";

type VerificationFlow = "email-verification" | "password-reset" | "login-verification";

type VerificationCodePageProps = {
  defaultFlow: VerificationFlow;
};

type VerifyResetResponse = {
  resetToken: string;
};

function isVerificationFlow(value: string | null): value is VerificationFlow {
  return value === "email-verification" || value === "password-reset" || value === "login-verification";
}

export function VerificationCodePage({ defaultFlow }: VerificationCodePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const next = useMemo(() => searchParams.get("next"), [searchParams]);
  const verificationToken = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const flow = useMemo(() => {
    const flowParam = searchParams.get("flow");
    return isVerificationFlow(flowParam) ? flowParam : defaultFlow;
  }, [defaultFlow, searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [codeDigits, setCodeDigits] = useState<string[]>(Array.from({ length: 6 }, () => ""));
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function maskEmailAddress(value: string) {
    const normalized = value.trim();
    const [name = "", domain = ""] = normalized.split("@");
    if (!name || !domain) {
      return normalized;
    }

    const visibleStart = name.slice(0, 2);
    const visibleEnd = name.slice(-1);
    const masked = name.length > 3 ? "*".repeat(Math.min(name.length - 3, 6)) : "*";
    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  }

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const code = codeDigits.join("");

  const onVerify = useCallback(async () => {
    if (loading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (flow !== "login-verification" && !normalizedEmail) {
      toast.error("Enter your email to continue.");
      return;
    }

    if (code.length !== 6) {
      toast.error("Enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      if (flow === "login-verification") {
        const response = await postJson<{ user?: { role: string } }>("/api/auth/login/verify", { verificationToken, code });
        const roleHome = response.user?.role ? DASHBOARD_HOME_BY_ROLE[response.user.role] ?? "/dashboard" : "/community";
        const destination = response.user?.role && response.user.role !== "MEMBER" ? roleHome : next && next.startsWith("/") && !next.startsWith("//") ? next : roleHome;
        toast.success("Signed in successfully.");
        router.push(destination);
        return;
      }
      if (flow === "email-verification") {
        const response = await postJson<{ message: string }>("/api/auth/verify-email/confirm", {
          email: normalizedEmail,
          code,
        });
        toast.success(response.message);
        const destination = next && next.startsWith("/") && !next.startsWith("//")
          ? `/auth/sign-in?next=${encodeURIComponent(next)}`
          : "/auth/sign-in";
        router.push(destination);
      } else {
        const response = await postJson<VerifyResetResponse>("/api/auth/forgot/verify-code", {
          email: normalizedEmail,
          code,
        });
        toast.success("Code verified. Set your new password.");
        router.push(`/auth/reset-password?token=${encodeURIComponent(response.resetToken)}`);
      }
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Verification failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [code, email, flow, loading, next, router, verificationToken]);

  function applyPastedDigits(raw: string, startIndex: number) {
    const digits = raw.replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) {
      return;
    }

    setCodeDigits((previous) => {
      const updated = [...previous];

      if (digits.length === 6) {
        return digits;
      }

      digits.forEach((digit, offset) => {
        const target = startIndex + offset;
        if (target < updated.length) {
          updated[target] = digit;
        }
      });

      return updated;
    });

    const focusIndex = digits.length === 6 ? 5 : Math.min(startIndex + digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  function updateCodeDigit(index: number, nextValue: string) {
    const digits = nextValue.replace(/\D/g, "");

    if (digits.length > 1) {
      applyPastedDigits(digits, index);
      return;
    }

    const numeric = digits.slice(-1);

    setCodeDigits((previous) => {
      const updated = [...previous];
      updated[index] = numeric;
      return updated;
    });

    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function onDigitKeyDown(index: number, key: string) {
    if (key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function onCodePaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const pasted = event.clipboardData.getData("text");
    if (!pasted) {
      return;
    }

    event.preventDefault();
    applyPastedDigits(pasted, index);
  }

  async function onResend() {
    const normalizedEmail = email.trim().toLowerCase();
    if (flow !== "login-verification" && !normalizedEmail) {
      toast.error("Provide your email to resend verification.");
      return;
    }

    if (resendSeconds > 0) {
      return;
    }

    setLoading(true);
    try {
      if (flow === "login-verification") {
        await postJson("/api/auth/login/resend-code", { verificationToken });
        toast.success("A new verification code has been sent.");
      } else if (flow === "email-verification") {
        const response = await postJson<{ message: string }>("/api/auth/verify-email/request", {
          email: normalizedEmail,
        });
        toast.success(response.message);
      } else {
        const response = await postJson<{ message: string; accountExists?: boolean }>("/api/auth/forgot/request", {
          email: normalizedEmail,
        });
        if (response.accountExists === false) {
          toast.error(response.message);
          return;
        }

        toast.success(response.message);
      }

      setResendSeconds(60);
    } catch (caught) {
      toast.error(professionalErrorMessage(caught, "Unable to resend verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  const maskedEmail = maskEmailAddress(email);
  const backHref = flow === "email-verification" || flow === "login-verification" ? "/auth/sign-in" : "/auth/forgot-password";

  return (
    <AuthShell title={flow === "login-verification" ? "Confirm Your Sign In" : "Enter 6-digit Code"} subtitle={flow === "login-verification" ? "Enter the code sent to your email." : "We have sent a verification code to:"}>
      <div className="space-y-5">
        {flow === "login-verification" ? (
          <p className="text-center text-sm text-[#756d83]">Your code expires in 10 minutes.</p>
        ) : email ? (
          <p className="text-center text-sm font-medium text-[#cd8951]">{maskedEmail}</p>
        ) : (
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-11 rounded-2xl border-[#ddd5ca]"
          />
        )}

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {codeDigits.map((digit, index) => (
            <div key={`digit-${index}`} className="flex items-center gap-2 sm:gap-3">
              <Input
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => {
                  updateCodeDigit(index, event.target.value);
                }}
                onPaste={(event) => onCodePaste(event, index)}
                onKeyDown={(event) => onDigitKeyDown(index, event.key)}
                aria-label={`Verification digit ${index + 1}`}
                className="h-14 w-11 rounded-xl border-2 border-[#ded4c8] bg-white px-0 text-center text-2xl font-bold tracking-wide text-[#2b2337] shadow-sm outline-none transition focus:border-[#6c3b88] focus:ring-4 focus:ring-[#6c3b88]/10 sm:w-12"
              />
              {index === 2 ? <span className="text-xl font-semibold text-[#756d83]">-</span> : null}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#756d83]">
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={loading || resendSeconds > 0}
            className="font-medium text-[#5f4f7a] underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Resend Code
          </button>
          <span>{resendSeconds > 0 ? `00:${String(resendSeconds).padStart(2, "0")}` : "Now"}</span>
        </div>

        <Button type="button" className="h-12 w-full rounded-2xl" onClick={() => void onVerify()} disabled={loading || code.length !== 6}>
          {loading ? "Please wait..." : "Verify"}
        </Button>

        <Link href={backHref} className="block text-center text-sm font-semibold text-[#311048] hover:underline">
          Back
        </Link>
      </div>
    </AuthShell>
  );
}
