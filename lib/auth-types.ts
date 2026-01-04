// ============================================
// AUTH TYPES AND ROLES
// ============================================

export type UserRole = "admin" | "client" | "auditor" | "collaborator"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId?: string // For clients and collaborators
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  email: string
  sector: string
  ownerId: string // The client user who owns this organization
  createdAt: Date
  updatedAt: Date
}

// Role-based permissions
export const rolePermissions = {
  admin: {
    canCreateClient: true,
    canCreateAuditor: true,
    canViewAllOrganizations: true,
    canManageSystem: true,
    canViewAllAssessments: true,
  },
  client: {
    canCreateCollaborator: true,
    canSubmitAssessments: true,
    canViewOwnOrganization: true,
    canManageBilling: true,
    canAccessResources: true,
  },
  auditor: {
    canViewAssignedOrganizations: true,
    canReviewAssessments: true,
    canCreateReports: true,
    canProvideRecommendations: true,
  },
  collaborator: {
    canEditAssessments: true,
    canViewOwnOrganization: true,
    canSaveProgress: true,
    // Cannot submit - only client can submit
  },
} as const

// Dashboard routes by role
export const dashboardRoutes: Record<UserRole, string> = {
  admin: "/admin",
  client: "/dashboard",
  auditor: "/auditor",
  collaborator: "/collaborator",
}
