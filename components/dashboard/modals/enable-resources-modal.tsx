"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, FileText, LayoutGrid, List, Check, X, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface Resource {
  _id: string
  title: string
  description: string
  category: string
  file: {
    url: string
    originalName: string
    format: string
    thumbnail?: string
  }
  uploadedAt: string
  enabled: boolean
}

interface EnableResourcesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  onResourcesEnabled?: () => void
}

export function EnableResourcesModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  onResourcesEnabled
}: EnableResourcesModalProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const [bulkToggling, setBulkToggling] = useState(false)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  useEffect(() => {
    if (open) {
      fetchResources()
    }
  }, [open, clientId])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${clientId}/enable-resources`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch resources")
      }

      const data = await response.json()
      
      if (!data.resources || !Array.isArray(data.resources)) {
        throw new Error("Invalid response format from server")
      }
      
      setResources(data.resources)
    } catch (error: any) {
      toast.error("Failed to load resources", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(search.toLowerCase()) ||
    resource.description.toLowerCase().includes(search.toLowerCase())
  )

  const enabledCount = filteredResources.filter(r => r.enabled).length
  const allEnabled = filteredResources.length > 0 && enabledCount === filteredResources.length

  const toggleResource = useCallback(async (resourceId: string, currentlyEnabled: boolean) => {
    setTogglingIds(prev => new Set(prev).add(resourceId))
    
    try {
      const currentlyEnabledIds = resources.filter(r => r.enabled).map(r => r._id)
      
      let newEnabledIds: string[]
      if (currentlyEnabled) {
        newEnabledIds = currentlyEnabledIds.filter(id => id !== resourceId)
      } else {
        newEnabledIds = [...currentlyEnabledIds, resourceId]
      }

      const response = await fetch(`/api/admin/users/${clientId}/enable-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceIds: newEnabledIds })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update resource")
      }

      setResources(prev => prev.map(r => 
        r._id === resourceId ? { ...r, enabled: !currentlyEnabled } : r
      ))

      const action = currentlyEnabled ? "disabled" : "enabled"
      const resourceName = resources.find(r => r._id === resourceId)?.title || "Resource"
      toast.success(`Resource ${action}`, {
        description: `${resourceName} has been ${action} for ${clientName}`
      })

      if (onResourcesEnabled) onResourcesEnabled()
    } catch (error: any) {
      toast.error("Failed to update resource", { description: error.message })
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(resourceId)
        return next
      })
    }
  }, [resources, clientId, clientName, onResourcesEnabled])

  const toggleAll = async () => {
    setBulkToggling(true)
    
    try {
      const filteredIds = new Set(filteredResources.map(r => r._id))
      const otherEnabledIds = resources
        .filter(r => !filteredIds.has(r._id) && r.enabled)
        .map(r => r._id)
      
      let newEnabledIds: string[]
      
      if (allEnabled) {
        newEnabledIds = otherEnabledIds
      } else {
        newEnabledIds = [...otherEnabledIds, ...filteredResources.map(r => r._id)]
      }

      const response = await fetch(`/api/admin/users/${clientId}/enable-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceIds: newEnabledIds })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update resources")
      }

      const shouldEnable = !allEnabled
      setResources(prev => prev.map(r => 
        filteredIds.has(r._id) ? { ...r, enabled: shouldEnable } : r
      ))

      const action = allEnabled ? "disabled" : "enabled"
      toast.success(`All resources ${action}`, {
        description: `${filteredResources.length} resource(s) have been ${action} for ${clientName}`
      })

      if (onResourcesEnabled) onResourcesEnabled()
    } catch (error: any) {
      toast.error("Failed to update resources", { description: error.message })
    } finally {
      setBulkToggling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Manage Resources for {clientName}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enable or disable resources for this client. Changes are saved immediately.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 border-b">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={allEnabled ? "destructive" : "default"}
                onClick={toggleAll}
                disabled={bulkToggling || loading || filteredResources.length === 0}
                className="min-w-[140px]"
              >
                {bulkToggling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : allEnabled ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {allEnabled ? "Disable All" : "Enable All"}
              </Button>

              <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {search ? "No resources found matching your search" : "No resources available"}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map(resource => {
                  const isToggling = togglingIds.has(resource._id)
                  return (
                    <Card
                      key={resource._id}
                      className={`relative overflow-hidden transition-all ${
                        resource.enabled
                          ? "border-cyan-500 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/20 dark:to-slate-950"
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            resource.enabled
                              ? "bg-cyan-500 text-white"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              resource.enabled ? "bg-white" : "bg-gray-500"
                            }`} />
                            {resource.enabled ? "Enabled" : "Disabled"}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                              {resource.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {resource.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pb-3 border-b">
                          <span className="font-medium">
                            {resource.file.format ? resource.file.format.toUpperCase() : 'PDF'}
                          </span>
                          <span>•</span>
                          <span className="truncate">{resource.file.originalName}</span>
                        </div>

                        <Button
                          size="sm"
                          variant={resource.enabled ? "destructive" : "default"}
                          className="w-full"
                          onClick={() => toggleResource(resource._id, resource.enabled)}
                          disabled={isToggling}
                        >
                          {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : resource.enabled ? (
                            <X className="h-4 w-4 mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          {isToggling ? "Updating..." : resource.enabled ? "Disable" : "Enable"}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResources.map(resource => {
                  const isToggling = togglingIds.has(resource._id)
                  return (
                    <div
                      key={resource._id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        resource.enabled
                          ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20"
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-red-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{resource.title}</h4>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            resource.enabled
                              ? "bg-cyan-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}>
                            <div className={`h-1 w-1 rounded-full ${
                              resource.enabled ? "bg-white" : "bg-gray-500"
                            }`} />
                            {resource.enabled ? "Enabled" : "Disabled"}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">
                            {resource.file.format ? resource.file.format.toUpperCase() : 'PDF'}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{resource.file.originalName}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={resource.enabled ? "destructive" : "default"}
                        onClick={() => toggleResource(resource._id, resource.enabled)}
                        disabled={isToggling}
                        className="min-w-[100px]"
                      >
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : resource.enabled ? (
                          <X className="h-4 w-4 mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {isToggling ? "..." : resource.enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{enabledCount}</span> of{" "}
              <span className="font-medium text-foreground">{resources.length}</span> resources enabled
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
