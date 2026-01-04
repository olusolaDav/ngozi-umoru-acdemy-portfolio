// ============================================
// DASHBOARD MOCK DATA - Aligned with MongoDB structure
// ============================================

export type UserStatus = "active" | "inactive"
export type UserRole = "admin" | "client" | "auditor" | "collaborator"
export type ReviewStatus = "reviewed" | "no_review" | "flagged" | "cleared"
export type InvoiceStatus = "draft" | "sent" | "paid" | "deposit_paid" | "full_paid"


export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  discount: number
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  newClientEmail?: string
  newClientName?: string
  subject: string
  dueDate: string
  createdDate: string
  currency: string
  items: InvoiceItem[]
  subtotal: number
  vat: number
  total: number
  invoiceType: "statutory" | "professional"
  status: InvoiceStatus
  depositEnabled: boolean
  depositAmount?: number
  balanceAmount?: number
}


export interface DashboardUser {
  _id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  companyName: string
  companyLogo?: string
  avatar?: string
  sector?: string
  progress?: number // Only for clients
  addedSince: string
  phone?: string
  address?: string
  cityState?: string
  title?: string // Job title
  about?: string
  parentClientId?: string // For collaborators - links to client
}

export interface Collaborator {
  _id: string
  name: string
  email: string
  avatar?: string
  jobTitle: string
  addedSince: string
  clientId: string
}

export interface FormSubmission {
  _id: string
  formName: string
  companyName: string
  companyLogo?: string
  sector: string
  dateSubmitted: string
  timeSubmitted: string
  reviewStatus: ReviewStatus
  auditorId?: string
  clientId: string
}

// Sectors list
export const sectors = [
  "Agriculture",
  "Construction",
  "Finance",
  "Services",
  "Finance and Insurance",
  "Mining",
  "Healthcare",
  "Renewable Energy",
  "Entertainment",
  "Manufacturing",
  "Power",
  "Oil and Gas",
  "Education and Training",
  "Logistics",
  "Tourism",
  "Consumer Product",
  "Transport",
  "Information and Communication",
  "Tech",
  "Others",
] as const

export type Sector = (typeof sectors)[number]

// Filter options
export const filterOptions = [
  { value: "all", label: "All Users" },
  { value: "admin", label: "Admin" },
  { value: "auditor", label: "Auditor" },
  { value: "client", label: "Client" },
  { value: "collaborator", label: "Collaborator" },
  { value: "active", label: "Active Users" },
  { value: "inactive", label: "Inactive Users" },
] as const

// Sort options
export const sortOptions = [
  { value: "newest", label: "Joined Since (Newest first)" },
  { value: "oldest", label: "Joined Since (Oldest first)" },
] as const

// Company logos (using placeholder patterns)
const companyLogos = [
  "/tech-company-logo-abstract.jpg",
  "/healthcare-company-logo.png",
  "/finance-company-logo.png",
  "/energy-company-logo-green.jpg",
  "/education-company-logo.png",
]

