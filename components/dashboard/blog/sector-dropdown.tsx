"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectorDropdownProps {
  value: string[]
  onChange: (sectors: string[]) => void
  maxSelections?: number
}

const AVAILABLE_SECTORS = [
  "Law",
  "Health",
  "Education",
  "Technology",
  "Finance",
  "Oil and Gas",
  "Healthcare",
  "Telecommunications",
  "Retail",
  "Manufacturing",
  "Automotive",
  "Pharmaceuticals",
  "Other",
]

export function SectorDropdown({ value, onChange, maxSelections = 3 }: SectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggleSector = (sector: string) => {
    if (value.includes(sector)) {
      onChange(value.filter((s) => s !== sector))
    } else if (value.length < maxSelections) {
      onChange([...value, sector])
    }
  }

  const handleRemoveSector = (sector: string) => {
    onChange(value.filter((s) => s !== sector))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-2 rounded-xl border border-border bg-background text-left flex items-center justify-between hover:border-primary/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-muted-foreground">Select sectors (up to {maxSelections})</span>
          ) : (
            value.map((sector) => (
              <span
                key={sector}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {sector}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveSector(sector)
                  }}
                  className="hover:text-primary/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-2">
            {AVAILABLE_SECTORS.map((sector) => (
              <label
                key={sector}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={value.includes(sector)}
                  onChange={() => handleToggleSector(sector)}
                  disabled={!value.includes(sector) && value.length >= maxSelections}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className={cn("text-sm", !value.includes(sector) && value.length >= maxSelections && "text-muted-foreground opacity-50")}>
                  {sector}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      {value.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {value.length}/{maxSelections} sectors selected
        </p>
      )}
    </div>
  )
}
