// NDP ACT Compliance Audit Returns (CAR) Form Data Types and Questions

export type QuestionType = "text" | "textarea" | "yesNo" | "yesNoWithOption" | "staffConsultant" | "checkbox" | "multiSelect" | "radio" | "file" | "table" | "assessmentTable" | "radioWithTextarea" | "checkboxWithTextarea"

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
    type: "multiSelect" | "text" | "textarea" // Support both multiSelect and text
    options?: { id: string; label: string }[]
    reference?: string
    placeholder?: string
  }>
  options?: { id: string; label: string; description?: string }[]
  // For assessmentTable type
  whatToNote?: string
  assessmentGuidance?: string
  // For radioWithTextarea and checkboxWithTextarea types
  requiresReason?: boolean
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

// Corporate Information Fields
export const corporateInfoFields: FormQuestion[] = [
  { id: "orgName", question: "Name of Organisation", type: "text" },
  { id: "address", question: "Address", type: "text" },
  { id: "phone", question: "Phone", type: "text" },
  { id: "email", question: "Email", type: "text" },
  { id: "dpoName", question: "DPO's Name", type: "text" },
  { id: "dpoEmail", question: "DPO's Email", type: "text" },
  { id: "dpcoName", question: "DPCO's Name", type: "text" },
  { id: "dpcoEmail", question: "DPCO's Email", type: "text" },
  { id: "estimatedDataSubjects", question: "Estimated Number of Data Subject", type: "text" },
  { id: "sector", question: "Sector", type: "text" },
]

// Part 1: People and Process (Governance)
export const peopleProcessQuestions: FormQuestion[] = [
  {
    id: "pp_1",
    question: "Is the organisation currently registered with the NDPC for data processing?",
    type: "yesNoWithOption",
    reference: "S.44 Art. 9",
    conditionalField: {
      showWhen: "yes",
      label: "Provide Registration number:",
      placeholder: "Enter registration number",
    },
  },
  {
    id: "pp_2",
    question: "Is there a designated Data Protection Officer (DPO) for the organisation?",
    type: "yesNo",
    reference: "S.32 Art. 11",
  },
  {
    id: "pp_3",
    question: "Is the DPO a member of staff or a consultant?",
    type: "staffConsultant",
    reference: "S.32",
  },
  {
    id: "pp_4",
    question: "Is the DPO trained in data privacy and protection?",
    type: "yesNo",
    reference: "S.32 Art. 12(2) (c)",
  },
  {
    id: "pp_5",
    question: "Is the DPO certified by duly accredited certification body for data protection?",
    type: "yesNoWithOption",
    reference: "S.32 Art 14",
    conditionalField: {
      showWhen: "yes",
      label: "Provide Accreditation number:",
      placeholder: "Enter accreditation number",
    },
  },
  {
    id: "pp_6",
    question: "Is the DPO participating in Continuous Professional Development training?",
    type: "yesNo",
    reference: "S.32 Art. 12",
  },
  {
    id: "pp_7",
    question: "Did the DPO obtain the required Continuous Professional Development Credit within 12 months?",
    type: "yesNoWithOption",
    reference: "S.32 Art. 4(8)",
    conditionalField: {
      showWhen: "yes",
      label: "Provide Continuous Professional Development Credit:",
      placeholder: "Enter CPD credit",
    },
  },
  {
    id: "pp_8",
    question:
      "Does the organisation have a schedule for capacity building on data protection for all employees and persons engaged to work on their premises or engage with their data subjects?",
    type: "yesNo",
    reference: "S.24 (2)(3) Art. 30",
  },
  {
    id: "pp_9",
    question: "Does the organisation carry out the training as provided in the schedule?",
    type: "yesNo",
    reference: "S.24 (2)(3) Art. 30",
  },
  {
    id: "pp_10",
    question:
      'Does the organisation have a Basic Privacy Checklist (BPC) of "Dos and Don\'ts" on data privacy provided for all persons working for or with the organisation as prescribed under Article 31(7) of the NDP Act/ GAID?',
    type: "yesNo",
    reference: "S.24 (2)(3) Art.30 (7)",
  },
  {
    id: "pp_11",
    question:
      "Is the Basic Privacy Checklist part of the annexure to the organisation's NDP Act CAR as prescribed under the NDP Act GAID?",
    type: "yesNo",
    reference: "S.24 (2)(3) S.39, S.6(e) Art. 30(7)",
  },
  {
    id: "pp_12",
    question:
      "Please select from the list the type of facts that describe the organisation's data protection practices.",
    type: "multiSelect",
    reference: "S.24",
    options: [
      {
        id: "pp_12_a",
        label:
          "The organisation has a written schedule it follows for the general review of all its data processing platforms and practices.",
      },
      {
        id: "pp_12_b",
        label:
          "Only a certain category of data processing in the organisation has a schedule; and the organisation follows this schedule.",
      },
      {
        id: "pp_12_c",
        label:
          "Procedures in the organisation ensure that data subject's rights are safeguarded in line with the NDP Act.",
      },
      { id: "pp_12_d", label: "At least one procedure in the organisation may not safeguard data subject's rights." },
      {
        id: "pp_12_e",
        label:
          "The organisation has a procedure for ensuring that it obtains informed consent of the data subject in line with the NDP Act.",
      },
      { id: "pp_12_f", label: "The process for obtaining informed consent needs more improvement." },
      {
        id: "pp_12_g",
        label:
          "All forms of personal data collection and processing are by informed consent as required under the NDP Act.",
      },
      {
        id: "pp_12_h",
        label: "Some forms of personal data collection and processing are not documented in the privacy policy.",
      },
      {
        id: "pp_12_i",
        label:
          "Changes to the privacy policy are communicated to all data subjects in a clear, simple, and timely manner.",
      },
      { id: "pp_12_j", label: "Changes to the privacy policy are not clearly communicated to all data subjects." },
      {
        id: "pp_12_k",
        label:
          "The organisation always obtains renewal of data subject's consent after changes in its data processing practice or privacy policy.",
      },
      {
        id: "pp_12_l",
        label:
          "The organisation does not always obtain renewal of data subject's consent after changes in its data processing practice or privacy policy.",
      },
      {
        id: "pp_12_m",
        label:
          "The organisation does not make adequate efforts to inform data subjects who are not literate in English or the organisation's default language.",
      },
      {
        id: "pp_12_n",
        label:
          "The organisation makes adequate efforts to inform data subjects who are not literate in English language.",
      },
    ],
  },
]

