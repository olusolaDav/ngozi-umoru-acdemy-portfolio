"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "./auth-layout"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface CollaboratorInviteFormProps {
  onSuccess?: () => void
}

export function CollaboratorInviteForm({ onSuccess }: CollaboratorInviteFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
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
      const res = await fetch("/api/collaborator/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Failed to invite collaborator")
      toast.success(`Collaborator ${name} invited successfully!`, {
        description: `Invitation email sent to ${email}. They will receive login credentials shortly.`,
      })
      setName("")
      setEmail("")
      onSuccess?.()
      setTimeout(() => {
        router.push("/dashboard/collaborators")
      }, 1500)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to invite collaborator"
      setError(errorMessage)
      toast.error("Failed to invite collaborator", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout showBackButton={true} backHref="/dashboard/collaborators">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Collaborator</h1>
          <p className="text-muted-foreground">Invite a team member to collaborate on your projects</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-border bg-background px-4"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#00afef] to-[#4169e1] text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
