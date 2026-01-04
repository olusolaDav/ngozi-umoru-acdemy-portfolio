"use client"

import { use, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  LayoutGrid,
  List,
  ArrowLeft,
  FileText,
  Maximize2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  User,
  Diamond,
  CheckCircle2,
} from "lucide-react"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { getUserById, mockResources, getClientResourceAccess, type Resource } from "@/lib/dashboard-data"
import { ResourceDetailsModal } from "@/components/dashboard/resources/resource-details-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EnableResourcesPageProps {
  params: Promise<{ clientId: string }>
}

export default function EnableResourcesPage({ params }: EnableResourcesPageProps) {
  const { clientId } = use(params)
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getClientResourceAccess(clientId))
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Get client data
  const client = getUserById(clientId) || {
    _id: clientId,
    name: "John Doe",
    email: "james@johndoeenterprise.org",
    role: "client" as const,
    status: "active" as const,
    companyName: "John Doe Enterprise",
    companyLogo: "/generic-company-logo.png",
    sector: "Health",
    addedSince: "4th March 2026",
    phone: "(234) 813-6556-0123",
    address: "No 1, Mowel Mall, Floor 3",
    cityState: "Ikeja, Lagos",
    title: "Internal Auditor",
    about:
      "Our comprehensive audit evaluates how your organization collects, processes, stores, and protects personal data...",
  }

  // Filter resources
  const filteredResources = useMemo(() => {
    if (!search) return mockResources
    const searchLower = search.toLowerCase()
    return mockResources.filter(
      (r) => r.title.toLowerCase().includes(searchLower) || r.description.toLowerCase().includes(searchLower),
    )
  }, [search])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredResources.map((r) => r._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleEnableClick = () => {
    if (selectedIds.length === 0) return
    setShowConfirmModal(true)
  }

  const handleConfirmEnable = () => {
    // In real app, this would call an API to update client resource access
    console.log("Enable resources for client:", clientId, "Resources:", selectedIds)
    setShowConfirmModal(false)
    setShowSuccessModal(true)
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    router.back()
  }

  const isAllSelected = filteredResources.length > 0 && selectedIds.length === filteredResources.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Enable Resources</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>

          <Button
            onClick={handleEnableClick}
            disabled={selectedIds.length === 0}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          >
            <Diamond className="h-4 w-4" />
            Enable Resources
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Left Panel - Client Info */}
        <div className="space-y-6">
          {/* Company Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <UserAvatar name={client.companyName} image={client.companyLogo} isCompanyLogo size="xl" />
                <div>
                  <h2 className="text-xl font-bold">{client.companyName}</h2>
                  <p className="text-sm text-muted-foreground">{client.sector} Sector</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 font-semibold">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{client.about}</p>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Company Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email:</p>
                    <p className="text-sm font-medium text-primary">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone:</p>
                    <p className="text-sm font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Added since:</p>
                    <p className="text-sm font-medium">{client.addedSince}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address:</p>
                    <p className="text-sm font-medium">{client.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">City State:</p>
                    <p className="text-sm font-medium">{client.cityState}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Representative */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Company Representative Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name:</p>
                    <p className="text-sm font-medium">{client.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Title:</p>
                    <p className="text-sm font-medium">{client.title}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Resources */}
        <div className="space-y-4">
          {/* Select All & Back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
              <span className="text-sm font-medium">Select All</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredResources.map((resource) => (
                  <Card
                    key={resource._id}
                    className={`relative overflow-hidden transition-all ${
                      selectedIds.includes(resource._id) ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      {/* Checkbox */}
                      <div className="absolute left-3 top-3 z-10">
                        <Checkbox
                          checked={selectedIds.includes(resource._id)}
                          onCheckedChange={(checked) => handleSelect(resource._id, checked as boolean)}
                        />
                      </div>

                      {/* Folder Image */}
                      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <div className="relative h-20 w-24">
                          <svg viewBox="0 0 100 80" className="h-full w-full">
                            <path
                              d="M0 15 C0 10 5 5 10 5 L35 5 L45 15 L90 15 C95 15 100 20 100 25 L100 70 C100 75 95 80 90 80 L10 80 C5 80 0 75 0 70 Z"
                              fill="#E2E8F0"
                              stroke="#CBD5E1"
                              strokeWidth="1"
                            />
                            <path d="M5 25 L95 25 L95 70 C95 73 93 75 90 75 L10 75 C7 75 5 73 5 70 Z" fill="#F1F5F9" />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <p className="mb-4 line-clamp-3 text-sm font-medium leading-relaxed">{resource.title}</p>
                        <Button
                          onClick={() => setSelectedResource(resource)}
                          className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                        >
                          <Maximize2 className="h-4 w-4" />
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-2">
                {filteredResources.map((resource) => (
                  <div
                    key={resource._id}
                    className={`flex items-center gap-4 rounded-lg border bg-card p-4 transition-all ${
                      selectedIds.includes(resource._id) ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Checkbox
                      checked={selectedIds.includes(resource._id)}
                      onCheckedChange={(checked) => handleSelect(resource._id, checked as boolean)}
                    />

                    {/* Document Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>

                    {/* Title */}
                    <p className="flex-1 text-sm">{resource.title}</p>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedResource(resource)}
                      className="shrink-0"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredResources.length} resources(s) of {mockResources.length}
            </p>
          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      <ResourceDetailsModal resource={selectedResource} onClose={() => setSelectedResource(null)} showDownload />

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Enable Resources</DialogTitle>
            <DialogDescription>
              You are about to enable {selectedIds.length} resource(s) for{" "}
              <span className="font-semibold text-foreground">{client.companyName}</span>. This will allow them to
              access and download the selected documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEnable}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-center">Resources Enabled Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                {selectedIds.length} resource(s) have been enabled for{" "}
                <span className="font-semibold text-foreground">{client.companyName}</span>. They can now access and
                download these documents.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleSuccessClose}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
