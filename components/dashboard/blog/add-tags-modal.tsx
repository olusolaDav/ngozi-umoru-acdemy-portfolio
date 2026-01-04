"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddTagsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTags?: string[]
  onSave: (tags: string[]) => void
}

export function AddTagsModal({ open, onOpenChange, initialTags = [], onSave }: AddTagsModalProps) {
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "))

  const handleApply = () => {
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 5) // Max 5 tags
    onSave(tags)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Add or change tags (up to 5) so readers
            <br />
            know what your story is about
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Input
            placeholder="Separate topics by Commas"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="h-12 rounded-xl border-muted-foreground/20"
          />

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-32 rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="w-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
