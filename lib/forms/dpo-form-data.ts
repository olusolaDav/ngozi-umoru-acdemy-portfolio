// DPO Credential Assessment Form Data Types and Questions

export type QuestionType = "text" | "textarea" | "yesNo" | "yesNoWithOption" | "staffConsultant" | "checkbox" | "multiSelect" | "radio" | "file" | "table"

export interface TableColumn {
  id: string
  label: string
  type: "text" | "checkbox" // Column can be text input or checkbox
  placeholder?: string
}

export interface FormQuestion {
  id: string
  question: string
  type: QuestionType
  reference?: string
  placeholder?: string
  rows?: number // For table type - number of rows to display
  columns?: TableColumn[] // For table type - column definitions
  conditionalField?: {
    showWhen: "yes" | "no" | string // For radio buttons, use option id like "ds_1_d" or "ds_1_e"
    label: string
    placeholder?: string
  }
  conditionalFields?: Array<{
    showWhen: string // For radio buttons with multiple conditional fields
    question: string
    type: "multiSelect" | "text" // Support both multiSelect and text
    options?: { id: string; label: string }[]
    reference?: string
    placeholder?: string
  }>
  options?: { id: string; label: string }[]
}

export interface FormSection {
  id: string
  title: string
  shortTitle: string
  icon: "edit" | "document" | "certificate"
  type: "form" | "document"
  questions?: FormQuestion[]
}

export interface SectionScore {
  sectionId: string
  sectionTitle: string
  score: number
}

export interface AuditorReview {
  id: string
  auditorName: string
  auditorAvatar: string
  date: string
  time: string
  fieldId?: string
  comments: string[]
}

export interface FormSubmission {
  id: string
  formId: string
  clientId: string
  status: "draft" | "submitted" | "under_review" | "flagged" | "reviewed" | "approved" | "cleared"
  data: Record<string, any>
  flaggedFields: string[]
  reviews: AuditorReview[]
  scores?: SectionScore[]
  reportUrl?: string
  certificateUrl?: string
  submittedAt?: string
  updatedAt: string
  createdAt: string
}

// SECTION 1: Accreditation of Issuing Body
export const accreditationQuestions: FormQuestion[] = [
  {
    id: "section1_q1",
    question: "Is the organisation that issued your DPO certificate an accredited educational or training institution?",
    type: "yesNoWithOption",
    reference: "SECTION 1",
    conditionalField: {
      showWhen: "yes",
      label: "Provide the name of the accrediting regulator:",
      placeholder: "Enter accrediting regulator name",
    },
  },
  {
    id: "section1_q2",
    question: "Provide evidence of accreditation or regulatory approval for the issuing institution.",
    type: "file",
    reference: "SECTION 1",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "section1_q3",
    question: "Does the certificate clearly state the name of the issuing accredited body?",
    type: "yesNo",
    reference: "SECTION 1",
  },
]

// SECTION 2: Training Hours Verification
export const trainingHoursQuestions: FormQuestion[] = [
  {
    id: "section2_q1",
    question: "How many instructional hours did your DPO training cover?",
    type: "radio",
    reference: "SECTION 2",
    options: [
      { id: "section2_q1_a", label: "Less than 40 hours" },
      { id: "section2_q1_b", label: "Exactly 40 hours" },
      { id: "section2_q1_c", label: "More than 40 hours" },
    ],
    conditionalFields: [
      {
        showWhen: "section2_q1_a",
        question: "State total hours:",
        type: "text",
        placeholder: "Enter total training hours",
      },
      {
        showWhen: "section2_q1_c",
        question: "State total hours:",
        type: "text",
        placeholder: "Enter total training hours",
      },
    ],
  },
  {
    id: "section2_q2",
    question: "Provide the official training schedule, curriculum, or programme outline indicating total training hours.",
    type: "file",
    reference: "SECTION 2",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "section2_q3",
    question: "Did your training include both theoretical and practical components?",
    type: "yesNoWithOption",
    reference: "SECTION 2",
    conditionalField: {
      showWhen: "yes",
      label: "Provide details:",
      placeholder: "Describe the theoretical and practical components",
    },
  },
]