// Principles of Data Protection
export const principlesQuestions: FormQuestion[] = [
  {
    id: "pdp_intro",
    question:
      "Please select from the checklist below, the type of facts that describe the organisation's alignment with the principles of data protection. (By its written policy and in actual practice as observed during an audit of all its data processing platforms and practices, data processing in the organisation follows the principles of data protection on the ground that):",
    type: "multiSelect",
    reference: "S.24",
    options: [
      { id: "pdp_1", label: "Data processing in the organisation is fair, lawful and transparent." },
      {
        id: "pdp_2",
        label: "It specifically makes sure that the processing does not override the interests of the data subjects.",
      },
      {
        id: "pdp_3",
        label:
          "It is not in violation of any law or public policy in Nigeria; it is reasonable, based on mode of communication and direct engagement (in major indigenous languages and in info-graphics) to state that the data subject is fully aware of at least some of the major data processing in the organisation.",
      },
      {
        id: "pdp_4",
        label: "Data subjects are aware of at least some of the major data processing activities in the organisation.",
      },
      {
        id: "pdp_5",
        label:
          "The processing in all circumstances is limited to the purpose for which the personal data was/will be collected. Specific and observable efforts have been made to ensure that the data being processed is minimal, adequate and relevant to what is actually needed.",
      },
      {
        id: "pdp_6",
        label:
          "Specific and observable efforts have been made to ensure that personal data is not stored longer than the period of usefulness in relation to its lawful purpose and it is appropriately deleted or irreversibly de-identified to guarantee the privacy of the data subject to whom it relates.",
      },
      {
        id: "pdp_7",
        label:
          "Specific and observable efforts have been made to ensure that some personal data for research purposes have been irreversibly de-identified to guarantee the privacy of the data subject to whom it relates.",
      },
      {
        id: "pdp_8",
        label:
          "Specific and observable efforts have been made to ensure that personal data is accurate, kept up to date and appropriate steps have been taken to enable the erasure/correction of inaccurate data.",
      },
      { id: "pdp_9", label: "Adequate safeguards have been deployed for physical security of data storage." },
      { id: "pdp_10", label: "Adequate safeguards have been deployed for cyber security." },
      {
        id: "pdp_11",
        label:
          "Adequate safeguards have been deployed in relation to the protection of the data against any unlawful processing activities.",
      },
      {
        id: "pdp_12",
        label:
          "Adequate safeguards have been deployed for data classification (sensitive data, confidential, internal/restricted, public) with access controls.",
      },
    ],
  },
]

// Lawful Bases for Processing
export const lawfulBasesQuestions: FormQuestion[] = [
  {
    id: "lb_1",
    question: "Please select from the list the type of facts that describe your organisation's lawful bases.",
    type: "multiSelect",
     reference: "S.25",
    options: [
      { id: "lb_consent", label: "Consent" },
      { id: "lb_legal", label: "Legal Obligation" },
      { id: "lb_contract", label: "Contract" },
      { id: "lb_vital", label: "Vital Interest" },
      { id: "lb_public", label: "Public Interest" },
      { id: "lb_legitimate", label: "Legitimate Interest" },
    ],
  },
   {
    id: "lb_2",
    question: "Please select from the checklist below the type of facts that describe the organisation’s lawful bases.",
    type: "multiSelect",
     reference: "S.25",
    options: [
      { id: "lb_2_a", label: "Consent" },
      { id: "lb_2_b", label: "Legal Obligation" },  
      { id: "lb_2_c", label: "Contract" },
      { id: "lb_2_d", label: "Vital Interest" },
      { id: "lb_2_e", label: "Public Interest" },
      { id: "lb_2_f", label: "Legitimate Interest" },
    ],
  }
]

// Profiling & Marketing
export const profilingMarketingQuestions: FormQuestion[] = [
  {
    id: "pm_1",
    question:
      "Please select from the list the type of facts that describe the organisation's lawful bases for profiling and marketing.",
    type: "multiSelect",
    reference: "S. 25",
    options: [
      { id: "pm_consent", label: "Consent" },
      { id: "pm_legal", label: "Legal Obligation" },
      { id: "pm_contract", label: "Contract" },
      { id: "pm_vital", label: "Vital Interest" },
      { id: "pm_public", label: "Public Interest" },
      { id: "pm_legitimate", label: "Legitimate Interest" },
    ],
  },
]

// Data Security Controls & Standards
export const dataSecurityControlsQuestions: FormQuestion[] = [
  {
    id: "dsc_1",
    question: "Please select from the list the type of facts that describe the organisation's access control measures.",
    type: "multiSelect",
    reference: "Ss.24 & 39",
    options: [
      { id: "dsc_1_a", label: "The organisation has a central database (or server) for personal data." },
      { id: "dsc_1_b", label: "The organisation does not have a central database (or server) for personal data." },
      {
        id: "dsc_1_c",
        label: "The organisation has other files or registers for personal data outside the database (or server).",
      },
      { id: "dsc_1_d", label: "Data processing is by purely electronic means." },
      { id: "dsc_1_e", label: "Data processing is by purely manual means." },
      { id: "dsc_1_f", label: "Data processing is by both electronic and manual means." },
      { id: "dsc_1_g", label: "All personal data are stored in-house on local infrastructure." },
      { id: "dsc_1_h", label: "All personal data are stored in-house on cloud." },
      { id: "dsc_1_i", label: "Some personal data are stored externally on a local infrastructure." },
      { id: "dsc_1_j", label: "Some personal data are stored externally on cloud." },
      { id: "dsc_1_k", label: "The organisation has a data breach incident reporting system." },
      { id: "dsc_1_l", label: "Access to personal data is controlled based on job roles and responsibilities." },
      { id: "dsc_1_m", label: "Access to personal data is audited and logged." },
      { id: "dsc_1_n", label: "The organisation has documented access control policies." },
      { id: "dsc_1_o", label: "Access controls are reviewed periodically." },
      { id: "dsc_1_p", label: "Employees are required to sign confidentiality agreements." },
    ],
  },
]

// Data Access Control
export const dataAccessControlQuestions: FormQuestion[] = [
  {
    id: "dac_1",
    question:
      "Please select from the list the type of facts that describe the organisation’s practices in respect of data access control in order to guarantee data Confidentiality, Integrity and Availability within the organisation.",
    type: "multiSelect",
    reference: "S.39 Art. 30",
    options: [
      { id: "dac_1_a", label: "User Specific or Personalised Password" },
      { id: "dac_1_b", label: "2 factor Authentication" },
      { id: "dac_1_c", label: "Multi-factor Authentication" },
      { id: "dac_1_d", label: "Encryption of data at rest" },
      { id: "dac_1_e", label: "Encryption of data in transit" },
      { id: "dac_1_f", label: "Anti-Ransomware" },
      { id: "dac_1_g", label: "Anti-Spyware" },
      { id: "dac_1_h", label: "Anti-Malware" },
      { id: "dac_1_i", label: "Locational Security" },
    ],
  },
]

