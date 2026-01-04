"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "./auth-layout"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Step = "email" | "verify" | "reset"

// Password validation helpers
const PASSWORD_MIN_LENGTH = 8
const hasMinLength = (password: string) => password.length >= PASSWORD_MIN_LENGTH
const hasUppercase = (password: string) => /[A-Z]/.test(password)
const hasLowercase = (password: string) => /[a-z]/.test(password)
const hasNumber = (password: string) => /[0-9]/.test(password)
const hasSpecialChar = (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

const isPasswordValid = (password: string) => 
  hasMinLength(password) && 
  hasUppercase(password) && 
  hasLowercase(password) && 
  hasNumber(password) && 
  hasSpecialChar(password)

// Password requirement component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
      {met ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span>{text}</span>
    </div>
  )
}

export function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send reset code")
        return
      }

      setSessionId(data.sessionId)
      setStep("verify")
      setResendCooldown(60)
      toast.success("Verification code sent to your email")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take the last digit
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newCode = [...code]
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setCode(newCode)
    // Focus last filled input or next empty one
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  // Handle code verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code: fullCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Invalid verification code")
        return
      }

      setStep("reset")
      toast.success("Code verified! Now set your new password.")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to resend code")
        return
      }

      setCode(["", "", "", "", "", ""])
      setResendCooldown(60)
      toast.success("New verification code sent")
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid(password)) {
      toast.error("Password does not meet all requirements")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to reset password")
        return
      }

      toast.success("Password reset successfully! Please login with your new password.")
      router.push("/auth/login")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Email input
  if (step === "email") {
    return (
      <AuthLayout showBackButton={true} backHref="/auth/login">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Forgot Password</h1>
            <p className="mt-3 text-muted-foreground">
              Enter the email address associated with your account
              <br />
              and we&apos;ll send you a verification code to reset your password.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border bg-background px-4"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
          </form>
        </div>
      </AuthLayout>
    )
  }

  // Step 2: Verify code
  if (step === "verify") {
    return (
      <AuthLayout showBackButton={true} backHref="/auth/forgot-password">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Verify Code</h1>
            <p className="mt-3 text-muted-foreground">
              We&apos;ve sent a 6-digit verification code to
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className="h-14 w-12 rounded-xl border-border bg-background text-center text-xl font-semibold"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Resend Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="text-sm text-[#00afef] hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
              disabled={isLoading || code.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Back to email */}
            <button
              type="button"
              onClick={() => {
                setStep("email")
                setCode(["", "", "", "", "", ""])
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Use a different email
            </button>
          </form>
        </div>
      </AuthLayout>
    )
  }

  // Step 3: Reset password
  return (
    <AuthLayout showBackButton={false} backHref="/">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Reset Password</h1>
          <p className="mt-3 text-muted-foreground">
            Create a new secure password for your account.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4 pr-12"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4 pr-12"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password Requirements with live validation */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
            <PasswordRequirement met={hasMinLength(password)} text="At least 8 characters" />
            <PasswordRequirement met={hasUppercase(password)} text="At least one uppercase letter (A-Z)" />
            <PasswordRequirement met={hasLowercase(password)} text="At least one lowercase letter (a-z)" />
            <PasswordRequirement met={hasNumber(password)} text="At least one number (0-9)" />
            <PasswordRequirement met={hasSpecialChar(password)} text="At least one special character (!@#$%...)" />
          </div>

          {/* Password match indicator */}
          {confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${password === confirmPassword ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {password === confirmPassword ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <span>Passwords do not match</span>
                </>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={isLoading || !isPasswordValid(password) || password !== confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
