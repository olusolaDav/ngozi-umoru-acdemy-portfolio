"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthLayout } from "./auth-layout"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const sectors = [
  "Banking & Finance",
  "Healthcare",
  "Oil & Gas",
  "Construction",
  "Education",
  "Government",
  "Technology",
  "Retail",
  "Manufacturing",
  "Non-Profit",
  "Other",
]

interface ClientRegisterFormProps {
  onSuccess?: () => void
}

export function ClientRegisterForm({ onSuccess }: ClientRegisterFormProps) {
  const [companyName, setCompanyName] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [sector, setSector] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          email: companyEmail,
          companyName: companyName,
          sector: sector,
          role: "client"
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to add client")
      toast.success(`Client ${companyName} added successfully!`, {
        description: `Invitation email sent to ${companyEmail}. They will receive login credentials shortly.`,
      })
      setCompanyName("")
      setCompanyEmail("")
      setSector("")
      onSuccess?.()
      setTimeout(() => router.push('/admin/users'), 1500)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add client"
      setError(errorMessage)
      toast.error("Failed to add client", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout showBackButton={true} backHref="/admin/users/register">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Client</h1>
          <p className="text-muted-foreground">Invite a new client organization to the platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              type="email"
              placeholder="Company Email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Select value={sector} onValueChange={setSector} disabled={loading}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background px-4">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Adding Client..." : "Add Client"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