// SECTION 3: Examination Requirement
export const examinationQuestions: FormQuestion[] = [
  {
    id: "section3_q1",
    question: "Was an examination conducted as a mandatory requirement for obtaining your DPO certificate?",
    type: "yesNo",
    reference: "SECTION 3",
  },
  {
    id: "section3_q2",
    question: "What type of examination was conducted?",
    type: "checkbox",
    reference: "SECTION 3",
    options: [
      { id: "section3_q2_a", label: "Written" },
      { id: "section3_q2_b", label: "Computer-based/online" },
      { id: "section3_q2_c", label: "Oral interview" },
      { id: "section3_q2_d", label: "Practical assessment" },
      { id: "section3_q2_e", label: "Other (Specify):" },
    ],
  },
  {
    id: "section3_q3",
    question: "Provide proof of examination completion (e.g., result slip, transcript, exam notification).",
    type: "file",
    reference: "SECTION 3",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "section3_q4",
    question: "Did the issuing body set a minimum pass mark or competence level for the examination?",
    type: "radio",
    reference: "SECTION 3",
    options: [
      { id: "section3_q4_a", label: "Yes (Specify):" },
      { id: "section3_q4_b", label: "No" },
      { id: "section3_q4_c", label: "Not sure" },
    ],
    conditionalFields: [
      {
        showWhen: "section3_q4_a",
        question: "Specify the minimum pass mark or competence level:",
        type: "text",
        placeholder: "Enter pass mark or competence level details",
      },
    ],
  },
]

