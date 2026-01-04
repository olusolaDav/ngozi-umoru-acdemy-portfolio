// Data Privacy Impact Assessment (DPIA) Form Data
// Based on NDP Act-GAID DPIA Template

export type QuestionType =
  | "text"
  | "textarea"
  | "yesNo"
  | "yesNoWithOption"
  | "staffConsultant"
  | "checkbox"
  | "multiSelect"
  | "radio"
  | "file"
  | "table"
  | "assessmentTable"
  | "radioWithTextarea"
  | "checkboxWithTextarea"

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
  options?: { id: string; label: string; description?: string }[]
  conditionalField?: {
    showWhen: string
    label: string
    placeholder?: string
  }
  conditionalFields?: {
    showWhen: string
    question: string
    type: "text" | "multiSelect" | "textarea"
    placeholder?: string
    options?: { id: string; label: string }[]
  }[]
  columns?: TableColumn[]
  rows?: number
  // For assessmentTable type
  whatToNote?: string
  assessmentGuidance?: string
  // For radioWithTextarea type
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

export interface FormReview {
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
  reviews: FormReview[]
  reportUrl?: string
  submittedAt?: string
  updatedAt: string
  createdAt: string
}

// ============================================================================
// SECTION 1: GENERAL BACKGROUND
// ============================================================================
export const generalBackgroundQuestions: FormQuestion[] = [
  {
    id: "gb_1",
    question: "General Background - Material Information",
    type: "assessmentTable",
    whatToNote: "Highlight the central work of the organisation, for processing of personal data and the major reasons for carrying out a DPIA.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. if lack of material information on purpose limitation should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter material information about the organisation's data processing activities and reasons for DPIA...",
  },
]

