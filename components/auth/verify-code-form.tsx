"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "./auth-layout"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

interface VerifyCodeFormProps {
  email?: string
}

export function VerifyCodeForm({ email }: VerifyCodeFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(56)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const auth = useAuth()
  const [userEmail, setUserEmail] = useState<string>("") 

  useEffect(() => {
    const tempEmail = sessionStorage.getItem("portfolio_temp_email")
    if (tempEmail) {
      setUserEmail(tempEmail)
    }
  }, [])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleChange = (index: number, value: string) => {
    // Filter out non-numeric characters
    value = value.replace(/[^0-9]/g, '')

    // Handle single digit input
    if (value.length > 1) {
      // If multiple digits pasted, distribute them
      const newCode = [...code]
      for (let i = 0; i < value.length && i + index < 6; i++) {
        newCode[i + index] = value[i]
      }
      setCode(newCode)
      // Focus the last filled input or the last input if all 6 are filled
      const lastFilledIndex = Math.min(index + value.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
    if (pastedData.length > 0) {
      const newCode = [...code]
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)
      // Focus the last filled input or the next empty one
      const lastFilledIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const sessionId = sessionStorage.getItem("portfolio_session_id")
      if (!sessionId) {
        toast.error('Session expired. Please login again.')
        router.push('/auth/login')
        return
      }
      
      const res = await fetch('/api/auth/resend', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ sessionId }) 
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Your session has expired. Please login again.')
          sessionStorage.removeItem('portfolio_session_id')
          sessionStorage.removeItem('portfolio_temp_email')
          router.push('/auth/login')
          return
        }
        
        if (res.status === 429) {
          toast.error('Too many attempts. Please wait before requesting another code.')
          return
        }
        
        const errorMsg = data?.error || 'Failed to resend verification code'
        toast.error(errorMsg)
        setError(errorMsg)
        return
      }
      
      // Success
      setTimer(60)
      toast.success('Verification code sent successfully!')
      
    } catch (err) {
      const errorMsg = 'Failed to resend verification code. Please check your connection.'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    
    if (fullCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      const sessionId = sessionStorage.getItem('portfolio_session_id')
      if (!sessionId) {
        toast.error('Session expired. Please login again.')
        router.push('/auth/login')
        return
      }

      const res = await fetch('/api/auth/verify', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ sessionId, code: fullCode }) 
      })
      
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        if (res.status === 401) {
          if (data?.error === 'session expired') {
            toast.error('Your session has expired. Please login again.')
            sessionStorage.removeItem('portfolio_session_id')
            sessionStorage.removeItem('portfolio_temp_email')
            router.push('/auth/login')
            return
          }
          toast.error('Invalid session. Please login again.')
          router.push('/auth/login')
          return
        }
        
        if (res.status === 400) {
          if (data?.error === 'code expired') {
            toast.error('Verification code has expired. Please request a new one.')
            setError('Code expired. Please request a new code.')
            return
          }
          if (data?.error === 'invalid code') {
            toast.error('Invalid verification code. Please try again.')
            setError('Invalid verification code')
            // Clear the code inputs
            setCode(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
            return
          }
        }
        
        if (res.status === 429) {
          toast.error('Too many verification attempts. Please wait before trying again.')
          setError('Too many attempts. Please wait.')
          return
        }
        
        const errorMsg = data?.error || 'Verification failed'
        toast.error(errorMsg)
        setError(errorMsg)
        return
      }

      // Success
      toast.success('Email verified successfully!')
      
      // Check if user must change password on first login
      if (data.mustChangePassword) {
        sessionStorage.removeItem('portfolio_session_id')
        sessionStorage.removeItem('portfolio_temp_email')
        toast.info('Please set a new password to continue.')
        router.replace('/auth/change-password')
        return
      }

      // verification succeeded; server set session cookie. Refresh user in context and redirect.
      sessionStorage.removeItem('portfolio_session_id')
      sessionStorage.removeItem('portfolio_temp_email')
      
      const refreshedUser = await auth.refreshUser()
      if (refreshedUser) {
        const authTypes = await import('@/lib/auth-types')
        type UserRole = "admin" | "client" | "auditor" | "collaborator"
        const route = authTypes.dashboardRoutes[refreshedUser.role as UserRole]
        window.location.href = route || '/'
        return
      }

      // fallback: force reload to ensure cookie is picked up
      window.location.href = '/'
    } catch (err: any) {
      const errorMsg = err?.message || 'Verification failed. Please check your connection.'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <AuthLayout showBackButton={true} backHref="/auth/login">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Enter 6-digit
            <br />
            Code
          </h1>
          <p className="mt-3 text-muted-foreground">We have sent a verification code to your email:</p>
          <p className="font-medium text-primary">{userEmail || email || "your email"}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Inputs */}
          <div className="flex items-center justify-center gap-2">
            {code.slice(0, 3).map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-14 w-14 rounded-xl border-border bg-background text-center text-xl font-semibold"
              />
            ))}
            <span className="text-2xl text-muted-foreground">-</span>
            {code.slice(3).map((digit, index) => (
              <Input
                key={index + 3}
                ref={(el) => {
                  inputRefs.current[index + 3] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index + 3, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index + 3, e)}
                onPaste={handlePaste}
                className="h-14 w-14 rounded-xl border-border bg-background text-center text-xl font-semibold"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || isLoading}
              className="text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Resend Code'}
            </button>
            {timer > 0 && <span className="text-muted-foreground">{formatTime(timer)}</span>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={isLoading}
          >
            Verify
          </Button>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </div>
    </AuthLayout>
  )
}
