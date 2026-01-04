"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLayout } from "./auth-layout"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const auth = useAuth()

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("portfolio_remember_email")
    const wasRemembered = localStorage.getItem("portfolio_remember_me") === "true"
    
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("portfolio_remember_email", email)
        localStorage.setItem("portfolio_remember_me", "true")
      } else {
        localStorage.removeItem("portfolio_remember_email")
        localStorage.removeItem("portfolio_remember_me")
      }

      const result: any = await auth.login(email, password)
      if (result?.requiresVerification) {
        // store session id and email for verification page
        if (result.sessionId) sessionStorage.setItem("portfolio_session_id", result.sessionId)
        sessionStorage.setItem("portfolio_temp_email", email)
        
        toast.success('Login successful! Please check your email for the verification code.')
        router.push('/auth/verify')
        return
      }

      // login succeeded without verification — reload to pick up session
      toast.success('Login successful!')
      window.location.reload()
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed'
      
      // Provide specific error messages based on common error patterns
      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credentials')) {
        toast.error('Invalid email or password')
        setError('Invalid credentials')
      } else if (errorMessage.toLowerCase().includes('not found')) {
        toast.error('Account not found. Please check your email address.')
        setError('Account not found')
      } else if (errorMessage.toLowerCase().includes('verify') || errorMessage.toLowerCase().includes('verification')) {
        toast.error('Please verify your email address to continue')
        setError('Email verification required')
      } else if (errorMessage.toLowerCase().includes('disabled')) {
        toast.error('Your account has been disabled. Please contact support.')
        setError('Account disabled')
      } else if (errorMessage.toLowerCase().includes('attempts') || errorMessage.toLowerCase().includes('limit')) {
        toast.error('Too many login attempts. Please wait before trying again.')
        setError('Too many attempts')
      } else {
        toast.error(errorMessage)
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout showBackButton={true} backHref="/">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your secure workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4"
              required
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember Me
              </label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={isLoading}
          >
            Continue
          </Button>

          {error && <p className="text-sm text-destructive mt-2">{error}</p>}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <p
     
              className="relative bg-background px-4 text-sm text-muted-foreground"
            >
              Powered by Academic Portfolio
            </p>
          </div>

         
        </form>
      </div>
    </AuthLayout>
  )
}