// Data Access Control and Business Continuity
export const accessControlQuestions: FormQuestion[] = [
  {
    id: "ac_1",
    question:
      "Please select from the list the type of facts that describe the organisation's practices in respect of data access control in order to guarantee data Confidentiality, Integrity and Availability within the organisation.",
    type: "multiSelect",
    reference: "S.39 Art.30",
    options: [
      { id: "ac_1_a", label: "All the access controls are adequate in relation to risks of breaches." },
      {
        id: "ac_1_b",
        label: "At least one of the controls may not be very strong or adequate in relation to risk of breaches.",
      },
      {
        id: "ac_1_c",
        label:
          "The organisation has a schedule for Monitoring, Evaluation and Maintenance (MEM) of its data security system.",
      },
      {
        id: "ac_1_d",
        label:
          "The Schedule for MEM data security was vetted by a certified data security expert in accordance with NDP ACT GAID.",
      },
      {
        id: "ac_1_e",
        label:
          "The organisation does not have a schedule for MEM of its data security system vetted by a duly certified data security expert.",
      },
      { id: "ac_1_f", label: "The organisation has a disaster recovery plan." },
      { id: "ac_1_g", label: "The organisation does not have a disaster recovery plan." },
      { id: "ac_1_h", label: "The disaster recovery plan is POOR because some crucial data may not be recovered." },
      {
        id: "ac_1_i",
        label: "The disaster recovery plan is FAIR because crucial data will be recovered but it may take a long time.",
      },
      {
        id: "ac_1_j",
        label: "The disaster recovery plan is GOOD because ALL DATA will be recovered but it may take a long time.",
      },
      {
        id: "ac_1_k",
        label:
          "The disaster recovery plan is EXCELLENT because ALL DATA will be recovered ALMOST IMMEDIATELY – with the least possible latency.",
      },
    ],
  },
]

// Data Security
export const dataSecurityQuestions: FormQuestion[] = [
  {
    id: "ds_1",
    question:
      "Please select from the list 'types of answers' column, the type of facts that describe the organisation's practices in respect of data security to guarantee data Confidentiality, Integrity and Availability.",
    type: "radio",
    reference: "S.39",
    options: [
      {
        id: "ds_1_a",
        label: "Poor – on the ground that critical security measures are non-existent or not up to date.",
      },
      {
        id: "ds_1_b",
        label:
          "Average – the level of data security measure in place may offer basic protection to sensitive and non-sensitive personal data, importantly, the possibility of a breach which may create harm or compromise the privacy to data subjects is low.",
      },
      {
        id: "ds_1_c",
        label:
          "Above Average – critical security measures are in place but may be vulnerable because some controls that are crucial for the security of sensitive personal data or financial data are not in place or adequate.",
      },
      {
        id: "ds_1_d",
        label:
          "Close to Industry Grade – Critical security measures and controls are in place but falls below recognised global standards or more specifically, they do not follow any one of the following standards:",
      },
      {
        id: "ds_1_e",
        label:
          "Industry Grade – adequate technical and organisational measures are in place managed by qualified experts who are certified in accordance with recognised global standards. More specifically, the organisation implements the following standards:",
      },
    ],
    conditionalFields: [
      {
        showWhen: "ds_1_d",
        question: "Please select from the checklist below, the standards the organisation implements (for 'Close to Industry Grade' selection):",
        type: "multiSelect",
        reference: "S.39",
        options: [
          { id: "ds_2_iso27000", label: "ISO 27000 series" },
          { id: "ds_2_nist800", label: "National Institute of Standards and Technology Special Publications (NIST SP) 800series" },
          { id: "ds_2_nist_csf", label: "NIST Cybersecurity Framework CSF" },
          { id: "ds_2_cis", label: "Centre for Internet Security (CIS) Critical Security Controls" },
          { id: "ds_2_cobit", label: "COBIT" },
          { id: "ds_2_hitrust", label: "Health Information Trust Alliance (HITRUST) Common Security Framework (CSF)" },
        ],
      },
      {
        showWhen: "ds_1_e",
        question: "Please select from the checklist below, the standards the organisation implements (for 'Industry Grade' selection):",
        type: "multiSelect",
        reference: "S.39",
        options: [
          { id: "ds_3_iso27000", label: "ISO 27000 series" },
          { id: "ds_3_nist800", label: "National Institute of Standards and Technology Special Publications (NIST SP) 800series" },
          { id: "ds_3_nist_csf", label: "NIST Cybersecurity Framework CSF" },
          { id: "ds_3_cis", label: "Centre for Internet Security (CIS) Critical Security Controls" },
          { id: "ds_3_cobit", label: "COBIT" },
          { id: "ds_3_hitrust", label: "Health Information Trust Alliance (HITRUST) Common Security Framework (CSF)" },
          { id: "ds_3_ndp_adequacy", label: "The Organisation is also on the National Data Protection Adequacy Programme Whitelist" },
        ],
      },
    ],
  },
]

// Accountability & Basic Risk Evaluation - Data Privacy Impact Assesment 
export const dataPrivacyImpactassement: FormQuestion[] = [
  {
    id: "ar_1",
    question: "At the commencement of operation as an organisation or in the course of operation, did the organisation ever carry out a Data Privacy Impact Assessment (DPIA)?",
    type: "yesNo",
    reference: "S.29",
  },
  {
    id: "ar_2",
    question: "Did the organisation deploy a new technology or introduce new measures of data processing within the last year?",
    type: "yesNo",
    reference: "S.30",
  },
   {
    id: "ar_3",
    question: "Did the organisation deploy a new technology or introduce new measures of data processing within the last year?",
    type: "yesNo",
    reference: "S.30",
  },
  {
    id: "ar_4",
    question:
      "From the checklist below, choose the type of facts that describe the organisation’s consideration on DPIA. ",
    type: "multiSelect",
    reference: "S.29",
    options: [
      { id: "ar_3_a", label: "The organisation is not processing sensitive personal data." },
      { id: "ar_3_b", label: "The organisation processes or intends to process sensitive personal data." },
      { id: "ar_3_c", label: "At least some of data subjects being targeted by the data processing fall within the risk factors under the Data Subjects’ Vulnerability Index." },
      {
        id: "ar_3_d",
        label:
          "Data subjects being targeted by the data processing do not fall within the risk factors under the Data Subjects’ Vulnerability Index.",
      },
      {
        id: "ar_3_e",
        label:
          "New technology or procedures have been deployed that may significantly impact the privacy of data subjects.",
      },
      {
        id: "ar_3_f",
        label:
          "No new technology or procedures have been deployed that may significantly impact the privacy of data subjects.",
      },
    ],
  },
]

