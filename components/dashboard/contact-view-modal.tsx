"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  MessageSquare, 
  MailOpen, 
  Reply, 
  ExternalLink,
  Check
} from "lucide-react"

interface ContactSubmission {
  _id: string
  fullName: string
  email: string
  purpose: string
  phone?: string
  message: string
  status: "unread" | "read" | "replied"
  submittedAt: string
  createdAt: string
  readAt?: string
  repliedAt?: string
}

interface ContactViewModalProps {
  contact: ContactSubmission | null
  onClose: () => void
  onUpdateStatus: (id: string, status: "unread" | "read" | "replied") => void
  onOpenReplyComposer?: (contact: ContactSubmission) => void
}

const purposeLabels: Record<string, string> = {
  "general": "General Inquiry",
  "collaboration": "Collaboration Opportunity",
  "research": "Research Query",
  "teaching": "Teaching Inquiry",
  "speaking": "Speaking Engagement",
}

const purposeColors: Record<string, string> = {
  "general": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "collaboration": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "research": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "teaching": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "speaking": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
}

const statusColors: Record<string, string> = {
  unread: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  read: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  replied: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

export function ContactViewModal({ 
  contact, 
  onClose, 
  onUpdateStatus,
  onOpenReplyComposer 
}: ContactViewModalProps) {
  const [hasOpenedMailClient, setHasOpenedMailClient] = useState(false)

  if (!contact) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReplyOnPlatform = () => {
    if (onOpenReplyComposer) {
      onOpenReplyComposer(contact)
    }
  }

  const handleReplyViaMail = () => {
    // Open email client
    const subject = encodeURIComponent(
      `Re: ${purposeLabels[contact.purpose] || contact.purpose} - Academic Portfolio`
    )
    const body = encodeURIComponent(
      `\n\n---\nOriginal Message:\nFrom: ${contact.fullName}\nDate: ${formatDate(contact.submittedAt || contact.createdAt)}\n\n${contact.message}`
    )
    window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`, "_blank")
    
    // Show "Mark as Replied" button
    setHasOpenedMailClient(true)
  }

  const handleMarkAsReplied = () => {
    onUpdateStatus(contact._id, "replied")
    setHasOpenedMailClient(false)
  }

  return (
    <Dialog open={!!contact} onOpenChange={() => {
      setHasOpenedMailClient(false)
      onClose()
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{contact.fullName}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={purposeColors[contact.purpose] || purposeColors.general}>
                  {purposeLabels[contact.purpose] || contact.purpose}
                </Badge>
                <Badge className={statusColors[contact.status]}>
                  {contact.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <a 
                  href={`mailto:${contact.email}`} 
                  className="text-sm font-medium text-primary hover:underline break-all"
                >
                  {contact.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium">
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="hover:underline">
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Purpose</p>
                <p className="text-sm font-medium">
                  {purposeLabels[contact.purpose] || contact.purpose}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="text-sm font-medium">
                  {formatDate(contact.submittedAt || contact.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Message</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{contact.message}</p>
            </div>
          </div>

          {/* Status Timeline */}
          {(contact.readAt || contact.repliedAt) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Activity</p>
              <div className="space-y-2">
                {contact.readAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MailOpen className="h-4 w-4" />
                    <span>Read on {formatDate(contact.readAt)}</span>
                  </div>
                )}
                {contact.repliedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="h-4 w-4" />
                    <span>Replied on {formatDate(contact.repliedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {/* Reply on Platform Button */}
            {contact.status !== "replied" && onOpenReplyComposer && (
              <Button onClick={handleReplyOnPlatform} className="gap-2">
                <Reply className="h-4 w-4" />
                Reply
              </Button>
            )}
            
            {/* Reply via Mail / Mark as Replied Button */}
            {hasOpenedMailClient ? (
              <Button
                onClick={handleMarkAsReplied}
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Mark as Replied
              </Button>
            ) : (
              <Button
                variant={onOpenReplyComposer ? "outline" : "default"}
                onClick={handleReplyViaMail}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Reply via Email
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            
            {/* Mark as Unread */}
            {contact.status !== "unread" && (
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(contact._id, "unread")}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Mark as Unread
              </Button>
            )}
            
            {/* Manual Mark as Replied (if not already replied and hasn't opened mail client) */}
            {contact.status !== "replied" && !hasOpenedMailClient && (
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(contact._id, "replied")}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Mark as Replied
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
