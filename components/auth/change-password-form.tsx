"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "./auth-layout"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

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

export function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstLogin, setIsFirstLogin] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if this is a first-time user (new account) or returning user
  useEffect(() => {
    const reason = searchParams.get("reason")
    // If reason=first-login or no reason specified with mustChangePassword, it's first login
    // If user navigated here manually or for other reasons, they're returning
    setIsFirstLogin(reason === "first-login" || reason === null)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      setError(null)
      
      if (password !== confirmPassword) {
        toast.error('Passwords do not match')
        setError('Passwords do not match')
        return
      }
      
      if (!isPasswordValid(password)) {
        toast.error('Password does not meet all requirements')
        setError('Password does not meet all requirements')
        return
      }

      const res = await fetch('/api/auth/change-password', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ password }) 
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Your session has expired. Please login again.')
          router.push('/auth/login')
          return
        }
        
        const errorMsg = data?.error || 'Failed to change password'
        toast.error(errorMsg)
        setError(errorMsg)
        return
      }

      // Success
      toast.success('Password changed successfully!')
      
      // successful — reload user and redirect to dashboard
      const me = await fetch('/api/auth/me')
      if (me.ok) {
        const payload = await me.json()
        const user = payload?.user
        if (user) {
          // Store flag to prompt profile completion
          if (isFirstLogin) {
            sessionStorage.setItem('promptProfileCompletion', 'true')
          }
          const route = (await import('@/lib/auth-types')).dashboardRoutes[user.role as any]
          router.replace(route || '/')
          return
        }
      }
      window.location.replace('/')
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to change password'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout showBackButton={false} backHref="/">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Change Password</h1>
          <p className="mt-2 text-muted-foreground">
            {isFirstLogin ? "Set your new password for the first time" : "Update your account password"}
          </p>
          {isFirstLogin && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 rounded-lg p-3">
              This is required before you can access your dashboard. Your account was created with a temporary password which must be changed.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={isLoading || !isPasswordValid(password) || password !== confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </div>
    </AuthLayout>
  )
}
