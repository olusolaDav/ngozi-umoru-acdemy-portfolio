"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Minimize2, Maximize2, Send, Loader2 } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { toast } from "sonner"

interface ContactSubmission {
  _id: string
  fullName: string
  email: string
  purpose: string
  message: string
}

interface ReplyComposerProps {
  contact: ContactSubmission
  onClose: () => void
  onSent: () => void
}

const purposeLabels: Record<string, string> = {
  "general": "General Inquiry",
  "collaboration": "Collaboration Opportunity",
  "research": "Research Query",
  "teaching": "Teaching Inquiry",
  "speaking": "Speaking Engagement",
}

export function ReplyComposer({ contact, onClose, onSent }: ReplyComposerProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [subject, setSubject] = useState(
    `Re: ${purposeLabels[contact.purpose] || contact.purpose} - Academic Portfolio`
  )
  const [content, setContent] = useState("")

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error("Please write a message before sending")
      return
    }

    setIsSending(true)

    try {
      const response = await fetch(`/api/admin/contacts/${contact._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          recipientEmail: contact.email,
          recipientName: contact.fullName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send reply")
      }

      toast.success("Reply sent successfully!")
      onSent()
      onClose()
    } catch (error: any) {
      console.error("Failed to send reply:", error)
      toast.error(error.message || "Failed to send reply")
    } finally {
      setIsSending(false)
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 z-50">
        <div
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-t-lg cursor-pointer shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <span className="text-sm font-medium truncate max-w-[200px]">
            Reply to {contact.fullName}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed z-50 bg-card border rounded-t-lg shadow-2xl flex flex-col ${
        isMaximized
          ? "inset-4 rounded-lg"
          : "bottom-0 right-4 w-[500px] max-h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b rounded-t-lg">
        <span className="text-sm font-medium truncate">Reply to {contact.fullName}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* To Field */}
      <div className="px-4 py-2 border-b flex items-center gap-2">
        <span className="text-sm text-muted-foreground">To:</span>
        <span className="text-sm font-medium">{contact.email}</span>
      </div>

      {/* Subject Field */}
      <div className="px-4 py-2 border-b">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Subject"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your reply..."
          minHeight={isMaximized ? "300px" : "150px"}
        />

        {/* Original Message */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Original Message:</p>
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p className="font-medium text-foreground mb-1">{contact.fullName} wrote:</p>
            <p className="whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSending}
        >
          Discard
        </Button>
        <Button
          onClick={handleSend}
          disabled={isSending || !content.trim()}
          className="gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
