"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface MonthYearPickerProps {
  value?: string // Format: "YYYY-MM" or "present"
  onChange: (value: string) => void
  placeholder?: string
  allowPresent?: boolean
  className?: string
  disabled?: boolean
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select date",
  allowPresent = false,
  className,
  disabled = false,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const currentYear = new Date().getFullYear()
  const [viewYear, setViewYear] = React.useState(() => {
    if (value && value !== "present") {
      const [year] = value.split("-")
      return parseInt(year, 10)
    }
    return currentYear
  })

  const isPresent = value === "present"
  const selectedMonth = value && value !== "present" ? parseInt(value.split("-")[1], 10) - 1 : null
  const selectedYear = value && value !== "present" ? parseInt(value.split("-")[0], 10) : null

  const handleMonthSelect = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, "0")
    onChange(`${viewYear}-${month}`)
    setOpen(false)
  }

  const handlePresentChange = (checked: boolean) => {
    if (checked) {
      onChange("present")
      setOpen(false)
    } else {
      onChange("")
    }
  }

  const formatDisplayValue = () => {
    if (isPresent) return "Present"
    if (!value) return placeholder
    if (selectedMonth !== null && selectedYear !== null) {
      return `${MONTHS[selectedMonth]} ${selectedYear}`
    }
    return placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Present checkbox */}
          {allowPresent && (
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="present"
                checked={isPresent}
                onCheckedChange={handlePresentChange}
              />
              <Label htmlFor="present" className="text-sm font-medium cursor-pointer">
                Present (Current position)
              </Label>
            </div>
          )}

          {/* Year navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewYear(viewYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">{viewYear}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewYear(viewYear + 1)}
              disabled={viewYear >= currentYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {SHORT_MONTHS.map((month, index) => {
              const isFuture = viewYear === currentYear && index > new Date().getMonth()
              const isSelected = selectedYear === viewYear && selectedMonth === index

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9",
                    isSelected && "bg-primary text-primary-foreground",
                    isFuture && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isFuture && handleMonthSelect(index)}
                  disabled={isFuture || isPresent}
                >
                  {month}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Helper function to format period for display
export function formatPeriod(startDate?: string, endDate?: string): string {
  if (!startDate) return ""
  
  const formatDate = (date: string) => {
    if (date === "present") return "Present"
    const [year, month] = date.split("-")
    const monthIndex = parseInt(month, 10) - 1
    return `${MONTHS[monthIndex]} ${year}`
  }
  
  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : ""
  
  if (!end) return start
  return `${start} - ${end}`
}

// Helper function to parse date string for sorting
export function parseDateForSort(dateStr?: string): number {
  if (!dateStr) return 0
  if (dateStr === "present") return Date.now()
  
  const [year, month] = dateStr.split("-")
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1).getTime()
}
