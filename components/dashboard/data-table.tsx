"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  header: string
  className?: string
  render: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  getRowId: (item: T) => string
  onRowClick?: (item: T) => void
  className?: string
  loading?: boolean
}

export function DataTable<T>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  onRowClick,
  className,
  loading = false,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedIds.includes(getRowId(item)))
  const someSelected = data.some((item) => selectedIds.includes(getRowId(item)))

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(data.map(getRowId))
    }
  }

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange?.([...selectedIds, id])
    }
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className={cn(someSelected && !allSelected && "opacity-50")}
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0)} 
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (selectable ? 1 : 0)} 
                className="h-32 text-center text-muted-foreground"
              >
                No data found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const id = getRowId(item)
              const isSelected = selectedIds.includes(id)
              return (
                <TableRow
                  key={id}
                  className={cn("cursor-pointer transition-colors hover:bg-muted/50", isSelected && "bg-primary/5")}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
