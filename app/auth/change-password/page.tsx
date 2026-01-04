import { ChangePasswordForm } from "@/components/auth/change-password-form"
import { Suspense } from "react"

export const metadata = {
  title: "Change Password | Academic Portfolio",
  description: "Create a new password for your Accuvice account",
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#00afef] border-t-transparent rounded-full" /></div>}>
      <ChangePasswordForm />
    </Suspense>
  )
}