//Accountability & Basic Risk Evaluation - Legitimate Interest Assessment
export const legitimateInterestQuestions: FormQuestion[] = [
  {
    id: "lia_1",
    question: "Does the organisation rely on legitimate interest to process personal data?",
    type: "yesNo",
    reference: "S.25 (1)(b) v",
  },
  {
    id: "lia_2",
    question: "Does the organisation carry out legitimate interest assessment?",
    type: "yesNo",
  },
  {
    id: "lia_3",
    question:
      "Please select from the list the type of facts that describe the organisation's practices in respect of legitimate interest.",
    type: "multiSelect",
    options: [
      {
        id: "lia_3_a",
        label:
          "The organisation relies on legitimate interest to foster some of its business interests and this business interests are not, in some cases, connected to security of lives and crime prevention, sustainability of Health, Safety and Environment.",
      },
      {
        id: "lia_3_b",
        label:
          "Legitimate interest is only relied upon as a lawful basis when the rights of data subjects are considered, and it is EVIDENT that the legitimate interest does not override the rights of the data subject.",
      },
      {
        id: "lia_3_c",
        label:
          "Legitimate interest is relied upon only in circumstances that are necessary and relevant to the fulfilment of data processing which already has another lawful basis.",
      },
    ],
  },
]

// Accountability & Record of Processing
export const accountabilityRecordQuestions: FormQuestion[] = [
  {
    id: "arp_1",
    question: "Does the DPO prepare Semi-Annual Data Protection Report (SAPR) as provided for under the NDP Act GAID?",
    type: "yesNo",
    reference: "Art. 13",
  },
  {
    id: "arp_2",
    question:
      "Please select from the list the type of facts that describe the organisations practices in respect of accountability and record of processing activities.",
    type: "multiSelect",
    reference: "Art. 13",
    options: [
      {
        id: "arp_2_a",
        label:
          "The SAPR is an accurate evidence-based assessment of the organisation’s data security based on Art. 14 of the GAID.",
      },
      {
        id: "arp_2_b",
        label: "The organisation processed personal data of at least (……) data subjects in the last 3 months.",
      },
      { id: "arp_2_c", label: "The organisation has lawful basis recognised by the NDP Act to process personal data" },
      { id: "arp_2_d", label: "In instances where the organisation is not sure of its lawful basis, it sought guidance from a DPCO or the NDPC." },
      {
        id: "arp_2_e",
        label: "TThe DPCO provided guidance on the appropriate lawful basis.",
      },
      { id: "arp_2_f", label: "The DPCO DID NOT provide guidance on the appropriate lawful basis." },
      { id: "arp_2_g", label: "The organisation complies with the Nigeria Data Protection Act, and other regulatory instruments issues by the NDPC" },
      {
        id: "arp_2_h",
        label: "There are (……) complaints by data subjects (customers/ employees)",
      },
         {
        id: "arp_2_i",
        label: "(……) complaints are under investigations",
      },
      { id: "arp_2_j", label: "(……) complaints are resolved within (……) days" },
      { id: "arp_2_k", label: "(……) compliance notices were issued by the NDPC to the organisation." },
      {
        id: "arp_2_l",
        label: "(……) number of the notices have been resolved within (……) days",
      },
            {
        id: "arp_2_m",
        label: "(……) number of Data Subject’s Access Request (DSAR) were received by the organisation.",
      },
      { id: "arp_2_n", label: "(……) number of DSAR are receiving attention." },
      { id: "arp_2_o", label: "(……) number of DSAR were resolved with Data Subject within (……) days." },
      {
        id: "arp_2_p",
        label: "There are (……) number of data breaches.",
      },
   { id: "arp_2_q", label: "Data Breach notification was sent to the NDPC within 72 hours." },
      {
        id: "arp_2_r",
        label: "Data Breach notification was sent to data subjects immediately.",
      },
    ]
  },
  {
    id: "arp_3",
    question: "Does the DPO submit their report directly to the management at least once in six (6) months?",
    type: "yesNo",
    reference: "Art. 13(2)",
  },
  {
    id: "arp_4",
    question: "Is the report submitted by the DPO acknowledged as provided under NDP ACT-GAID?",
    type: "yesNo",
    reference: "Art. 13(3)",
  },
   {
    id: "arp_5  ",
    question: "Is the acknowledgement of the report submission verified by a Data Protection Compliance Organisation under NDP ACT-GAID?",
    type: "yesNo",
  },
]



