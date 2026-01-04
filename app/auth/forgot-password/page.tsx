import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { dashboardRoutes } from "@/lib/auth-types"
import { cookies } from "next/headers"

export const metadata = {
  title: "Forgot Password | Academic Portfolio",
  description: "Reset your account password",
}

export default async function ForgotPasswordPage() {
  // Check if user is already authenticated
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (session) {
    const payload = verifySession(session)
    if (payload && (payload as any).userId) {
      // User is authenticated, redirect to their dashboard
      const role = (payload as any).role || "admin"
      const dashboardRoute = dashboardRoutes[role as keyof typeof dashboardRoutes] || "/dashboard"
      redirect(dashboardRoute)
    }
  }

  return <ForgotPasswordForm />
}
