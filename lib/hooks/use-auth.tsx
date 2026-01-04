"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { type User, type UserRole, dashboardRoutes } from "@/lib/auth-types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<User | null>
  getDashboardRoute: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for demonstration - replace with real auth later
const MOCK_USER: User | null = null // Set to a user object to test logged-in state

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking auth state
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          if (data?.user) setUser(data.user)
        }
      } catch (err) {
        // ignore
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || "login failed")
    }
    const data = await res.json()
    // If requires verification, return the sessionId so the UI can prompt for code
    if (data?.requiresVerification) {
      return { requiresVerification: true, sessionId: data.sessionId }
    }
    return { requiresVerification: false }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (data?.user) {
          setUser(data.user)
          return data.user
        }
      }
    } catch (err) {
      // ignore
    }
    setUser(null)
    return null
  }

  const getDashboardRoute = () => {
    if (!user) return "/auth/login"
    return dashboardRoutes[user.role]
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, refreshUser, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
