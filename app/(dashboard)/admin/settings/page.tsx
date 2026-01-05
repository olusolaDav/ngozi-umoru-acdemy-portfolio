"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AdminDashboardHeader } from "@/components/dashboard/admin-dashboard-header"
import { Bell, Shield, Loader2, Save, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface NotificationSettings {
  emailNotifications: boolean
  contactFormAlerts: boolean
  blogCommentAlerts: boolean
  commentReplyAlerts: boolean
  loginAlerts: boolean
  weeklyDigest: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  loginAlerts: boolean
}

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    contactFormAlerts: true,
    blogCommentAlerts: true,
    commentReplyAlerts: true,
    loginAlerts: true,
    weeklyDigest: false,
  })

  // Security settings
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
  })

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (data.ok) {
          if (data.notifications) {
            setNotifications(data.notifications)
          }
          if (data.security) {
            setSecurity(data.security)
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      })
      if (res.ok) {
        toast.success("Notification settings updated successfully")
      } else {
        toast.error("Failed to update notifications")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSecurity = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ security }),
      })
      if (res.ok) {
        toast.success("Security settings updated successfully")
      } else {
        toast.error("Failed to update security settings")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (res.ok) {
        toast.success("Password changed successfully")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to change password")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
        <AdminDashboardHeader
          title="Settings"
          description="Manage your notification and security preferences"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Settings" },
          ]}
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <AdminDashboardHeader
        title="Settings"
        description="Manage your notification and security preferences"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <div className="px-6 py-6 space-y-6">
        {/* Notification Settings */}
        <Card className="border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Contact Form Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone submits a contact form</p>
                </div>
                <Switch
                  checked={notifications.contactFormAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, contactFormAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Blog Comment Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone comments on your blog</p>
                </div>
                <Switch
                  checked={notifications.blogCommentAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, blogCommentAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Comment Reply Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone replies to a comment</p>
                </div>
                <Switch
                  checked={notifications.commentReplyAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, commentReplyAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Login Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get email alerts when you log in from a new location</p>
                </div>
                <Switch
                  checked={notifications.loginAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, loginAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Weekly Digest</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive a weekly summary of activity</p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Change */}
            <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-50">Change Password</h4>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                variant="outline"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>

            {/* Security Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Login Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone logs into your account</p>
                </div>
                <Switch
                  checked={security.loginAlerts}
                  onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Session Timeout</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Auto-logout after inactivity (minutes)</p>
                </div>
                <Input
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 30 })}
                  min={5}
                  max={120}
                  className="w-24 text-center"
                />
              </div>
            </div>

            <Button onClick={handleSaveSecurity} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