// Mock Users Data
export const mockUsers: DashboardUser[] = [
  {
    _id: "usr_001",
    name: "John Doe",
    email: "james@johndoeenterprise.org",
    role: "client",
    status: "active",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[0],
    sector: "Tech",
    progress: 51,
    addedSince: "5 Months ago",
    phone: "(234) 813-6556-0123",
    address: "No 1, Mowel Mall, Floor 3",
    cityState: "Ikeja, Lagos",
    about:
      "Our comprehensive audit evaluates how your organization collects, processes, stores, and protects personal data...",
    title: "Internal Auditor",
  },
  {
    _id: "usr_002",
    name: "Maria Jones",
    email: "mariajones@gmail.com",
    role: "auditor",
    status: "active",
    companyName: "Academic Portfolio",
    avatar: "/professional-woman-avatar.png",
    addedSince: "6 Months ago",
    phone: "(234) 813-6556-0123",
    address: "No 1, Mowel Mall, Floor 3",
    cityState: "Ikeja, Lagos",
    title: "External Auditor",
    about:
      "Our comprehensive audit evaluates how your organization collects, processes, stores, and protects personal data...",
  },
  {
    _id: "usr_003",
    name: "Mary Loafers",
    email: "marylofers@gmail.com",
    role: "admin",
    status: "active",
    companyName: "Mary Loafers Ventures",
    avatar: "/professional-woman-avatar-brunette.jpg",
    addedSince: "1 Months ago",
  },
  {
    _id: "usr_004",
    name: "Ella Stones",
    email: "ella.stones@johndoeenterprise.org",
    role: "collaborator",
    status: "active",
    companyName: "John Doe Enterprise",
    avatar: "/young-professional-woman-avatar.png",
    addedSince: "5 Months ago",
    title: "Chief Accountant",
    parentClientId: "usr_001",
  },
  {
    _id: "usr_005",
    name: "John Doe",
    email: "james@johndoeenterprise.org",
    role: "client",
    status: "active",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[1],
    sector: "Health",
    progress: 51,
    addedSince: "5 Months ago",
    phone: "(234) 813-6556-0123",
    address: "No 1, Mowel Mall, Floor 3",
    cityState: "Ikeja, Lagos",
    about:
      "Our comprehensive audit evaluates how your organization collects, processes, stores, and protects personal data...",
    title: "Internal Auditor",
  },
  {
    _id: "usr_006",
    name: "Maria Jones",
    email: "mariajones@gmail.com",
    role: "auditor",
    status: "inactive",
    companyName: "Maria Jones Limited",
    avatar: "/professional-woman-smiling-avatar.png",
    addedSince: "6 Months ago",
    phone: "(234) 813-6556-0123",
    title: "Senior Auditor",
  },
  {
    _id: "usr_007",
    name: "Mary Loafers",
    email: "marylofers@gmail.com",
    role: "auditor",
    status: "active",
    companyName: "Mary Loafers Ventures",
    avatar: "/professional-woman-glasses-avatar.jpg",
    addedSince: "1 Months ago",
    title: "Junior Auditor",
  },
  {
    _id: "usr_008",
    name: "John Doe",
    email: "james@johndoeenterprise.org",
    role: "client",
    status: "inactive",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[2],
    sector: "Health",
    progress: 51,
    addedSince: "5 Months ago",
    phone: "(234) 813-6556-0123",
    address: "No 1, Mowel Mall, Floor 3",
    cityState: "Ikeja, Lagos",
  },
  {
    _id: "usr_009",
    name: "John Doe",
    email: "james@johndoeenterprise.org",
    role: "client",
    status: "active",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[3],
    sector: "Health",
    progress: 51,
    addedSince: "5 Months ago",
    phone: "(234) 813-6556-0123",
  },
  {
    _id: "usr_010",
    name: "Maria Jones",
    email: "mariajones@gmail.com",
    role: "admin",
    status: "active",
    companyName: "Academic Portfolio",
    avatar: "/professional-woman-corporate-avatar.jpg",
    addedSince: "6 Months ago",
  },
  {
    _id: "usr_011",
    name: "Mary Loafers",
    email: "marylofers@gmail.com",
    role: "collaborator",
    status: "active",
    companyName: "Mary Loafers Ventures",
    avatar: "/professional-woman-avatar.png",
    addedSince: "1 Months ago",
    title: "Finance Manager",
    parentClientId: "usr_005",
  },
  {
    _id: "usr_012",
    name: "John Doe",
    email: "james@johndoeenterprise.org",
    role: "client",
    status: "active",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[4],
    sector: "Tech",
    progress: 51,
    addedSince: "5 Months ago",
    phone: "(234) 813-6556-0123",
    address: "No 1, Mowel Mall, Floor 3",
    cityState: "Ikeja, Lagos",
  },
]

// Mock Collaborators for a specific client
export const mockCollaborators: Collaborator[] = [
  {
    _id: "col_001",
    name: "Ella Stones",
    email: "ella@johndoeenterprise.org",
    avatar: "/professional-woman-headshot.png",
    jobTitle: "Chief Accountant",
    addedSince: "5 Months ago",
    clientId: "usr_001",
  },
  {
    _id: "col_002",
    name: "Ella Stones",
    email: "ella2@johndoeenterprise.org",
    avatar: "/business-woman-headshot.png",
    jobTitle: "Chief Accountant",
    addedSince: "5 Months ago",
    clientId: "usr_001",
  },
  {
    _id: "col_003",
    name: "Ella Stones",
    email: "ella3@johndoeenterprise.org",
    avatar: "/professional-woman-portrait.png",
    jobTitle: "Chief Accountant",
    addedSince: "5 Months ago",
    clientId: "usr_001",
  },
  {
    _id: "col_004",
    name: "Ella Stones",
    email: "ella4@johndoeenterprise.org",
    avatar: "/professional-businesswoman-headshot.png",
    jobTitle: "Chief Accountant",
    addedSince: "5 Months ago",
    clientId: "usr_001",
  },
]

