"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Search, Check, UserCheck } from "lucide-react"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { toast } from "sonner"

interface Auditor {
  _id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  companyName?: string
  createdAt: string
}

interface AssignAuditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  currentAuditor?: {
    _id: string
    name: string
    email: string
    avatar?: string
  } | null
  onAssigned?: (auditor: Auditor) => void
}

export function AssignAuditorModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  currentAuditor,
  onAssigned
}: AssignAuditorModalProps) {
  const [auditors, setAuditors] = useState<Auditor[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAuditorId, setSelectedAuditorId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAuditors()
      // Pre-select current auditor if exists
      if (currentAuditor?._id) {
        setSelectedAuditorId(currentAuditor._id)
      }
    }
  }, [open, currentAuditor])

  const fetchAuditors = async () => {
    setLoading(true)
    try {
      // Fetch users with auditor role from the main users endpoint
      const response = await fetch(`/api/admin/users?role=auditor&limit=100`)
      
      console.log("[AssignAuditorModal] Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch auditors")
      }

      const data = await response.json()
      console.log("[AssignAuditorModal] Response data:", data)
      
      // The users endpoint returns { users: [...], pagination: {...} }
      if (!data.users || !Array.isArray(data.users)) {
        console.error("[AssignAuditorModal] Invalid auditors response:", data)
        throw new Error("Invalid response format from server")
      }
      
      console.log("[AssignAuditorModal] Found auditors:", data.users.length)
      
      // Map to auditor format - filter only active auditors
      const auditorList: Auditor[] = data.users
        .filter((user: any) => user.status === "active")
        .map((user: any) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          companyName: user.companyName,
          createdAt: user.createdAt
        }))
      
      console.log("[AssignAuditorModal] Active auditors:", auditorList.length)
      setAuditors(auditorList)
    } catch (error: any) {
      console.error("[AssignAuditorModal] Error fetching auditors:", error)
      toast.error("Failed to load auditors", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAuditors = auditors.filter(auditor =>
    auditor.name.toLowerCase().includes(search.toLowerCase()) ||
    auditor.email.toLowerCase().includes(search.toLowerCase())
  )

  const selectedAuditor = auditors.find(a => a._id === selectedAuditorId)

  const handleAssign = async () => {
    if (!selectedAuditorId) return

    setAssignLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${clientId}/assign-auditor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditorId: selectedAuditorId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to assign auditor")
      }
      
      toast.success("Auditor assigned successfully", {
        description: `${selectedAuditor?.name} has been assigned to ${clientName}`
      })

      if (onAssigned && selectedAuditor) {
        onAssigned(selectedAuditor)
      }

      setShowConfirmation(false)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error assigning auditor:", error)
      toast.error("Failed to assign auditor", {
        description: error.message
      })
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-cyan-500" />
              Assign Auditor to {clientName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select an auditor to assign to this client.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
            {/* Search */}
            <div className="relative py-4 border-b">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground mt-2" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Auditors List */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAuditors.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {search ? "No auditors found matching your search" : "No auditors available"}
                </div>
              ) : (
                filteredAuditors.map(auditor => {
                  const isSelected = selectedAuditorId === auditor._id
                  const isCurrent = currentAuditor?._id === auditor._id
                  
                  return (
                    <button
                      key={auditor._id}
                      onClick={() => setSelectedAuditorId(auditor._id)}
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <UserAvatar name={auditor.name} image={auditor.avatar} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{auditor.name}</p>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{auditor.email}</p>
                            {auditor.companyName && (
                              <p className="text-xs text-muted-foreground mt-1">{auditor.companyName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected 
                            ? "bg-cyan-500 text-white" 
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Current Auditor Info */}
            {currentAuditor && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Currently assigned:</p>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <UserAvatar name={currentAuditor.name} image={currentAuditor.avatar} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{currentAuditor.name}</p>
                    <p className="text-xs text-muted-foreground">{currentAuditor.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                {filteredAuditors.length} auditor{filteredAuditors.length !== 1 ? 's' : ''} available
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!selectedAuditorId || selectedAuditorId === currentAuditor?._id}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                >
                  Assign Auditor
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              {currentAuditor ? (
                <>
                  Replace <span className="font-semibold text-foreground">{currentAuditor.name}</span> with{" "}
                  <span className="font-semibold text-foreground">{selectedAuditor?.name}</span> as the auditor for{" "}
                  <span className="font-semibold text-foreground">{clientName}</span>?
                </>
              ) : (
                <>
                  Assign <span className="font-semibold text-foreground">{selectedAuditor?.name}</span> as the auditor for{" "}
                  <span className="font-semibold text-foreground">{clientName}</span>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={assignLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAssign}
              disabled={assignLoading}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {assignLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