// Cross-Border Data Transfer
export const crossBorderQuestions: FormQuestion[] = [

  {
    id: "cb_1",
    question: "Does the organisation engage in cross-border data transfer?",
    type: "yesNo",
    reference: "S.41, 43",
  },
  {
    id: "cb_2",
    question: "Are cross-border data transfers documented and assessed for compliance?",
    type: "yesNo",

  },
 
  {
    id: "cb_4",
    question:
      "In the list of “Types of Answers,” pick the type of personal data the organisations transfer outside Nigeria.",
    type: "radio",
  
    options: [
      {
        id: "cb_4_a",
        label: "Sensitive Personal Data.",
      },
      {
        id: "cb_4_b",
        label:
          "Non-Sensitive Personal Data.",
      },
    ]
  },
  {
    id: "cb_5",
    question:
      "Please select from the list “types of answers” column, the legal grounds upon which the organisation conducts cross-border data transfer (if any).",
    type: "radio",
    options: [
      {
        id: "cb_5_a",
        label: "Adequacy decision of the Commission in respect of the destination of the personal data.",
      },
      {
        id: "cb_5_b",
        label:
          "Cross-border transfer instrument approved by the Commission. ",
      },
      {
        id: "cb_5_c",
        label:
          "Fiduciary or Jural grounds in anyone of the applicable circumstances below:",
      },
    
    ],
    conditionalFields: [
      {
        showWhen: "cb_5_c",
        question: "Select all the Fiduciary or Jural grounds in anyone of the applicable circumstances below:",
        type: "multiSelect",
        options: [
          { id: "cb_5_c_a", label: "Data subject has provided and not withdrawn consent to such transfer after having been informed of the possible risks of such transfers for the data subject due to the absence of adequate protections." },
          { id: "cb_5_c_b", label: "Transfer is necessary for the performance of a contract to which a data subject is a party or in order to take steps at the request of a data subject, prior to entering into a contract." },
          { id: "cb_5_c_c", label: "Transfer is for the sole benefit of a data subject and — it is not reasonably practicable to obtain the consent of the data subject to that transfer, and if it were reasonably practicable to obtain such consent, the data subject would likely give it." },
          { id: "cb_5_c_d", label: "Transfer is necessary for important reasons of public interest." },
          { id: "cb_5_c_e", label: "Transfer is necessary for the establishment, exercise, or defence of legal claims." },
          { id: "cb_5_c_f", label: "Transfer is necessary to protect the vital interests of a data subject or of other persons, where a data subject is physically or legally incapable of giving consent." },
        ],
      },
     
    ],
  },

   {
    id: "cb_3",
    question: "Which countries are these transfers made to? (Select Countries)",
    type: "multiSelect",
    reference: "S.41, 43",
    options: [
      { id: "cb_3_Afghanistan", label: "🇦🇫 Afghanistan" },
      { id: "cb_3_Albania", label: "🇦🇱 Albania" },
      { id: "cb_3_Algeria", label: "🇩🇿 Algeria" },
      { id: "cb_3_Andorra", label: "🇦🇩 Andorra" },
      { id: "cb_3_Angola", label: "🇦🇴 Angola" },
      { id: "cb_3_AntiguaBarbuda", label: "🇦🇬 Antigua & Barbuda" },
      { id: "cb_3_Argentina", label: "🇦🇷 Argentina" },
      { id: "cb_3_Armenia", label: "🇦🇲 Armenia" },
      { id: "cb_3_Australia", label: "🇦🇺 Australia" },
      { id: "cb_3_Austria", label: "🇦🇹 Austria" },
      { id: "cb_3_Azerbaijan", label: "🇦🇿 Azerbaijan" },
      { id: "cb_3_Bahamas", label: "🇧🇸 Bahamas" },
      { id: "cb_3_Bahrain", label: "🇧🇭 Bahrain" },
      { id: "cb_3_Bangladesh", label: "🇧🇩 Bangladesh" },
      { id: "cb_3_Barbados", label: "🇧🇧 Barbados" },
      { id: "cb_3_Belarus", label: "🇧🇾 Belarus" },
      { id: "cb_3_Belgium", label: "🇧🇪 Belgium" },
      { id: "cb_3_Belize", label: "🇧🇿 Belize" },
      { id: "cb_3_Benin", label: "🇧🇯 Benin" },
      { id: "cb_3_Bhutan", label: "🇧🇹 Bhutan" },
      { id: "cb_3_Bolivia", label: "🇧🇴 Bolivia" },
      { id: "cb_3_BosniaHerzegovina", label: "🇧🇦 Bosnia & Herzegovina" },
      { id: "cb_3_Botswana", label: "🇧🇼 Botswana" },
      { id: "cb_3_Brazil", label: "🇧🇷 Brazil" },
      { id: "cb_3_Brunei", label: "🇧🇳 Brunei" },
      { id: "cb_3_Bulgaria", label: "🇧🇬 Bulgaria" },
      { id: "cb_3_BurkinaFaso", label: "🇧🇫 Burkina Faso" },
      { id: "cb_3_Burundi", label: "🇧🇮 Burundi" },
      { id: "cb_3_Cambodia", label: "🇰🇭 Cambodia" },
      { id: "cb_3_Cameroon", label: "🇨🇲 Cameroon" },
      { id: "cb_3_Canada", label: "🇨🇦 Canada" },
      { id: "cb_3_CapeVerde", label: "🇨🇻 Cape Verde" },
      { id: "cb_3_CentralAfricanRepublic", label: "🇨🇫 Central African Republic" },
      { id: "cb_3_Chad", label: "🇹🇩 Chad" },
      { id: "cb_3_Chile", label: "🇨🇱 Chile" },
      { id: "cb_3_China", label: "🇨🇳 China" },
      { id: "cb_3_Colombia", label: "🇨🇴 Colombia" },
      { id: "cb_3_Comoros", label: "🇰🇲 Comoros" },
      { id: "cb_3_Congo", label: "🇨🇬 Congo" },
      { id: "cb_3_CostaRica", label: "🇨🇷 Costa Rica" },
      { id: "cb_3_CôtedIvoire", label: "🇨🇮 Côte d'Ivoire" },
      { id: "cb_3_Croatia", label: "🇭🇷 Croatia" },
      { id: "cb_3_Cuba", label: "🇨🇺 Cuba" },
      { id: "cb_3_Cyprus", label: "🇨🇾 Cyprus" },
      { id: "cb_3_Czechia", label: "🇨🇿 Czechia" },
      { id: "cb_3_Denmark", label: "🇩🇰 Denmark" },
      { id: "cb_3_Djibouti", label: "🇩🇯 Djibouti" },
      { id: "cb_3_Dominica", label: "🇩🇲 Dominica" },
      { id: "cb_3_DominicanRepublic", label: "🇩🇴 Dominican Republic" },
      { id: "cb_3_Ecuador", label: "🇪🇨 Ecuador" },
      { id: "cb_3_Egypt", label: "🇪🇬 Egypt" },
      { id: "cb_3_ElSalvador", label: "🇸🇻 El Salvador" },
      { id: "cb_3_EquatorialGuinea", label: "🇬🇶 Equatorial Guinea" },
      { id: "cb_3_Eritrea", label: "🇪🇷 Eritrea" },
      { id: "cb_3_Estonia", label: "🇪🇪 Estonia" },
      { id: "cb_3_Eswatini", label: "🇸🇿 Eswatini" },
      { id: "cb_3_Ethiopia", label: "🇪🇹 Ethiopia" },
      { id: "cb_3_FijiIslands", label: "🇫🇯 Fiji Islands" },
      { id: "cb_3_Finland", label: "🇫🇮 Finland" },
      { id: "cb_3_France", label: "🇫🇷 France" },
      { id: "cb_3_Gabon", label: "🇬🇦 Gabon" },
      { id: "cb_3_Gambia", label: "🇬🇲 Gambia" },
      { id: "cb_3_Georgia", label: "🇬🇪 Georgia" },
      { id: "cb_3_Germany", label: "🇩🇪 Germany" },
      { id: "cb_3_Ghana", label: "🇬🇭 Ghana" },
      { id: "cb_3_Greece", label: "🇬🇷 Greece" },
      { id: "cb_3_Grenada", label: "🇬🇩 Grenada" },
      { id: "cb_3_Guatemala", label: "🇬🇹 Guatemala" },
      { id: "cb_3_Guinea", label: "🇬🇳 Guinea" },
      { id: "cb_3_GuineaBissau", label: "🇬🇼 Guinea-Bissau" },
      { id: "cb_3_Guyana", label: "🇬🇾 Guyana" },
      { id: "cb_3_Haiti", label: "🇭🇹 Haiti" },
      { id: "cb_3_Honduras", label: "🇭🇳 Honduras" },
      { id: "cb_3_Hungary", label: "🇭🇺 Hungary" },
      { id: "cb_3_Iceland", label: "🇮🇸 Iceland" },
      { id: "cb_3_India", label: "🇮🇳 India" },
      { id: "cb_3_Indonesia", label: "🇮🇩 Indonesia" },
      { id: "cb_3_Iran", label: "🇮🇷 Iran" },
      { id: "cb_3_Iraq", label: "🇮🇶 Iraq" },
      { id: "cb_3_Ireland", label: "🇮🇪 Ireland" },
      { id: "cb_3_Israel", label: "🇮🇱 Israel" },
      { id: "cb_3_Italy", label: "��🇹 Italy" },
      { id: "cb_3_Jamaica", label: "🇯🇲 Jamaica" },
      { id: "cb_3_Japan", label: "🇯�� Japan" },
      { id: "cb_3_Jordan", label: "🇯🇴 Jordan" },
      { id: "cb_3_Kazakhstan", label: "��🇿 Kazakhstan" },
      { id: "cb_3_Kenya", label: "🇰🇪 Kenya" },
      { id: "cb_3_Kiribati", label: "🇰🇮 Kiribati" },
      { id: "cb_3_Kuwait", label: "🇰🇼 Kuwait" },
      { id: "cb_3_Kyrgyzstan", label: "🇰🇬 Kyrgyzstan" },
      { id: "cb_3_Laos", label: "🇱🇦 Laos" },
      { id: "cb_3_Latvia", label: "🇱🇻 Latvia" },
      { id: "cb_3_Lebanon", label: "🇱🇧 Lebanon" },
      { id: "cb_3_Lesotho", label: "🇱🇸 Lesotho" },
      { id: "cb_3_Liberia", label: "🇱🇷 Liberia" },
      { id: "cb_3_Libya", label: "🇱🇾 Libya" },
      { id: "cb_3_Liechtenstein", label: "🇱🇮 Liechtenstein" },
      { id: "cb_3_Lithuania", label: "🇱🇹 Lithuania" },
      { id: "cb_3_Luxembourg", label: "🇱🇺 Luxembourg" },
      { id: "cb_3_Madagascar", label: "🇲🇬 Madagascar" },
      { id: "cb_3_Malawi", label: "🇲🇼 Malawi" },
      { id: "cb_3_Malaysia", label: "🇲🇾 Malaysia" },
      { id: "cb_3_Maldives", label: "🇲🇭 Maldives" },
      { id: "cb_3_Mali", label: "🇲🇱 Mali" },
      { id: "cb_3_Malta", label: "🇲🇹 Malta" },
      { id: "cb_3_MarshallIslands", label: "🇲🇭 Marshall Islands" },
      { id: "cb_3_Mauritania", label: "🇲🇷 Mauritania" },
      { id: "cb_3_Mauritius", label: "🇲🇺 Mauritius" },
      { id: "cb_3_Mexico", label: "🇲🇽 Mexico" },
      { id: "cb_3_Micronesia", label: "🇫🇲 Micronesia" },
      { id: "cb_3_Moldova", label: "🇲🇩 Moldova" },
      { id: "cb_3_Monaco", label: "🇲🇨 Monaco" },
      { id: "cb_3_Mongolia", label: "🇲🇳 Mongolia" },
      { id: "cb_3_Montenegro", label: "🇲🇪 Montenegro" },
      { id: "cb_3_Morocco", label: "🇲🇦 Morocco" },
      { id: "cb_3_Mozambique", label: "🇲🇿 Mozambique" },
      { id: "cb_3_Myanmar", label: "🇲🇲 Myanmar" },
      { id: "cb_3_Namibia", label: "🇳🇦 Namibia" },
      { id: "cb_3_Nauru", label: "��🇷 Nauru" },
      { id: "cb_3_Nepal", label: "🇳🇵 Nepal" },
      { id: "cb_3_Netherlands", label: "🇳🇱 Netherlands" },
      { id: "cb_3_NewZealand", label: "🇳🇿 New Zealand" },
      { id: "cb_3_Nicaragua", label: "🇳🇮 Nicaragua" },
      { id: "cb_3_Niger", label: "🇳🇪 Niger" },
      { id: "cb_3_Nigeria", label: "🇳🇬 Nigeria" },
      { id: "cb_3_NorthKorea", label: "🇰🇵 North Korea" },
      { id: "cb_3_NorthMacedonia", label: "🇲🇰 North Macedonia" },
      { id: "cb_3_Norway", label: "🇳🇴 Norway" },
      { id: "cb_3_Oman", label: "🇴🇲 Oman" },
      { id: "cb_3_Pakistan", label: "🇵🇰 Pakistan" },
      { id: "cb_3_Palau", label: "🇵🇼 Palau" },
      { id: "cb_3_Palestine", label: "🇵🇸 Palestine" },
      { id: "cb_3_Panama", label: "🇵🇦 Panama" },
      { id: "cb_3_PapuaNewGuinea", label: "🇵�� Papua New Guinea" },
      { id: "cb_3_Paraguay", label: "🇵🇾 Paraguay" },
      { id: "cb_3_Peru", label: "🇵🇪 Peru" },
      { id: "cb_3_Philippines", label: "🇵🇭 Philippines" },
      { id: "cb_3_Poland", label: "🇵🇱 Poland" },
      { id: "cb_3_Portugal", label: "🇵🇹 Portugal" },
      { id: "cb_3_Qatar", label: "🇶�� Qatar" },
      { id: "cb_3_Romania", label: "🇷🇴 Romania" },
      { id: "cb_3_Russia", label: "🇷🇺 Russia" },
      { id: "cb_3_Rwanda", label: "🇷🇼 Rwanda" },
      { id: "cb_3_SaintKittsNevis", label: "🇰🇳 Saint Kitts & Nevis" },
      { id: "cb_3_SaintLucia", label: "🇱🇨 Saint Lucia" },
      { id: "cb_3_SaintVincentGrenadines", label: "🇻🇨 Saint Vincent & Grenadines" },
      { id: "cb_3_Samoa", label: "🇼🇸 Samoa" },
      { id: "cb_3_SanMarino", label: "🇸🇲 San Marino" },
      { id: "cb_3_SãoToméPríncipe", label: "🇸🇹 São Tomé & Príncipe" },
      { id: "cb_3_SaudiArabia", label: "🇸🇦 Saudi Arabia" },
      { id: "cb_3_Senegal", label: "🇸🇳 Senegal" },
      { id: "cb_3_Serbia", label: "🇷�� Serbia" },
      { id: "cb_3_Seychelles", label: "🇸🇨 Seychelles" },
      { id: "cb_3_SierraLeone", label: "🇸🇱 Sierra Leone" },
      { id: "cb_3_Singapore", label: "🇸🇬 Singapore" },
      { id: "cb_3_Slovakia", label: "🇸🇰 Slovakia" },
      { id: "cb_3_Slovenia", label: "🇸🇮 Slovenia" },
      { id: "cb_3_SolomonIslands", label: "🇸🇧 Solomon Islands" },
      { id: "cb_3_Somalia", label: "🇸🇴 Somalia" },
      { id: "cb_3_SouthAfrica", label: "🇿🇦 South Africa" },
      { id: "cb_3_SouthKorea", label: "🇰🇷 South Korea" },
      { id: "cb_3_SouthSudan", label: "🇸🇸 South Sudan" },
      { id: "cb_3_Spain", label: "🇪🇸 Spain" },
      { id: "cb_3_SriLanka", label: "🇱🇰 Sri Lanka" },
      { id: "cb_3_Sudan", label: "🇸🇩 Sudan" },
      { id: "cb_3_Suriname", label: "🇸🇷 Suriname" },
      { id: "cb_3_Sweden", label: "🇸🇪 Sweden" },
      { id: "cb_3_Switzerland", label: "🇨🇭 Switzerland" },
      { id: "cb_3_Syria", label: "🇸🇾 Syria" },
      { id: "cb_3_Taiwan", label: "🇹🇼 Taiwan" },
      { id: "cb_3_Tajikistan", label: "🇹🇯 Tajikistan" },
      { id: "cb_3_Tanzania", label: "🇹🇿 Tanzania" },
      { id: "cb_3_Thailand", label: "🇹🇭 Thailand" },
      { id: "cb_3_TimorLeste", label: "🇹🇱 Timor-Leste" },
      { id: "cb_3_Togo", label: "🇹🇬 Togo" },
      { id: "cb_3_Tonga", label: "🇹🇴 Tonga" },
      { id: "cb_3_TrinidadTobago", label: "🇹🇹 Trinidad & Tobago" },
      { id: "cb_3_Tunisia", label: "🇹🇳 Tunisia" },
      { id: "cb_3_Turkey", label: "🇹🇷 Turkey" },
      { id: "cb_3_Turkmenistan", label: "🇹�� Turkmenistan" },
      { id: "cb_3_Tuvalu", label: "🇹🇻 Tuvalu" },
      { id: "cb_3_Uganda", label: "🇺🇬 Uganda" },
      { id: "cb_3_Ukraine", label: "🇺🇦 Ukraine" },
      { id: "cb_3_UnitedArabEmirates", label: "🇦🇪 United Arab Emirates" },
      { id: "cb_3_UnitedKingdom", label: "🇬🇧 United Kingdom" },
      { id: "cb_3_UnitedStates", label: "🇺🇸 United States" },
      { id: "cb_3_Uruguay", label: "🇺🇾 Uruguay" },
      { id: "cb_3_Uzbekistan", label: "🇺🇿 Uzbekistan" },
      { id: "cb_3_Vanuatu", label: "��🇺 Vanuatu" },
      { id: "cb_3_VaticanCity", label: "🇻🇦 Vatican City" },
      { id: "cb_3_Venezuela", label: "🇻🇪 Venezuela" },
      { id: "cb_3_Vietnam", label: "🇻🇳 Vietnam" },
      { id: "cb_3_Yemen", label: "🇾🇪 Yemen" },
      { id: "cb_3_Zambia", label: "🇿🇲 Zambia" },
      { id: "cb_3_Zimbabwe", label: "🇿🇼 Zimbabwe" },
    ],
  },
]

