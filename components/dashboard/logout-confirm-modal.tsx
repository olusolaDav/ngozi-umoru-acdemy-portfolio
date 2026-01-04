"use client"

import React from "react"

export function LogoutConfirmModal({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white p-6">
        <h3 className="text-lg font-semibold">Confirm sign out</h3>
        <p className="mt-2 text-sm text-muted-foreground">Are you sure you want to sign out?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded border px-3 py-1">Cancel</button>
          <button onClick={onConfirm} className="rounded bg-destructive px-3 py-1 text-white">Sign out</button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal
