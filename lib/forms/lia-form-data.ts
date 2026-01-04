// Legitimate Interest Assessment (LIA) Form Data Types and Questions

export type QuestionType = "text" | "textarea" | "yesNo" | "yesNoWithOption" | "staffConsultant" | "checkbox" | "multiSelect" | "radio" | "file" | "table"

export interface TableColumn {
  id: string
  label: string
  type: "text" | "checkbox"
  placeholder?: string
}

export interface FormQuestion {
  id: string
  question: string
  type: QuestionType
  reference?: string
  placeholder?: string
  rows?: number
  columns?: TableColumn[]
  conditionalField?: {
    showWhen: "yes" | "no" | string
    label: string
    placeholder?: string
  }
  conditionalFields?: Array<{
    showWhen: string
    question: string
    type: "multiSelect" | "text"
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
  reportUrl?: string
  certificateUrl?: string
  submittedAt?: string
  updatedAt: string
  createdAt: string
}

// PART 1: PURPOSE TEST QUESTIONS
export const purposeTestQuestions: FormQuestion[] = [
  {
    id: "pt_q1",
    question: "Why do you want to process the data?",
    type: "textarea",
    reference: "PART 1 - Question 1",
    placeholder: "Describe the purpose of data processing...",
  },
  {
    id: "pt_q2",
    question: "What benefit do you expect to get from the processing?",
    type: "textarea",
    reference: "PART 1 - Question 2",
    placeholder: "Explain the expected benefits...",
  },
  {
    id: "pt_q3",
    question: "Do any third parties benefit from the processing?",
    type: "textarea",
    reference: "PART 1 - Question 3",
    placeholder: "Describe third-party benefits if applicable...",
  },
  {
    id: "pt_q4",
    question: "Are there any wider public benefits to the processing?",
    type: "textarea",
    reference: "PART 1 - Question 4",
    placeholder: "Explain any public benefits...",
  },
  {
    id: "pt_q5",
    question: "How important are the benefits that you have identified?",
    type: "textarea",
    reference: "PART 1 - Question 5",
    placeholder: "Assess the importance of identified benefits...",
  },
  {
    id: "pt_q6",
    question: "What would the impact be if you couldn't go ahead with the processing?",
    type: "textarea",
    reference: "PART 1 - Question 6",
    placeholder: "Describe the impact if processing cannot proceed...",
  },
  {
    id: "pt_q7",
    question: "Are you complying with any specific data protection rules that apply to your processing (e.g. profiling requirements)?",
    type: "textarea",
    reference: "PART 1 - Question 7",
    placeholder: "List applicable data protection rules...",
  },
  {
    id: "pt_q8",
    question: "Are you complying with other relevant laws?",
    type: "textarea",
    reference: "PART 1 - Question 8",
    placeholder: "Describe compliance with other laws...",
  },
  {
    id: "pt_q9",
    question: "Are you complying with industry guidelines or codes of practice?",
    type: "textarea",
    reference: "PART 1 - Question 9",
    placeholder: "List applicable guidelines or codes...",
  },
  {
    id: "pt_q10",
    question: "Are there any other ethical issues with the processing?",
    type: "textarea",
    reference: "PART 1 - Question 10",
    placeholder: "Describe any ethical concerns...",
  },
  {
    id: "pt_q11",
    question: "Will the processing involve the personal data of a child in anyway?",
    type: "textarea",
    reference: "PART 1 - Question 11",
    placeholder: "Describe any involvement of children's data...",
  },
  {
    id: "pt_q12",
    question: "Do you have an effective means of carrying out age verification?",
    type: "textarea",
    reference: "PART 1 - Question 12",
    placeholder: "Describe your age verification methods...",
  },
]

// PART 2: NECESSITY TEST QUESTIONS
export const necessityTestQuestions: FormQuestion[] = [
  {
    id: "nt_q1",
    question: "Will this processing actually help you achieve your purpose?",
    type: "textarea",
    reference: "PART 2 - Question 1",
    placeholder: "Explain how processing helps achieve the purpose...",
  },
  {
    id: "nt_q2",
    question: "Is the processing proportionate to that purpose?",
    type: "textarea",
    reference: "PART 2 - Question 2",
    placeholder: "Justify the proportionality of the processing...",
  },
  {
    id: "nt_q3",
    question: "Can you achieve the same purpose without the processing?",
    type: "textarea",
    reference: "PART 2 - Question 3",
    placeholder: "Describe alternative approaches...",
  },
  {
    id: "nt_q4",
    question: "Can you achieve the same purpose by processing less data, or by processing the data in another more obvious or less intrusive way?",
    type: "textarea",
    reference: "PART 2 - Question 4",
    placeholder: "Explain data minimization and alternative approaches...",
  },
]

// Form sections
export const liaFormSections: FormSection[] = [
  { id: "summary", title: "Summary", shortTitle: "Summary", icon: "document", type: "document" },
  {
    id: "part1_purpose_test",
    title: "Legitimate Interest Assessment - Part 1: Purpose Test",
    shortTitle: "Part 1: Purpose Test",
    icon: "edit",
    type: "form",
    questions: purposeTestQuestions,
  },
  {
    id: "part2_necessity_test",
    title: "Legitimate Interest Assessment - Part 2: Necessity Test",
    shortTitle: "Part 2: Necessity Test",
    icon: "edit",
    type: "form",
    questions: necessityTestQuestions,
  },
  { id: "report", title: "Report", shortTitle: "Report", icon: "document", type: "document" },
]

// Mock submission data for LIA form
export const mockLIASubmission: FormSubmission = {
  id: "lia_001",
  formId: "lia_form",
  clientId: "client_001",
  status: "draft",
  data: {
    pt_q1: "",
    pt_q2: "",
    pt_q3: "",
    pt_q4: "",
    pt_q5: "",
    pt_q6: "",
    pt_q7: "",
    pt_q8: "",
    pt_q9: "",
    pt_q10: "",
    pt_q11: "",
    pt_q12: "",
    nt_q1: "",
    nt_q2: "",
    nt_q3: "",
    nt_q4: "",
  },
  flaggedFields: [],
  reviews: [],
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
        // File is answered if file object with name property exists
        {
          const value = data[q.id]
          if (value && typeof value === "object" && value.name) {
            isAnswered = true
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