// ============================================================================
// SECTION 2: NATURE OF ENVISAGED (OR ONGOING) PROCESSING
// ============================================================================
export const natureOfProcessingQuestions: FormQuestion[] = [
  {
    id: "nop_1",
    question: "Will data be processed automatically (e.g. by software) or manually (e.g. by people)?",
    type: "textarea",
    placeholder: "Describe the processing method...",
  },
  {
    id: "nop_2",
    question: "What specific areas or types of data will be processed (e.g. customer data, employee data)?",
    type: "textarea",
    placeholder: "List the types of data to be processed...",
  },
  {
    id: "nop_3",
    question: "Who will this data be about (e.g. all customers, specific employee groups)?",
    type: "textarea",
    placeholder: "Describe the data subjects...",
  },
  {
    id: "nop_4",
    question: "Is there a risk of the processing exceeding this intended scope?",
    type: "textarea",
    placeholder: "Assess the scope risk...",
  },
  {
    id: "nop_5",
    question: "Will any third-party companies be involved in processing the data?",
    type: "textarea",
    placeholder: "List any third parties involved...",
  },
  {
    id: "nop_6",
    question: "Will this processing involve sending data to other countries (cross-border transfers)?",
    type: "textarea",
    placeholder: "Describe any cross-border transfers...",
  },
  {
    id: "nop_7",
    question: "If data is transferred, what legal justification exists (e.g. contractual safeguard)?",
    type: "textarea",
    placeholder: "State the legal justification...",
  },
  {
    id: "nop_8",
    question: "Considering the processing method and data types, what are the potential risks to data subjects (e.g. unauthorised access, discrimination)?",
    type: "textarea",
    placeholder: "Identify potential risks...",
  },
  {
    id: "nop_9",
    question: "What specific types of data will be processed (e.g., names, email addresses, financial data)?",
    type: "textarea",
    placeholder: "List specific data types...",
  },
  {
    id: "nop_10",
    question: "How many people will be affected by this data processing (estimated number)? You can reference similar situations if there are no existing numbers.",
    type: "textarea",
    placeholder: "Estimate the number of affected individuals...",
  },
  {
    id: "nop_assessment",
    question: "Nature of Processing - Assessment",
    type: "assessmentTable",
    whatToNote: "Review all the information provided above about the nature of envisaged processing.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. lack of information on the capabilities or the processing medium in terms of collection of data, storage, access to data points or personal data files should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 3: THE LAWFUL BASIS AND CONTEXT OF PROCESSING
// ============================================================================
export const lawfulBasisContextQuestions: FormQuestion[] = [
  {
    id: "lbc_1",
    question: "State the lawful basis for processing personal data such as consent, legal obligation, vital interest, legitimate interest and public interest. Give reasons for choosing your lawful basis for the processing.",
    type: "textarea",
    placeholder: "State your lawful basis and reasons...",
  },
  {
    id: "lbc_2",
    question: "Additional information as to any prior relationship with the data subject will be helpful. Describe the class of data subjects targeted by the processing.",
    type: "textarea",
    placeholder: "Describe prior relationships and data subject classes...",
  },
  {
    id: "lbc_assessment",
    question: "Lawful Basis - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate the lawful basis and context of processing.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. lack of clear lawful basis and description of data subjects should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 4: NECESSITY AND PROPORTIONALITY
// ============================================================================
export const necessityProportionalityQuestions: FormQuestion[] = [
  {
    id: "np_1",
    question: "Explain why the chosen processing method is essential for achieving the legal reason you have for using the data.",
    type: "textarea",
    placeholder: "Explain necessity of processing method...",
  },
  {
    id: "np_2",
    question: "Briefly explain how it directly helps you achieve your goal.",
    type: "textarea",
    placeholder: "Explain how processing helps achieve your goal...",
  },
  {
    id: "np_3",
    question: "Describe how you will keep data secure and respect people's privacy while processing it.",
    type: "textarea",
    placeholder: "Describe security and privacy measures...",
  },
  {
    id: "np_4",
    question: "Mention practices common in democratic societies for data protection.",
    type: "textarea",
    placeholder: "List common data protection practices...",
  },
  {
    id: "np_5",
    question: "Briefly state if you considered alternative methods.",
    type: "textarea",
    placeholder: "Describe alternative methods considered...",
  },
  {
    id: "np_6",
    question: "Explain why these other methods would not be effective in achieving your legal purpose.",
    type: "textarea",
    placeholder: "Explain why alternatives are not effective...",
  },
  {
    id: "np_assessment",
    question: "Necessity and Proportionality - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate necessity and proportionality of the processing.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. lack of clear lawful basis and description of data subjects should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 5: CONSULTATION OF STAKEHOLDERS
// ============================================================================
export const stakeholderConsultationQuestions: FormQuestion[] = [
  {
    id: "sc_1",
    question: "Who are the stakeholders? The data subjects, Nigeria Data Protection Commission and the internal managers of the data processing (e.g. the Management level decision makers, Chief Information Security Officers, Data Protection Officers and users of the data processing medium).",
    type: "textarea",
    placeholder: "List all stakeholders...",
  },
  {
    id: "sc_2",
    question: "You may rely on surveys, carry out assessment, review instructions from Original Equipment Manufacturers and where necessary interact with them. Seek information on what can make the medium function optimally or malfunction. Seek information as to data Confidentiality, Integrity and Availability.",
    type: "textarea",
    placeholder: "Describe consultation methods and findings...",
  },
  {
    id: "sc_assessment",
    question: "Stakeholder Consultation - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate stakeholder consultation process.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. lack of rigorous consultation on the Confidentiality, Integrity and Availability of data should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 6: IDENTIFIED/POTENTIAL VULNERABILITIES
// ============================================================================
export const vulnerabilitiesQuestions: FormQuestion[] = [
  {
    id: "vul_1",
    question: "Account for every possible risk including but not limited to possible inadvertence on the part of data subjects. State the risks to Data Confidentiality, Integrity and Availability.",
    type: "textarea",
    placeholder: "List all possible risks to data CIA...",
  },
  {
    id: "vul_2",
    question: "State the Data Subjects' Vulnerability Indexes (DSVI) under the NDP ACT-GAID that may apply in the processing.",
    type: "textarea",
    placeholder: "State applicable DSVI...",
  },
  {
    id: "vul_3",
    question: "Examine efficiency or promptness in remediation process for data subjects and disaster recovery. Efficiency may be measured by the time it takes a complaint to be resolved, the satisfaction of the data subject and usefulness of the resolution taking into consideration the urgency of the complaint at the material time.",
    type: "textarea",
    placeholder: "Describe remediation efficiency...",
  },
  {
    id: "vul_4",
    question: "Examine the technical capacity of persons involved in data processing - whether they are conversant with technical and organisational measures for data protection that are relevant to the level of their involvement.",
    type: "textarea",
    placeholder: "Assess technical capacity of personnel...",
  },
  {
    id: "vul_5",
    question: "E.g. data rectification or data subject access request towards: admission into university, travelling, seeking medical service or preventing fraud or alleviating deprivation should be addressed urgently. A resolution which fails to address the urgency in cases such as the above lacks merit.",
    type: "textarea",
    placeholder: "Provide examples of urgent data subject requests...",
  },
  {
    id: "vul_assessment",
    question: "Vulnerabilities - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate identified vulnerabilities.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. Deficiency in the principles of data privacy and protection or lack of prompt remediation of data subjects' complaints or resilient disaster recovery plan should be treated as high vulnerability. This should make the processing score very low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 7: RISK ASSESSMENT (Degree of Risk & Severity of Harm)
// ============================================================================
export const riskAssessmentQuestions: FormQuestion[] = [
  {
    id: "risk_degree",
    question: "Degree of Risk and Potential Harm to Data Subjects - taking into consideration the protocols to be followed in the processing.",
    type: "radioWithTextarea",
    options: [
      {
        id: "risk_remote",
        label: "REMOTE",
        description: "Because personally identifiable information is: lawfully in the public domain/it is limited to nominal contact information (name, phone number and email address)/contains no sensitive personal data/ adequate measures have been put in place to guarantee its Confidentiality, Integrity and Availability and it contains no decisive or ultimate credential for authenticating valuable transactions.",
      },
      {
        id: "risk_possible",
        label: "POSSIBLE",
        description: "It contains decisive or ultimate credential for authenticating valuable transactions. PII may be accessed through extra-ordinary measures. Extra-Ordinary measures are measures that are beyond the state of the art or contained in directives given under public interest to address a clear and present danger or measures given under vital interest of a data subject or a third party.",
      },
      {
        id: "risk_probable",
        label: "PROBABLE",
        description: "Because it involves covert or over access to personally identifiable information. May or may not contain decisive or ultimate credential for authenticating valuable transactions. PII may be accessed through simple or complex measures. Simple or complex measures are measures that are available through existing software or through directives that are issued under a routine legal obligation.",
      },
    ],
    requiresReason: true,
  },
  {
    id: "risk_severity",
    question: "Severity of harm - Choose the fact that approximates to your assessment of harm to data subjects.",
    type: "radioWithTextarea",
    options: [
      {
        id: "severity_marginal",
        label: "MARGINAL OR LOW",
        description: "Because the data processing does not involve sensitive personal data. The processing may not create any avenue through which the data subject may lose his or her life or livelihoods.",
      },
      {
        id: "severity_significant",
        label: "SIGNIFICANT OR MODERATE",
        description: "Because the data processing involves sensitive personal data or the processing may create avenue through which the data subject may lose some marginal fraction of his or her valuables.",
      },
      {
        id: "severity_grave",
        label: "GRAVE OR EXTREME OR ENORMOUS",
        description: "Because the data processing involves sensitive personal data, ultimate or decisive credentials. The processing may create an avenue through which the data subject may lose her life, all or substantial part of his or her livelihood.",
      },
    ],
    requiresReason: true,
  },
]

// ============================================================================
// SECTION 8: POTENTIAL DISPARATE OUTCOMES
// ============================================================================
export const disparateOutcomesQuestions: FormQuestion[] = [
  {
    id: "pdo_1",
    question: "Consider how data processing might intersect with other rights, particularly the right to human dignity. How can you mitigate risks to these rights?",
    type: "textarea",
    placeholder: "Describe intersection with other rights and mitigation...",
  },
  {
    id: "pdo_2",
    question: "For example, a survey of disadvantaged group for a good cause (e.g. free healthcare) could still lead to further stigmatisation if the data is handled by people with little sympathy or data security is not adequate.",
    type: "textarea",
    placeholder: "Provide examples of potential disparate outcomes...",
  },
  {
    id: "pdo_3",
    question: "Cameras used for security can also limit people's privacy, for example, the use of CCTV. These are deployed for security; however, this may infringe on the right to privacy or inhibit freedom of expression.",
    type: "textarea",
    placeholder: "Describe security vs privacy considerations...",
  },
  {
    id: "pdo_assessment",
    question: "Disparate Outcomes - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate potential disparate outcomes.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. if lack of material information on the intersection of the processing with other fundamental rights and freedoms that are closely associated with the processing should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 9: CROSS-BORDER DATA TRANSFER
// ============================================================================
export const crossBorderTransferQuestions: FormQuestion[] = [
  {
    id: "cbt_1",
    question: "Will Data Be Transferred Outside Nigeria?",
    type: "yesNo",
  },
  {
    id: "cbt_2",
    question: "If yes, specify the countries where the data may be transferred.",
    type: "textarea",
    placeholder: "List destination countries...",
  },
  {
    id: "cbt_3",
    question: "Indicate the legal justification for transferring data under Sections 41-42 of the NDP Act (e.g. consent, adequacy decisions by the NDPC).",
    type: "textarea",
    placeholder: "State legal justification...",
  },
  {
    id: "cbt_4",
    question: "If transferring to a country in respect of which the Commission has not made an adequacy decision, briefly describe the legal and technical safeguards in place to protect human rights in those countries, considering relevant international instruments like the United Nations Universal Declaration of Human Rights and relevant international covenants.",
    type: "textarea",
    placeholder: "Describe safeguards in place...",
  },
  {
    id: "cbt_5",
    question: "Mention if non-citizens have the same data protection rights as citizens in those countries.",
    type: "textarea",
    placeholder: "Describe rights of non-citizens...",
  },
  {
    id: "cbt_6",
    question: "Indicate if there are documented instances of systemic discrimination against vulnerable groups.",
    type: "textarea",
    placeholder: "Describe any documented discrimination...",
  },
  {
    id: "cbt_7",
    question: "Additional Applicable Laws - List any other relevant data protection laws or regulations that apply to the transfer, such as the ECOWAS Supplementary Act, African Union Convention, or the GDPR (if applicable).",
    type: "textarea",
    placeholder: "List additional applicable laws...",
  },
  {
    id: "cbt_8",
    question: "Data Subject Grievance Redress - Describe the specific mechanisms for data subjects to address any grievances related to data transfer (e.g. complaints, procedures).",
    type: "textarea",
    placeholder: "Describe grievance mechanisms...",
  },
  {
    id: "cbt_9",
    question: "Data Sovereignty Considerations - Explain the effectiveness of data sovereignty principles (keeping data within Nigeria) in this specific case. Consider if the data processing is for public service or inherently governmental function.",
    type: "textarea",
    placeholder: "Explain data sovereignty considerations...",
  },
  {
    id: "cbt_10",
    question: "State if (i) The processing may adversely impact national norms/initiatives on: Unity, Faith, Peace and Progress (ii) Loss of access to sovereign or public data for public good may undermine performance of government functions that are data driven. E.g. for security, economic and democratic development (iii) Data subjects may not be able to obtain immediate and effective remedy for violation of their data subjects rights in jurisdictions where their data may be processed.",
    type: "textarea",
    placeholder: "Assess impact on national norms and data subjects' remedies...",
  },
  {
    id: "cbt_11",
    question: "Data Security Risks - Assess any potential risks of data breaches in the transfer jurisdictions, considering actions by state or non-state actors.",
    type: "textarea",
    placeholder: "Assess data security risks in transfer jurisdictions...",
  },
  {
    id: "cbt_assessment",
    question: "Cross-Border Transfer - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate cross-border data transfer considerations.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required. E.g. lack of material information on the enjoyment of fundamental freedoms in line with international bill of rights should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 10: GENERAL EVALUATION OF THE INTERPLAY
// ============================================================================
export const generalEvaluationQuestions: FormQuestion[] = [
  {
    id: "ge_1",
    question: "Itemise the principles of data protection and data subjects' rights.",
    type: "textarea",
    placeholder: "List principles and rights...",
  },
  {
    id: "ge_2",
    question: "State succinctly the operation of each of the principles and rights in the data processing under assessment.",
    type: "textarea",
    placeholder: "Describe how each principle and right operates...",
  },
  {
    id: "ge_3",
    question: "E.g. The need for Lawfulness, Fairness and Transparency in data processing: There is a clear legal ground identified in the processing, the data subjects are not prejudiced and the material information relating to processing are given before, during and after processing to data subjects. Where a procedure of data processing does not mandate the giving of information to data subjects for overriding security reasons or in other circumstances where lawful derogation is permitted, the processing is still subject to statutory guidance or review by NDPC or to judicial proceedings.",
    type: "textarea",
    placeholder: "Provide example of principles in operation...",
  },
  {
    id: "ge_4",
    question: "It is important to state whether or not the data controller or data processor is accountable to NDPC by way of registration and by filing annual NDP Act Compliance Audit Returns.",
    type: "textarea",
    placeholder: "State accountability to NDPC...",
  },
  {
    id: "ge_assessment",
    question: "General Evaluation - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate the interplay of data processing, principles and data subjects' rights.",
    assessmentGuidance: "State in the column below whether or not the information available is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required, e.g. lack of material information on how EACH of the principles and rights operates within the context of the processing should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 11: RECOMMENDATIONS FOR MITIGATION OF IDENTIFIED RISKS
// ============================================================================
export const mitigationRecommendationsQuestions: FormQuestion[] = [
  {
    id: "mr_1",
    question: "Risks - List all the potential problems identified during the DPIA related to data privacy (e.g. data breaches, unauthorised access).",
    type: "textarea",
    placeholder: "List all identified risks...",
  },
  {
    id: "mr_2",
    question: "Mitigating Risks (Minimum Necessary) - For each risk, explain the simplest and most effective technical and organisational method you will take to reduce the risk (e.g. strong passwords, access controls).",
    type: "textarea",
    placeholder: "Describe minimum necessary mitigation measures...",
  },
  {
    id: "mr_3",
    question: "Insurance and Liability - While insurance might help with some issues, it does not replace your responsibility for protecting data.",
    type: "textarea",
    placeholder: "Describe insurance and liability considerations...",
  },
  {
    id: "mr_4",
    question: "Commitment to Fixing Problems - If the measures in point 2, do not completely eliminate the risk, explain how you will address any problems that can still occur (e.g., containment measures, indemnity, notifying affected individuals).",
    type: "textarea",
    placeholder: "Describe commitment to addressing residual risks...",
  },
  {
    id: "mr_5",
    question: "Sandboxes (Optional) - Evaluate if using a \"sandbox\" (a simulated environment) to test the data processing activity before full implementation would be beneficial.",
    type: "textarea",
    placeholder: "Evaluate sandbox testing option...",
  },
  {
    id: "mr_assessment",
    question: "Mitigation Recommendations - Assessment",
    type: "assessmentTable",
    whatToNote: "Evaluate recommendations for mitigation of identified risks.",
    assessmentGuidance: "State in the column below whether or not the information available in all the steps above is adequate. Provide succinct and cogent reasons for your assessment. Provide ratio (on the scale of 1 to 10) in relation to what is reasonably required, e.g. if lack of material information on purpose limitation should make the processing score low in this particular metric on the scale of 1 to 10.",
    placeholder: "Enter your assessment...",
  },
]

// ============================================================================
// SECTION 12: FINAL ASSESSMENT
// ============================================================================
export const finalAssessmentQuestions: FormQuestion[] = [
  {
    id: "fa_decision",
    question: "FINAL ASSESSMENT: Select the facts that best align with your assessment",
    type: "radioWithTextarea",
    options: [
      {
        id: "fa_go_ahead",
        label: "GO AHEAD",
        description: "Data Processing may be carried out because the risk is remote and the recommendations are adequate in addressing the risks in the unlikely event of their occurrence. This assessment particularly takes into account the concrete evidence of necessity and proportionality of the processing, the high degree of enjoyment of data subject rights, data subjects may reasonably expect that their personal data may be processed under the lawful basis recognised by the NDP Act.",
      },
      {
        id: "fa_modify",
        label: "MODIFY DATA PROCESSING",
        description: "Data Processing may be carried out subject to fundamental modifications as recommended in the DPIA. This assessment particularly takes into account the concrete evidence of necessity and proportionality of the processing and the high degree of enjoyment of data subject rights. Any derogation falls within the scope permitted under the 1999 Constitution of the Federal Republic of Nigeria or there are no derogations because the data subjects may reasonably expect that their personal data may be processed under the lawful basis recognised by the NDP Act.",
      },
      {
        id: "fa_stop",
        label: "STOP DATA PROCESSING",
        description: "Data Processing should be stopped on the ground that the general nature of the processing appears to be unnecessary and disproportionate. The derogations may fall outside the scope permitted under 1999 Constitution of the Federal Republic of Nigeria. This assessment also takes into consideration other less intrusive methods of data processing, inherent risks and disparate outcomes of the processing.",
      },
    ],
    requiresReason: true,
  },
  {
    id: "fa_frequency",
    question: "FREQUENCY OF REVIEW: State how frequently the DPIA should be reviewed and give succinct and cogent reasons for your choice.",
    type: "checkboxWithTextarea",
    options: [
      { id: "fa_freq_monthly", label: "Monthly" },
      { id: "fa_freq_bimonthly", label: "Bi-Monthly" },
      { id: "fa_freq_quarterly", label: "Quarterly" },
      { id: "fa_freq_twice_yearly", label: "2 Times in a Year" },
      { id: "fa_freq_annually", label: "Annually" },
      { id: "fa_freq_once_2years", label: "Once in 2 Years" },
      { id: "fa_freq_lifecycle", label: "Once in the lifecycle of the Data Processing" },
    ],
    requiresReason: true,
  },
]

// ============================================================================
// FORM SECTIONS CONFIGURATION
// ============================================================================
export const dpiaFormSections: FormSection[] = [
  {
    id: "summary",
    title: "Summary",
    shortTitle: "Summary",
    icon: "document",
    type: "document",
  },
  {
    id: "general_background",
    title: "GENERAL BACKGROUND",
    shortTitle: "General Background",
    icon: "edit",
    type: "form",
    questions: generalBackgroundQuestions,
  },
  {
    id: "nature_of_processing",
    title: "NATURE OF ENVISAGED (OR ONGOING) PROCESSING",
    shortTitle: "Nature of Processing",
    icon: "edit",
    type: "form",
    questions: natureOfProcessingQuestions,
  },
  {
    id: "lawful_basis_context",
    title: "THE LAWFUL BASIS AND CONTEXT OF PROCESSING",
    shortTitle: "Lawful Basis & Context",
    icon: "edit",
    type: "form",
    questions: lawfulBasisContextQuestions,
  },
  {
    id: "necessity_proportionality",
    title: "NECESSITY AND PROPORTIONALITY",
    shortTitle: "Necessity & Proportionality",
    icon: "edit",
    type: "form",
    questions: necessityProportionalityQuestions,
  },
  {
    id: "stakeholder_consultation",
    title: "CONSULTATION OF STAKEHOLDERS",
    shortTitle: "Stakeholder Consultation",
    icon: "edit",
    type: "form",
    questions: stakeholderConsultationQuestions,
  },
  {
    id: "vulnerabilities",
    title: "IDENTIFIED/POTENTIAL VULNERABILITIES",
    shortTitle: "Vulnerabilities",
    icon: "edit",
    type: "form",
    questions: vulnerabilitiesQuestions,
  },
  {
    id: "risk_assessment",
    title: "RISK ASSESSMENT",
    shortTitle: "Risk Assessment",
    icon: "edit",
    type: "form",
    questions: riskAssessmentQuestions,
  },
  {
    id: "disparate_outcomes",
    title: "POTENTIAL DISPARATE OUTCOMES",
    shortTitle: "Disparate Outcomes",
    icon: "edit",
    type: "form",
    questions: disparateOutcomesQuestions,
  },
  {
    id: "cross_border_transfer",
    title: "CROSS-BORDER DATA TRANSFER",
    shortTitle: "Cross-Border Transfer",
    icon: "edit",
    type: "form",
    questions: crossBorderTransferQuestions,
  },
  {
    id: "general_evaluation",
    title: "GENERAL EVALUATION OF THE INTERPLAY OF DATA PROCESSING, PRINCIPLES OF DATA PROTECTION AND DATA SUBJECTS' RIGHTS",
    shortTitle: "General Evaluation",
    icon: "edit",
    type: "form",
    questions: generalEvaluationQuestions,
  },
  {
    id: "mitigation_recommendations",
    title: "RECOMMENDATIONS FOR MITIGATION OF IDENTIFIED RISKS",
    shortTitle: "Mitigation Recommendations",
    icon: "edit",
    type: "form",
    questions: mitigationRecommendationsQuestions,
  },
  {
    id: "final_assessment",
    title: "FINAL ASSESSMENT",
    shortTitle: "Final Assessment",
    icon: "edit",
    type: "form",
    questions: finalAssessmentQuestions,
  },
  {
    id: "report",
    title: "Report",
    shortTitle: "Report",
    icon: "document",
    type: "document",
  },
]

// ============================================================================
// MOCK SUBMISSION DATA
// ============================================================================
export const mockDPIASubmission: FormSubmission = {
  id: "dpia_001",
  formId: "dpia_form",
  clientId: "client_001",
  status: "draft",
  data: {},
  flaggedFields: [],
  reviews: [],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

// ============================================================================
// PROGRESS CALCULATION FUNCTIONS
// ============================================================================
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
        {
          const value = data[q.id]
          if (value !== undefined && value !== null && value !== "") {
            isAnswered = true
          }
        }
        break

      case "yesNo":
        {
          const value = data[q.id]
          if (value === "yes" || value === "no") {
            isAnswered = true
          }
        }
        break

      case "yesNoWithOption":
        {
          const value = data[q.id]
          if (value === "yes" || value === "no") {
            if (q.conditionalField?.showWhen === value) {
              const conditionalValue = data[`${q.id}_option`]
              if (conditionalValue !== undefined && conditionalValue !== null && conditionalValue !== "") {
                isAnswered = true
              }
            } else {
              isAnswered = true
            }
          }
        }
        break

      case "staffConsultant":
        {
          const value = data[q.id]
          if (value === "staff" || value === "consultant") {
            isAnswered = true
          }
        }
        break

      case "checkbox":
        {
          const hasSelection = q.options?.some((opt) => data[opt.id] === true)
          if (hasSelection) {
            isAnswered = true
          }
        }
        break

      case "multiSelect":
        {
          const hasSelection = q.options?.some((opt) => data[opt.id] === true)
          if (hasSelection) {
            isAnswered = true
          }
        }
        break

      case "radio":
        {
          const value = data[q.id]
          if (value !== undefined && value !== null && value !== "") {
            let isComplete = true

            if (q.conditionalFields && q.conditionalFields.length > 0) {
              const matchingConditional = q.conditionalFields.find((cf) => cf.showWhen === value)
              if (matchingConditional) {
                if (matchingConditional.type === "multiSelect") {
                  const hasConditionalSelection = matchingConditional.options?.some(
                    (opt) => data[opt.id] === true,
                  )
                  isComplete = hasConditionalSelection || false
                } else if (matchingConditional.type === "text") {
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
        {
          // Assessment table is answered if BOTH material info AND assessment are filled
          // This ensures the section can't be 100% without completing the assessment
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
        {
          const selectedValue = data[q.id]
          if (selectedValue !== undefined && selectedValue !== null && selectedValue !== "") {
            // If requires reason, check if reason is provided
            // Reason is stored per-option: ${q.id}_${selectedOption}_reason
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
        {
          // Check if at least one option is selected
          const hasSelection = q.options?.some((opt) => data[opt.id] === true)
          if (hasSelection) {
            // If requires reason, check if reason is provided
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

export function calculateOverallProgress(data: Record<string, any>, sections: FormSection[]): number {
  const formSections = sections.filter((s) => s.type === "form")
  if (formSections.length === 0) return 0

  const totalProgress = formSections.reduce((sum, section) => {
    return sum + calculateSectionProgress(section.id, data, sections)
  }, 0)

  return Math.round(totalProgress / formSections.length)
}