// Data Processors
export const dataProcessorsQuestions: FormQuestion[] = [
  {
    id: "dp_1",
    question: "Does your organisation use data processors in carrying out its activities?",
    type: "yesNo",
    reference: "S.29",
  },
  {
    id: "dp_2",
    question: "Is there a written contract between your organisation and the processors?",
    type: "yesNo",
    reference: "S.29(2)",
  },

  {
    id: "dp_3",
    question:
      "Please select from the list the type of acts that describe your organisations due diligence in engaging data processors",
    type: "multiSelect",
    options: [
      { id: "dp_3_a", label: "Implements Data Processing Agreement." },
      { id: "dp_3_b", label: "Monitors ongoing compliance." },
      { id: "dp_3_c", label: "Processors must assist with data subject rights requests." },
      { id: "dp_3_d", label: "Obtains evidence of Certifications or Standards." },
      { id: "dp_3_e", label: "Secures methods of storage or transfer of data." },
      { id: "dp_3_f", label: "Ensures Involvement 	of Processor in the DPIA process." },
       { id: "dp_3_g", label: "Implements Clear 	Incident Response protocols" },
      { id: "dp_3_h", label: "Confirms compliance of sub-processor (where applicable) with obtaining proof of compliance from the processor regarding the sub-processor." },
  
    ],
  },
   {
    id: "dp_4",
    question:
      "Please select from the list and choose the type of facts that describe your organisations due diligence after termination of data processing agreement. The organisation ensures:",
    type: "multiSelect",
    options: [
      { id: "dp_4_a", label: "Data deletion (with confirmation of deletion)." },
      { id: "dp_4_b", label: "Data Return." },
      { id: "dp_4_c", label: "Anonymisation of data." },
      { id: "dp_4_d", label: "Audit records (assessed by your organisation)." },
      { id: "dp_4_e", label: "Revocation of access to systems and data." },
     
  
    ],
  },
]

