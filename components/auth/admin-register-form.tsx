"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "./auth-layout"

export function AdminRegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const router = useRouter()

  // Check if admin already exists
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/auth/admin-register")
        const data = await res.json().catch(() => ({}))
        setAdminExists(data?.adminExists)
      } catch (err) {
        setAdminExists(true) // Default to true for safety
      }
    })()
  }, [])

  if (adminExists === null) {
    return (
      <AuthLayout showBackButton={false}>
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AuthLayout>
    )
  }

  if (adminExists) {
    return (
      <AuthLayout showBackButton={true} backHref="/auth/login">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Maximum Admins Registered</h1>
            <p className="mt-2 text-muted-foreground">The maximum number of admin accounts (2) has been reached. Please login to continue.</p>
          </div>
          <Button
            onClick={() => router.push("/auth/login")}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
          >
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          return
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters")
          return
        }
        if (!name.trim()) {
          setError("Name is required")
          return
        }

        const res = await fetch("/api/auth/admin-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password })
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data?.error || "Registration failed")
          return
        }

        // Success: redirect to login
        router.push("/auth/login")
      } catch (err: any) {
        setError(err?.message || "Registration failed")
      } finally {
        setIsLoading(false)
      }
    })()
  }

  return (
    <AuthLayout showBackButton={true} backHref="/">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Create Admin Account</h1>
          <p className="mt-2 text-muted-foreground">Set up your admin account to manage the system</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4"
              required
            />
          </div>

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

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Admin Account"}
          </Button>

          {error && <p className="text-sm text-destructive mt-2">{error}</p>}

          {/* Link to Login */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an admin account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