// Resource types and interfaces
export interface Resource {
  _id: string
  title: string
  description: string
  fileUrl: string
  fileType: "pdf" | "docx" | "doc"
  fileSize: string
  uploadedAt: string
  uploadedBy: string
}

export interface ClientResourceAccess {
  clientId: string
  resourceIds: string[]
}


// Mock Form Submissions
export const mockFormSubmissions: FormSubmission[] = [
  {
    _id: "form_001",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[0],
    sector: "Education",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "reviewed",
    clientId: "usr_001",
    auditorId: "usr_002",
  },
  {
    _id: "form_002",
    formName: "Data Protection Officer's Form (DPO Assessment)",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[1],
    sector: "Tech",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "no_review",
    clientId: "usr_001",
    auditorId: "usr_002",
  },
  {
    _id: "form_003",
    formName: "Compliance and Audit Form",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[2],
    sector: "Agriculture",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "flagged",
    clientId: "usr_001",
    auditorId: "usr_002",
  },
  {
    _id: "form_004",
    formName: "Newly Added Form",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[3],
    sector: "Oil and Gas",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "cleared",
    clientId: "usr_001",
    auditorId: "usr_002",
  },
  {
    _id: "form_005",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[0],
    sector: "Education",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "reviewed",
    clientId: "usr_005",
    auditorId: "usr_002",
  },
  {
    _id: "form_006",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[1],
    sector: "Health",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "no_review",
    clientId: "usr_005",
    auditorId: "usr_002",
  },
  {
    _id: "form_007",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[2],
    sector: "Education",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "cleared",
    clientId: "usr_008",
    auditorId: "usr_002",
  },
  {
    _id: "form_008",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[3],
    sector: "Tech",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "reviewed",
    clientId: "usr_009",
    auditorId: "usr_002",
  },
  {
    _id: "form_009",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[4],
    sector: "Agriculture",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "reviewed",
    clientId: "usr_012",
    auditorId: "usr_002",
  },
  {
    _id: "form_010",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[0],
    sector: "Oil and Gas",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "flagged",
    clientId: "usr_001",
    auditorId: "usr_002",
  },
  {
    _id: "form_011",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[1],
    sector: "Health",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "no_review",
    clientId: "usr_005",
    auditorId: "usr_006",
  },
  {
    _id: "form_012",
    formName: "Data Privacy Impact Assessment",
    companyName: "John Doe Enterprise",
    companyLogo: companyLogos[2],
    sector: "Oil and Gas",
    dateSubmitted: "4th March 2026",
    timeSubmitted: "12:00:32 PM",
    reviewStatus: "no_review",
    clientId: "usr_008",
    auditorId: "usr_006",
  },
]

// Mock Resources Data
export const mockResources: Resource[] = Array.from({ length: 60 }, (_, i) => ({
  _id: `res_${String(i + 1).padStart(3, "0")}`,
  title: "Ethical use of data as organizations seek to leverage their data assets.",
  description:
    "We guide you through the implementation & certification of ISO 27001:2022, ensuring robust information security practices that protect business & client data.\nWe guide you through the implementation & certification of ISO 27001:2022, ensuring robust information security practices that protect business & client data.",
  fileUrl: `/documents/resource-${i + 1}.pdf`,
  fileType: "pdf",
  fileSize: "4 MB",
  uploadedAt: "4th March 2024",
  uploadedBy: "admin",
}))

// Mock Client Resource Access - which clients have access to which resources
export const mockClientResourceAccess: ClientResourceAccess[] = [
  {
    clientId: "usr_001",
    resourceIds: ["res_001", "res_003", "res_005"],
  },
  {
    clientId: "usr_005",
    resourceIds: ["res_002", "res_004"],
  },
]

 // Mock Invoices Data