// Document Upload
export const documentUploadQuestions: FormQuestion[] = [
  {
    id: "doc_upload_privacy_policy",
    question: "Privacy Policy",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "doc_upload_info_security",
    question: "Information Security Policy",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "doc_upload_data_retention",
    question: "Data Retention Schedule and Policy",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "doc_upload_personal_data_inventory",
    question: "Personal Data Inventory",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "doc_upload_employee_privacy",
    question: "Employee Privacy Policy",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "doc_upload_processing_records",
    question: "Records of Processing Activities",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
  {
    id: "doc_upload_interim_report",
    question: "Interim Data Privacy Report",
    type: "file",
    placeholder: "Upload/Attach documentation (PDF, Image, etc.)",
  },
]

// Form Sections Configuration
export const carFormSections: FormSection[] = [
  { id: "summary", title: "Summary", shortTitle: "Summary", icon: "document", type: "document" },
  {
    id: "corporate_info",
    title: "Corporate Information",
    shortTitle: "Corporate Information",
    icon: "edit",
    type: "form",
    questions: corporateInfoFields,
  },
  {
    id: "people_process",
    title: "PART 1: People & Process (Governance)",
    shortTitle: "People & Process",
    icon: "edit",
    type: "form",
    questions: peopleProcessQuestions,
  },
  {
    id: "principles",
    title: "PART 1(B): Principles of Data Protection",
    shortTitle: "Principle of Data Protection",
    icon: "edit",
    type: "form",
    questions: principlesQuestions,
  },
  {
    id: "lawful_bases",
    title: "PART 1(C): Lawful Bases For Processing",
    shortTitle: "Lawful Bases",
    icon: "edit",
    type: "form",
    questions: lawfulBasesQuestions,
  },
  {
    id: "profiling",
    title: "PART 1(D): Profiling & Marketing",
    shortTitle: "Profiling & Marketing",
    icon: "edit",
    type: "form",
    questions: profilingMarketingQuestions,
  },
  {
    id: "security_controls",
    title: "PART 2: TECHNOLOGY (DATA SECURITY CONTROLS AND STANDARDS) - Data Security Controls & Standards",
    shortTitle: "Data Processing & Access",
    icon: "edit",
    type: "form",
    questions: dataSecurityControlsQuestions,
  },
  {
    id: "access_control",
    title: "PART 2: TECHNOLOGY (DATA SECURITY CONTROLS AND STANDARDS) - Data Access Control",
    shortTitle: "Access Control",
    icon: "edit",
    type: "form",
    questions: dataAccessControlQuestions,
  },
  {
    id: "data_access_control_business_continuity",
    title: "PART 2: TECHNOLOGY (DATA SECURITY CONTROLS AND STANDARDS) - Data Access Control and Business Continuity",
    shortTitle: "Access Control & BC",
    icon: "edit",
    type: "form",
    questions: accessControlQuestions,

  },
  {
    id: "data_security",
    title: "PART 2: TECHNOLOGY (DATA SECURITY CONTROLS AND STANDARDS) - Data Security",
    shortTitle: "Data Security",
    icon: "edit",
    type: "form",
    questions: dataSecurityQuestions,
  },
  {
    id: "data_privacy_assesment",
    title: "PART 3: ACCOUNTABILITY AND BASIC RISK EVALUATION - Data Privacy Impact Assessment",
    shortTitle: "Data Privacy Impact Assessment",
    icon: "edit",
    type: "form",
    questions: dataPrivacyImpactassement,
  },
    {
    id: "legitimate_interest",
    title: "PART 3: ACCOUNTABILITY AND BASIC RISK EVALUATION - Legitimate Interest Assessment",
    shortTitle: "Legitimate Interest",
    icon: "edit",
    type: "form",
    questions: legitimateInterestQuestions,
  },
  {
    id: "accountability_record",
    title: "PART 3: ACCOUNTABILITY AND BASIC RISK EVALUATION - Accountability & Record of Processing",
    shortTitle: "Record of Processing",
    icon: "edit",
    type: "form",
    questions: accountabilityRecordQuestions,
  },

  {
    id: "cross_border",
    title: "PART 4: CROSS-BORDER DATA TRANSFER",
    shortTitle: "Cross-Border Data Transfer",
    icon: "edit",
    type: "form",
    questions: crossBorderQuestions,
  },
  {
    id: "data_processors",
    title: "PART 5: DATA PROCESSORS",
    shortTitle: "Data Processors",
    icon: "edit",
    type: "form",
    questions: dataProcessorsQuestions,
  },
  {
    id: "document_upload",
    title: "Document Upload",
    shortTitle: "Document Upload",
    icon: "document",
    type: "form",
    questions: documentUploadQuestions,
  },
  { id: "report", title: "Report", shortTitle: "Report", icon: "document", type: "document" },
  { id: "certificate", title: "Certificate", shortTitle: "Certificate", icon: "certificate", type: "document" },
]

// Mock submission data
export const mockCARSubmission: FormSubmission = {
  id: "car_001",
  formId: "car_form",
  clientId: "client_001",
  status: "flagged",
  data: {
    orgName: "John Doe Enterprise",
    address: "John Doe Enterprise",
    phone: "080 000 0000 000",
    email: "johndoeenterprise@gmail.com",
    dpoName: "John Doe",
    dpoEmail: "johndoe@gmail.com",
    dpcoName: "John Doe",
    dpcoEmail: "johndoeenterprise@gmail.com",
    estimatedDataSubjects: "10000",
    sector: "Health",
    pp_1: "yes",
    pp_1_option: "REG-2024-001234",
    pp_2: "yes",
    pp_3: "consultant",
    pp_4: "no",
    pp_5: "yes",
    pp_5_option: "ACC-2024-5678",
    pp_6: "yes",
    pp_7: "yes",
    pp_7_option: "24 CPD Credits",
    pdp_1: true,
    pdp_2: true,
    pdp_5: true,
  },
  flaggedFields: ["address", "email"],
  reviews: [
    {
      id: "review_001",
      auditorName: "Maria Jones",
      auditorAvatar: "/professional-woman-glasses.png",
      date: "25 April 2023",
      time: "12:34 PM",
      fieldId: "address",
      comments: [
        "1. The company address is not well stated. Kindly add a land mark.",
        "2. Kindly provide an email address e.g example@domain.com",
      ],
    },
    {
      id: "review_002",
      auditorName: "Maria Jones",
      auditorAvatar: "/professional-woman-glasses.png",
      date: "25 April 2023",
      time: "12:34 PM",
      comments: [
        "Please select from the checklist below, the type of facts that describe the organisation's alignment with the principles of data protection. (By its written policy and in actual practice as observed during an audit of all its data processing platforms and practices, data processing in the organisation follows the principles of data protection on the ground that):",
      ],
    },
  ],
  reportUrl: "/sample-report.pdf",
  certificateUrl: "/sample-certificate.pdf",
  submittedAt: "2023-04-20T10:00:00Z",
  updatedAt: "2023-04-25T12:34:00Z",
  createdAt: "2023-04-15T09:00:00Z",
}

// Calculate section progress with comprehensive question type validation
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

      case "assessmentTable":
        // Assessment table is answered if BOTH material info AND assessment are filled
        // This ensures the section can't be 100% without completing the assessment
        {
          const materialInfo = data[`${q.id}_material`]
          const assessment = data[`${q.id}_assessment`]
          
          // Both material info AND assessment must be filled for this to count as answered
          const hasMaterialInfo = materialInfo !== undefined && materialInfo !== null && materialInfo !== ""
          const hasAssessment = assessment !== undefined && assessment !== null && assessment !== ""
          
          if (hasMaterialInfo && hasAssessment) {
            isAnswered = true
          }
        }
        break

      case "radioWithTextarea":
        // Radio with textarea is answered if option selected AND reason provided (if required)
        // Each option has its own reason field: ${q.id}_${selectedOption}_reason
        {
          const selectedValue = data[q.id]
          if (selectedValue !== undefined && selectedValue !== null && selectedValue !== "") {
            if (q.requiresReason) {
              const reasonKey = `${q.id}_${selectedValue}_reason`
              const reason = data[reasonKey]
              if (reason !== undefined && reason !== null && reason !== "") {
                isAnswered = true
              }
            } else {
              isAnswered = true
            }
          }
        }
        break

      case "checkboxWithTextarea":
        // Checkbox with textarea is answered if at least one option selected AND reason provided (if required)
        {
          const hasSelection = q.options?.some((opt) => data[opt.id] === true)
          if (hasSelection) {
            if (q.requiresReason) {
              const reason = data[`${q.id}_reason`]
              if (reason !== undefined && reason !== null && reason !== "") {
                isAnswered = true
              }
            } else {
              isAnswered = true
            }
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
