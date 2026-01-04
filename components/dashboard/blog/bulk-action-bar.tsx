"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Trash2 } from "lucide-react"

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onDeleteAll: () => void
  itemType?: "comment" | "post"
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDeleteAll,
  itemType = "comment",
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  const label = itemType === "comment" ? "Comments" : "Posts"

  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-800 px-6 py-3 shadow-lg">
      <div className="flex items-center gap-2 text-white">
        <MessageSquare className="h-4 w-4" />
        <span className="font-medium">
          {selectedCount} {label} selected
        </span>
      </div>
      <button onClick={onClearSelection} className="text-sm text-cyan-400 hover:text-cyan-300">
        Clear Selection
      </button>
      <Button variant="destructive" size="sm" onClick={onDeleteAll} className="gap-2 rounded-full">
        <Trash2 className="h-4 w-4" />
        Delete All
      </Button>
    </div>
  )
}