export const mockInvoices: Invoice[] = [
  {
    _id: "inv_001",
    invoiceNumber: "INV-202510-0004",
    clientId: "usr_001",
    clientName: "John Doe Enterprise",
    clientEmail: "james@johndoeenterprise.org",
    clientPhone: "+44 7961 255907",
    subject: "Data Protection Compliance Services",
    dueDate: "4th March 2026",
    createdDate: "4th March 2026",
    currency: "NGN",
    items: [
      { description: "Data Privacy Impact Assessment", quantity: 1, unitPrice: 1000, discount: 0 },
      { description: "Data Protection Officer's Form (DPO Assessment)", quantity: 1, unitPrice: 1000, discount: 0 },
      { description: "Compliance and Audit Form", quantity: 1, unitPrice: 1000, discount: 0 },
      { description: "Newly Added Form", quantity: 1, unitPrice: 1000, discount: 0 },
    ],
    subtotal: 4000,
    vat: 300,
    total: 4300,
    invoiceType: "professional",
    status: "sent",
    depositEnabled: true,
    depositAmount: 2580,
    balanceAmount: 1720,
  },
  {
    _id: "inv_002",
    invoiceNumber: "INV-202510-0003",
    clientId: "usr_005",
    clientName: "Mary Loafers Ventures",
    clientEmail: "marylofers@gmail.com",
    subject: "Compliance Assessment Package",
    dueDate: "4th March 2026",
    createdDate: "4th March 2026",
    currency: "NGN",
    items: [{ description: "Data Privacy Impact Assessment", quantity: 1, unitPrice: 1000, discount: 10 }],
    subtotal: 1000,
    vat: 75,
    total: 1075,
    invoiceType: "statutory",
    status: "paid",
    depositEnabled: false,
  },
  {
    _id: "inv_003",
    invoiceNumber: "INV-202510-0002",
    clientId: "usr_009",
    clientName: "John Doe Enterprise",
    clientEmail: "james@johndoeenterprise.org",
    subject: "Annual Audit Services",
    dueDate: "4th March 2026",
    createdDate: "4th March 2026",
    currency: "NGN",
    items: [{ description: "Compliance and Audit Form", quantity: 2, unitPrice: 1000, discount: 10 }],
    subtotal: 2000,
    vat: 150,
    total: 2150,
    invoiceType: "professional",
    status: "draft",
    depositEnabled: true,
    depositAmount: 1290,
    balanceAmount: 860,
  },
  {
    _id: "inv_004",
    invoiceNumber: "INV-202510-0001",
    clientId: "usr_001",
    clientName: "John Doe Enterprise",
    clientEmail: "james@johndoeenterprise.org",
    subject: "Data Protection Services",
    dueDate: "4th March 2026",
    createdDate: "4th March 2026",
    currency: "NGN",
    items: [{ description: "Data Privacy Impact Assessment", quantity: 1, unitPrice: 1000, discount: 10 }],
    subtotal: 1000,
    vat: 75,
    total: 1075,
    invoiceType: "statutory",
    status: "deposit_paid",
    depositEnabled: true,
    depositAmount: 645,
    balanceAmount: 430,
  },
]

// Currencies list
export const currencies = [
  { value: "NGN", label: "₦ Nigerian Naira (NGN)", symbol: "₦" },
  { value: "USD", label: "$ US Dollar (USD)", symbol: "$" },
  { value: "EUR", label: "€ Euro (EUR)", symbol: "€" },
  { value: "GBP", label: "£ British Pound (GBP)", symbol: "£" },
] as const

// Helper function to get Resource by ID
export function getResourceById(id: string): Resource | undefined {
  return mockResources.find((r) => r._id === id)
}

// Helper functions
export function getUserById(id: string): DashboardUser | undefined {
  return mockUsers.find((user) => user._id === id)
}

export function getCollaboratorsByClientId(clientId: string): Collaborator[] {
  return mockCollaborators.filter((c) => c.clientId === clientId)
}

export function getFormsByClientId(clientId: string): FormSubmission[] {
  return mockFormSubmissions.filter((f) => f.clientId === clientId)
}

export function getFormsByAuditorId(auditorId: string): FormSubmission[] {
  return mockFormSubmissions.filter((f) => f.auditorId === auditorId)
}

export function getClientResourceAccess(clientId: string): string[] {
  const access = mockClientResourceAccess.find((a) => a.clientId === clientId)
  return access?.resourceIds || []
}

export function getResourcesForClient(clientId: string): Resource[] {
  const resourceIds = getClientResourceAccess(clientId)
  return mockResources.filter((r) => resourceIds.includes(r._id))
}


export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}


