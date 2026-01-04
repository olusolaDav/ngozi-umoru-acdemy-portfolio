import { LoginForm } from "@/components/auth/login-form"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { dashboardRoutes } from "@/lib/auth-types"
import { cookies } from "next/headers"

export const metadata = {
  title: "Login | Academic Portfolio",
  description: "Sign in to your  account",
}

export default async function LoginPage() {
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

  return <LoginForm />
}