// SECTION 4: Enrolment on NDPC Database
export const enrollmentQuestions: FormQuestion[] = [
  {
    id: "section4_q1",
    question: "Are you currently enrolled on the Nigeria Data Protection Commission (NDPC) DPO Database?",
    type: "yesNo",
    reference: "SECTION 4",
  },
  {
    id: "section4_q2",
    question: "If enrolled, provide your NDPC DPO Identification Number.",
    type: "yesNoWithOption",
    reference: "SECTION 4",
    conditionalField: {
      showWhen: "yes",
      label: "ID Number:",
      placeholder: "Enter NDPC DPO ID Number",
    },
  },
  {
    id: "section4_q3",
    question: "Attach evidence of enrollment (e.g., portal screenshot, NDPC confirmation email).",
    type: "file",
    reference: "SECTION 4",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
]

// SECTION 5: Continuous Professional Development (CPD)
export const cpdQuestions: FormQuestion[] = [
  {
    id: "section5_q1",
    question: "Have you actively participated in at least four (4) NDPC-recognised CPD programmes within the last year?",
    type: "yesNo",
    reference: "SECTION 5",
  },
  {
    id: "section5_q2",
    question: "List the CPD activities attended:",
    type: "table",
    reference: "SECTION 5",
    rows: 4,
    columns: [
      { id: "col_sn", label: "S/N", type: "text", placeholder: "Auto" },
      { id: "col_title", label: "CPD Programme Title", type: "text", placeholder: "Enter programme title" },
      { id: "col_date", label: "Date Attended", type: "text", placeholder: "Enter date (DD/MM/YYYY)" },
      { id: "col_body", label: "Organising Body", type: "text", placeholder: "Enter organising body" },
      { id: "col_evidence", label: "Evidence Attached", type: "checkbox", placeholder: "Yes / No" },
    ],
  },
  {
    id: "section5_q3",
    question: "Do the programmes attended align with recognised themes (e.g., data security, legal frameworks, audits)?",
    type: "yesNoWithOption",
    reference: "SECTION 5",
    conditionalField: {
      showWhen: "yes",
      label: "If yes, briefly explain:",
      placeholder: "Explain the alignment with recognised themes",
    },
  },
  {
    id: "section5_q4",
    question: "Provide certificates, attendance records, or screenshots proving participation in CPD activities.",
    type: "file",
    reference: "SECTION 5",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
]

// SECTION 6: Additional Professional Validation
export const additionalValidationQuestions: FormQuestion[] = [
  {
    id: "section6_q1",
    question: "Have you participated in any practical data protection audits or assessments in the last 12 months?",
    type: "yesNoWithOption",
    reference: "SECTION 6",
    conditionalField: {
      showWhen: "yes",
      label: "If yes, provide brief details:",
      placeholder: "Describe the data protection audits or assessments you have participated in",
    },
  },
  {
    id: "section6_q2",
    question: "List any additional data protection or cybersecurity certifications you currently hold.",
    type: "text",
    reference: "SECTION 6",
    placeholder: "Enter certification names and details (one per line or comma-separated)",
  },
  {
    id: "section6_q3",
    question: "Describe briefly how you maintain up-to-date knowledge on data protection regulations and practices.",
    type: "text",
    reference: "SECTION 6",
    placeholder: "Describe your approach to staying current with data protection knowledge",
  },
]

// Form Sections Configuration
export const dpoFormSections: FormSection[] = [
  { id: "summary", title: "Summary", shortTitle: "Summary", icon: "document", type: "document" },
  {
    id: "section1_accreditation",
    title: "Data Protection Officer's Credential Assessment (Aligned with NDPC GAID Schedule 3) - SECTION 1: Accreditation of Issuing Body",
    shortTitle: "Accreditation of Issuing Body",
    icon: "edit",
    type: "form",
    questions: accreditationQuestions,
  },
  {
    id: "section2_training",
    title: "Data Protection Officer's Credential Assessment (Aligned with NDPC GAID Schedule 3) - SECTION 2: Training Hours Verification",
    shortTitle: "Training Hours Verification",
    icon: "edit",
    type: "form",
    questions: trainingHoursQuestions,
  },
  {
    id: "section3_examination",
    title: "Data Protection Officer's Credential Assessment (Aligned with NDPC GAID Schedule 3) - SECTION 3: Examination Requirement",
    shortTitle: "Examination Requirement",
    icon: "edit",
    type: "form",
    questions: examinationQuestions,
  },
  {
    id: "section4_enrollment",
    title: "Data Protection Officer's Credential Assessment (Aligned with NDPC GAID Schedule 3) - SECTION 4: Enrolment on NDPC Database",
    shortTitle: "NDPC Enrolment",
    icon: "edit",
    type: "form",
    questions: enrollmentQuestions,
  },
  {
    id: "section5_cpd",
    title: "Data Protection Officer's Credential Assessment (Aligned with NDPC GAID Schedule 3) - SECTION 5: Continuous Professional Development (40 Marks)",
    shortTitle: "CPD (40 Marks)",
    icon: "edit",
    type: "form",
    questions: cpdQuestions,
  },
  {
    id: "section6_validation",
    title: "Data Protection Officer's Credential Assessment (Aligned with NDPC GAID Schedule 3) - SECTION 6: Additional Professional Validation (Optional but Recommended)",
    shortTitle: "Additional Professional Validation",
    icon: "edit",
    type: "form",
    questions: additionalValidationQuestions,
  },
  { id: "scores", title: "Assessment Scores", shortTitle: "Scores", icon: "document", type: "document" },
]

// Mock submission data for DPO form
export const mockDPOSubmission: FormSubmission = {
  id: "dpo_001",
  formId: "dpo_form",
  clientId: "client_001",
  status: "draft",
  data: {
    section1_q1: "yes",
    section1_q1_option: "FRCN",
    section1_q2: null,
    section1_q3: "yes",
    section2_q1: "section2_q1_b",
    section2_q2: null,
    section2_q3: "yes",
    section2_q3_option: "40 hours covering both theoretical concepts and practical case studies",
    section3_q1: "yes",
    section3_q2: ["section3_q2_a", "section3_q2_b"],
    section3_q3: null,
    section3_q4: "section3_q4_a",
    section3_q4_a: "70%",
    section4_q1: "yes",
    section4_q2: "yes",
    section4_q2_option: "NDPC/DPO/2024/0001",
    section4_q3: null,
    section5_q1: "yes",
    section5_q2: {},
    section5_q3: "yes",
    section5_q3_option: "All programmes covered data security, regulatory compliance, and audit methodologies",
    section5_q4: null,
    section6_q1: "yes",
    section6_q1_option: "Conducted DPIA for healthcare organization, completed GDPR awareness audit",
    section6_q2: "ISO/IEC 27001:2022 Lead Auditor, CISM",
    section6_q3: "Regular participation in NDPC webinars, monthly data protection bulletin reviews, and annual conference attendance",
  },
  flaggedFields: [],
  reviews: [],
  scores: [
    { sectionId: "section1_accreditation", sectionTitle: "Accreditation of Issuing Body", score: 95 },
    { sectionId: "section2_training", sectionTitle: "Training Hours Verification", score: 88 },
    { sectionId: "section3_examination", sectionTitle: "Examination Requirement", score: 92 },
    { sectionId: "section4_enrollment", sectionTitle: "NDPC Enrolment", score: 100 },
    { sectionId: "section5_cpd", sectionTitle: "Continuous Professional Development", score: 85 },
    { sectionId: "section6_validation", sectionTitle: "Additional Professional Validation", score: 90 },
  ],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

// Calculate section progress
export function calculateSectionProgress(
  sectionId: string,
  data: Record<string, any>,
  sections: FormSection[],
): number {
  const section = sections.find((s) => s.id === sectionId)
  if (!section || !section.questions || section.type === "document") return 0

  const totalQuestions = section.questions.length
  let answeredQuestions = 0

  section.questions.forEach((q) => {
    let isAnswered = false

    switch (q.type) {
      case "text":
      case "textarea":
        // Text is answered if it's not empty, null, or undefined
        {
          const value = data[q.id]
          if (value !== undefined && value !== null && value !== "") {
            isAnswered = true
          }
        }
        break

      case "yesNo":
        // Yes/No is answered if selected
        {
          const value = data[q.id]
          if (value === "yes" || value === "no") {
            isAnswered = true
          }
        }
        break

      case "yesNoWithOption":
        // Yes/No with optional field - count as answered if selection is made
        {
          const value = data[q.id]
          if (value === "yes" || value === "no") {
            // If there's a conditional field that should be filled, check it
            if (q.conditionalField?.showWhen === value) {
              const conditionalValue = data[`${q.id}_option`]
              if (conditionalValue !== undefined && conditionalValue !== null && conditionalValue !== "") {
                isAnswered = true
              }
            } else {
              // No conditional field needed, question is answered
              isAnswered = true
            }
          }
        }
        break

      case "staffConsultant":
        // Staff/Consultant selection
        {
          const value = data[q.id]
          if (value === "staff" || value === "consultant") {
            isAnswered = true
          }
        }
        break

      case "checkbox":
        // Checkbox is answered if at least one option is selected
        {
          const hasSelection = q.options?.some((opt) => data[opt.id] === true)
          if (hasSelection) {
            isAnswered = true
          }
        }
        break

      case "multiSelect":
        // MultiSelect is answered if at least one option is selected
        // NOTE: Options are stored by option.id, not by the question.id
        {
          const hasSelection = q.options?.some((opt) => data[opt.id] === true)
          if (hasSelection) {
            isAnswered = true
          }
        }
        break

      case "radio":
        // Radio is answered if selected, and conditional fields (if any) are also filled
        {
          const value = data[q.id]
          if (value !== undefined && value !== null && value !== "") {
            let isComplete = true

            // Check if there are conditional fields
            if (q.conditionalFields && q.conditionalFields.length > 0) {
              const matchingConditional = q.conditionalFields.find((cf) => cf.showWhen === value)
              if (matchingConditional) {
                if (matchingConditional.type === "multiSelect") {
                  // Check if at least one option is selected
                  const hasConditionalSelection = matchingConditional.options?.some(
                    (opt) => data[opt.id] === true,
                  )
                  isComplete = hasConditionalSelection || false
                } else if (matchingConditional.type === "text") {
                  // Check if conditional text is filled
                  const conditionalValue = data[`${q.id}_conditional_${value}`]
                  isComplete =
                    conditionalValue !== undefined && conditionalValue !== null && conditionalValue !== ""
                }
              }
            }

            if (isComplete) {
              isAnswered = true
            }
          }
        }
        break

      case "file":
        // File is answered if file object with name property exists OR if it's a URL string
        {
          const value = data[q.id]
          if (value) {
            // Handle file object with name property
            if (typeof value === "object" && value.name) {
              isAnswered = true
            }
            // Handle URL string (e.g., from Cloudinary upload)
            else if (typeof value === "string" && value.trim() !== "") {
              isAnswered = true
            }
          }
        }
        break

      case "table":
        // Table is answered if at least one cell (excluding col_sn) has data
        {
          let hasTableData = false
          const rows = q.rows || 4
          const columns = q.columns || []

          for (let i = 0; i < rows; i++) {
            for (const col of columns) {
              if (col.id !== "col_sn") {
                const cellId = `${q.id}_row${i}_${col.id}`
                const cellValue = data[cellId]
                if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
                  hasTableData = true
                  break
                }
              }
            }
            if (hasTableData) break
          }

          if (hasTableData) {
            isAnswered = true
          }
        }
        break

      default:
        break
    }

    if (isAnswered) {
      answeredQuestions++
    }
  })

  return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
}

// Calculate overall progress
export function calculateOverallProgress(data: Record<string, any>, sections: FormSection[]): number {
  const formSections = sections.filter((s) => s.type === "form")
  if (formSections.length === 0) return 0

  const totalProgress = formSections.reduce((sum, section) => {
    return sum + calculateSectionProgress(section.id, data, sections)
  }, 0)

  return Math.round(totalProgress / formSections.length)
}
