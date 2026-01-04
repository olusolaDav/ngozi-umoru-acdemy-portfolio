// Service categories and data structure
export type ServiceOffering = {
  title: string
  description: string
  deliverables: string[]
}

export type Service = {
  id: string
  title: string
  shortTitle: string
  description: string
  benefits: string[]
  offerings: ServiceOffering[]
}

export type ServiceCategory = {
  id: string
  title: string
  shortTitle: string
  icon: string
  color: string
  services: Service[]
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "data-privacy",
    title: "Data Privacy and Protection",
    shortTitle: "Data Privacy",
    icon: "shield",
    color: "blue",
    services: [
      {
        id: "compliance-audit",
        title: "Data Protection Compliance Audit",
        shortTitle: "Compliance Audit",
        description:
          "We help organisations achieve and maintain compliance with global and local data protection regulations, including GDPR, NDPR, and other privacy frameworks. Our experts evaluate how your organisation collects, processes, stores, and protects personal data, benchmark your practices against regulatory requirements, identify gaps, and provide actionable strategies to ensure lawful, fair, and transparent processing of personal data.",
        benefits: [
          "Avoid costly penalties, legal liability, and reputational damage",
          "Build customer trust and enhance brand credibility",
          "Improve operational efficiency through structured data governance",
          "Strengthen accountability and internal controls",
          "Enable safe and compliant innovation with data",
          "Position your organisation for global partnerships and cross-border collaboration",
        ],
        offerings: [
          {
            title: "Independent Data Protection Compliance Audit & Gap Analysis",
            description: "We conduct a full-scope review of your organisational, technical, and legal compliance controls to determine adherence to privacy laws and best practices.",
            deliverables: [
              "Independent and unbiased audit assessment",
              "Audit scoring and compliance maturity rating",
              "Baseline assessment and maturity scoring",
              "Identification of compliance gaps and risks",
              "Prioritized remediation roadmap",
              "Detailed gap analysis documentation",
              "Documented findings and evidence trail",
              "Audit certification report",
            ],
          },
          {
            title: "Policy & Framework Implementation",
            description: "We design, develop, and implement policies aligned with applicable regulations and industry best practices.",
            deliverables: [
              "Data privacy and protection policy suite",
              "Retention and disposal guidelines",
              "Data classification and governance framework",
              "Privacy governance roles & responsibilities",
            ],
          },
          {
            title: "Review of Data Governance Structures",
            description: "We assess how your organisation governs personal data across people, processes, and technology.",
            deliverables: [
              "Data governance structure evaluation",
              "Review of roles, responsibilities & accountability models",
              "Documentation of data lifecycle processes",
              "Optimisation recommendations for governance improvement",
            ],
          },
          {
            title: "Consent Management & Data Subject Rights Evaluation",
            description: "We assess mechanisms that support transparency, lawful basis for processing, and individuals' rights.",
            deliverables: [
              "Consent request quality review and system testing",
              "DSAR fulfilment process evaluation",
              "Risk report on rights handling deficiencies",
              "Recommendations for consent and DSAR automation",
            ],
          },
          {
            title: "Continuous Compliance Monitoring & Advisory",
            description: "Data regulations are constantly evolving—organizations need ongoing oversight to stay compliant.",
            deliverables: [
              "Quarterly compliance reviews",
              "Regulatory update alerts & guidance",
              "Monitoring dashboards and compliance KPIs",
              "Dedicated advisory support",
            ],
          },
          {
            title: "Audit Recommendations & Implementation Roadmap",
            description: "We provide actionable guidance to close compliance gaps and improve operational efficiency.",
            deliverables: [
              "Prioritized remediation roadmap",
              "Detailed audit report & executive summary",
              "Recommendations for control improvements",
              "Follow-up review after remediation (optional)",
            ],
          },
        ],
      },
      {
        id: "dpia",
        title: "Data Privacy Impact Assessment (DPIA)",
        shortTitle: "DPIA",
        description:
          "We conduct DPIAs to assess the potential risks associated with data processing activities, especially those involving new technologies or sensitive data. Our approach ensures that privacy risks are mitigated from project inception.",
        benefits: [
          "Identify and manage privacy risks before they impact your organisation",
          "Ensure compliance with GDPR, NDPR, and other privacy regulations",
          "Protect individuals' personal data and build trust",
          "Reduce legal liability and reputational damage",
          "Support ethical and transparent data processing initiatives",
          "Enhance confidence in new projects, systems, or technologies",
        ],
        offerings: [
          {
            title: "End-to-End DPIA Facilitation and Documentation",
            description: "We guide the full DPIA process from planning to completion, ensuring all risks are properly assessed.",
            deliverables: [
              "Comprehensive DPIA reports and documentation",
              "Risk identification and assessment logs",
              "Recommendations for mitigation measures",
              "Regulatory reporting templates",
            ],
          },
          {
            title: "Identification of High-Risk Processing Activities",
            description: "We identify activities that could expose your organisation or individuals to high data protection risks.",
            deliverables: [
              "Risk mapping of processing activities",
              "High-risk activity prioritisation",
              "Detailed risk register",
              "Mitigation strategies for high-risk processes",
            ],
          },
          {
            title: "Regulatory Reporting and Compliance Guidance",
            description: "We ensure that your DPIA outputs align with legal requirements and regulatory expectations.",
            deliverables: [
              "Guidance on regulatory submission requirements",
              "Reporting templates and compliance checklists",
              "Support for communication with regulators",
              "Internal governance recommendations",
            ],
          },
          {
            title: "Recommendations for Privacy-Enhancing Controls",
            description: "We advise on practical measures to reduce risks and enhance privacy protection in your systems.",
            deliverables: [
              "Privacy-by-design recommendations",
              "Data minimisation and anonymisation strategies",
              "Implementation roadmap for controls",
              "Ongoing monitoring and review framework",
            ],
          },
        ],
      },
      {
        id: "outsourced-dpo",
        title: "Outsourced Data Protection Officer (DPO)",
        shortTitle: "Outsourced DPO",
        description:
          "Gain access to expert DPO services without the overhead cost of a full-time position. Our outsourced DPOs provide continuous oversight, guidance, and representation to ensure your organisation meets its regulatory obligations.",
        benefits: [
          "Ensure ongoing compliance with GDPR, NDPR, and other privacy regulations",
          "Reduce operational costs compared to hiring a full-time DPO",
          "Obtain expert guidance on complex data protection challenges",
          "Mitigate legal and reputational risks associated with data breaches",
          "Strengthen accountability and governance across your organisation",
          "Build trust with customers, partners, and regulators",
        ],
        offerings: [
          {
            title: "External DPO Appointment and Ongoing Advisory",
            description: "We provide a fully qualified DPO to oversee your data protection program and advise on all regulatory matters.",
            deliverables: [
              "Dedicated outsourced DPO representation",
              "Ongoing regulatory guidance and advisory support",
              "Compliance program monitoring and reporting",
              "Strategic recommendations for data protection",
            ],
          },
          {
            title: "Representation with Regulators and Data Subjects",
            description: "Our DPO acts as your organisation's official contact with regulators and data subjects, ensuring professional handling of inquiries and complaints.",
            deliverables: [
              "Official representation with data protection authorities",
              "Response management for data subject requests (DSARs)",
              "Regulatory correspondence handling and reporting",
              "Risk mitigation for regulatory interactions",
            ],
          },
          {
            title: "Monitoring of Compliance Programs and Audits",
            description: "We continuously review and monitor your compliance initiatives, identifying gaps and opportunities for improvement.",
            deliverables: [
              "Compliance program health checks",
              "Periodic audit support and oversight",
              "Risk and gap reporting",
              "Recommendations for continuous improvement",
            ],
          },
          {
            title: "Regular Reporting and Strategic Data Protection Reviews",
            description: "Our DPO provides leadership with actionable insights to strengthen governance and compliance strategies.",
            deliverables: [
              "Executive-level reports and dashboards",
              "Strategic review of policies and controls",
              "Recommendations for improvement and risk mitigation",
              "Guidance on aligning compliance with business strategy",
            ],
          },
        ],
      },
      {
        id: "remediation-policy",
        title: "Data Protection Remediation and Policy Development",
        shortTitle: "Remediation & Policy",
        description:
          "We help you remediate compliance gaps and build robust data protection frameworks. Our consultants design and implement practical policies and governance tools aligned with legal and business requirements.",
        benefits: [
          "Close compliance gaps identified during audits or assessments",
          "Strengthen data governance and operational controls",
          "Reduce the risk of data breaches, penalties, and reputational harm",
          "Ensure policies are aligned with legal, regulatory, and business requirements",
          "Facilitate scalable and sustainable data protection practices",
          "Support ethical and transparent use of data across your organisation",
        ],
        offerings: [
          {
            title: "Review and Development of Privacy and Security Policies",
            description: "We assess your current policies and develop comprehensive data protection frameworks tailored to your organisation.",
            deliverables: [
              "Full suite of privacy and security policies",
              "Policy gap analysis and updates",
              "Templates for operational implementation",
              "Governance documentation and guidelines",
            ],
          },
          {
            title: "Implementation of Remediation Programs Post-Audit",
            description: "We provide actionable remediation strategies to address identified compliance gaps and operational weaknesses.",
            deliverables: [
              "Prioritized remediation roadmap",
              "Corrective action plans for compliance gaps",
              "Monitoring of remediation progress",
              "Recommendations for sustainable implementation",
            ],
          },
          {
            title: "Documentation Templates and Operational Frameworks",
            description: "We create reusable tools to simplify policy management, audits, and compliance tracking.",
            deliverables: [
              "Standardised policy templates",
              "Procedure manuals and operational guides",
              "Reporting templates for compliance tracking",
              "Tools for internal control and governance",
            ],
          },
          {
            title: "Integration with Information Governance Best Practices",
            description: "We align your policies and remediation programs with industry standards and best practices to ensure long-term compliance.",
            deliverables: [
              "Alignment with GDPR, NDPR, and global standards",
              "Risk-based governance frameworks",
              "Guidelines for organisational adoption and training",
              "Recommendations for ongoing process improvement",
            ],
          },
        ],
      },
      {
        id: "third-party-risk",
        title: "Third-Party Risk Assessment Compliance",
        shortTitle: "Third-Party Risk",
        description:
          "Third parties can be your weakest link in data security. We assess vendor relationships and supply chains to ensure they meet your data protection and privacy standards.",
        benefits: [
          "Identify and mitigate risks posed by vendors, suppliers, and partners",
          "Ensure third parties comply with data protection and privacy regulations",
          "Reduce operational, legal, and reputational risks from third-party breaches",
          "Strengthen trust across your supply chain and stakeholder network",
          "Improve vendor management and contractual safeguards",
          "Maintain compliance continuity and accountability throughout your ecosystem",
        ],
        offerings: [
          {
            title: "Vendor Risk Identification and Classification",
            description: "We evaluate your third-party relationships to identify risk exposure and prioritise high-risk vendors.",
            deliverables: [
              "Comprehensive vendor risk mapping",
              "Classification of vendors by risk level",
              "Risk assessment reports",
              "Recommendations for risk mitigation",
            ],
          },
          {
            title: "Third-Party Compliance Audits and Due Diligence",
            description: "We assess vendors' compliance with data protection and privacy regulations through rigorous audits.",
            deliverables: [
              "Third-party audit reports and findings",
              "Verification of privacy and security controls",
              "Remediation recommendations for non-compliant vendors",
              "Continuous compliance tracking guidance",
            ],
          },
          {
            title: "Contract Review and Data Sharing Assessments",
            description: "We review contracts and data-sharing agreements to ensure they meet legal and regulatory standards.",
            deliverables: [
              "Contractual risk analysis and gap identification",
              "Data sharing and processing agreement review",
              "Recommendations for contract amendments",
              "Compliance guidance for cross-jurisdictional data sharing",
            ],
          },
          {
            title: "Continuous Monitoring and Reporting Mechanisms",
            description: "We implement processes for ongoing oversight of third-party compliance and risk management.",
            deliverables: [
              "Continuous monitoring frameworks",
              "Reporting dashboards and KPIs",
              "Alerts for non-compliance or emerging risks",
              "Periodic review and improvement recommendations",
            ],
          },
        ],
      },
      {
        id: "training-certification",
        title: "Training and Certification in Data Protection",
        shortTitle: "Training & Certification",
        description:
          "We provide bespoke training programs to enhance your team's understanding of data protection, privacy laws, and compliance best practices.",
        benefits: [
          "Equip your workforce with essential knowledge on data privacy and protection",
          "Reduce risk of non-compliance due to human error or lack of awareness",
          "Build a culture of accountability and ethical data handling",
          "Support regulatory compliance requirements such as GDPR and NDPR",
          "Strengthen trust with clients, partners, and regulators",
          "Enable practical application of policies and controls across your organisation",
        ],
        offerings: [
          {
            title: "GDPR and NDPR Compliance Training",
            description: "We provide in-depth sessions on key data protection regulations to ensure your team is fully compliant.",
            deliverables: [
              "Training sessions tailored to organisational needs",
              "Regulatory compliance guidelines and best practices",
              "Assessment of team understanding and retention",
              "Certification preparation support",
            ],
          },
          {
            title: "Sector-Specific Privacy Workshops",
            description: "We design workshops focused on unique privacy challenges within your industry.",
            deliverables: [
              "Targeted training on sector-specific risks",
              "Case studies and practical scenarios",
              "Hands-on exercises to reinforce learning",
              "Workshop completion certification",
            ],
          },
          {
            title: "Certification Preparation and Support",
            description: "We help your team prepare for recognized data protection certification programs.",
            deliverables: [
              "Study materials and practice assessments",
              "Guidance on certification requirements",
              "Mock exams and evaluation",
              "Support through the certification process",
            ],
          },
          {
            title: "Custom Training Modules for All Organisational Levels",
            description: "We develop bespoke modules that address the specific roles and responsibilities of staff at all levels.",
            deliverables: [
              "Role-specific training content",
              "Interactive learning sessions",
              "Performance evaluation and feedback",
              "Certificates of completion",
            ],
          },
        ],
      },
      {
        id: "management-training",
        title: "Management Training and Compliance Roadmap",
        shortTitle: "Management Training",
        description:
          "Equip your leadership team with strategic insights into compliance and governance. Our roadmap helps executives build sustainable data protection frameworks.",
        benefits: [
          "Strengthen leadership accountability in data protection initiatives",
          "Align compliance strategy with overall business objectives",
          "Reduce organisational risk through informed decision-making",
          "Improve governance frameworks and internal controls",
          "Enhance regulatory readiness and organisational resilience",
          "Foster a culture of privacy and ethical data handling across teams",
        ],
        offerings: [
          {
            title: "Executive Compliance Awareness Training",
            description: "We provide targeted training to help executives understand regulatory requirements and compliance obligations.",
            deliverables: [
              "Tailored executive-level training sessions",
              "Insights into GDPR, NDPR, and sector-specific regulations",
              "Awareness of legal and operational implications",
              "Executive participation certification",
            ],
          },
          {
            title: "Development of Compliance Roadmaps",
            description: "We help organisations develop strategic roadmaps for implementing and sustaining compliance programs.",
            deliverables: [
              "Step-by-step compliance implementation plans",
              "Risk assessment and mitigation strategies",
              "Milestones, KPIs, and progress tracking frameworks",
              "Alignment with organisational objectives",
            ],
          },
          {
            title: "Governance and Accountability Frameworks",
            description: "We guide leadership in establishing structures that ensure responsibility and transparency.",
            deliverables: [
              "Governance structure design",
              "Roles and responsibilities for compliance management",
              "Reporting and accountability frameworks",
              "Recommendations for continuous improvement",
            ],
          },
          {
            title: "Integration with Organisational Strategy",
            description: "We ensure that compliance initiatives are fully integrated into the organisation's strategic goals.",
            deliverables: [
              "Alignment of compliance programs with business strategy",
              "Strategic recommendations for cross-functional adoption",
              "Continuous monitoring and evaluation plans",
              "Guidance for long-term compliance sustainability",
            ],
          },
        ],
      },
      {
        id: "employee-awareness",
        title: "Employee Awareness and Certification Training",
        shortTitle: "Employee Awareness",
        description:
          "Ensure your workforce understands data protection responsibilities with engaging awareness sessions and certification opportunities.",
        benefits: [
          "Promote awareness culture",
          "Reduce human errors",
          "Clarify employee obligations",
          "Strengthen accountability",
          "Improve operational efficiency",
          "Support audit readiness",
        ],
        offerings: [
          {
            title: "Privacy Awareness Campaigns",
            description: "Organisation-wide education on data protection principles.",
            deliverables: ["Awareness sessions", "Tailored campaigns", "Participation tracking", "Impact reporting"],
          },
          {
            title: "Role-Specific Training",
            description: "Targeted training for different job roles.",
            deliverables: [
              "Custom modules",
              "Practical scenarios",
              "Performance assessment",
              "Completion certification",
            ],
          },
          {
            title: "Staff Certification Programs",
            description: "Prepare employees for recognized certifications.",
            deliverables: ["Study guides", "Mock exams", "Process guidance", "Formal certification"],
          },
          {
            title: "Training Effectiveness Evaluation",
            description: "Measure impact of training programs.",
            deliverables: [
              "Post-training assessments",
              "Feedback analysis",
              "Effectiveness reporting",
              "Learning recommendations",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "management-systems",
    title: "Management System Consultancy & Certification",
    shortTitle: "Management Systems",
    icon: "settings",
    color: "cyan",
    services: [
      {
        id: "iso-27001",
        title: "ISO 27001:2022 - Information Security Management System",
        shortTitle: "ISO 27001",
        description:
          "We guide organisations through the implementation and certification of ISO 27001:2022, ensuring robust information security practices that protect business and client data.",
        benefits: [
          "Protect sensitive business and client information from breaches and cyber threats",
          "Strengthen organisational information security governance",
          "Achieve internationally recognised certification to build trust with stakeholders",
          "Improve risk management and compliance with legal/regulatory requirements",
          "Enhance operational resilience and continuity",
          "Foster a culture of security awareness and best practices across your organisation",
        ],
        offerings: [
          {
            title: "Gap Analysis & Risk Assessment",
            description: "Assess current security posture against ISO 27001 standards.",
            deliverables: [
              "Pre-audit readiness assessment",
              "Guidance during external audit",
              "Support in addressing non-conformities",
              "Continuous improvement recommendations post-certification",
            ],
          },
          {
            title: "Implementation Roadmap",
            description: "Step-by-step plan to achieve ISO 27001 compliance.",
            deliverables: ["Detailed project plan", "Policy templates", "Role assignments", "Certification timelines"],
          },
          {
            title: "Policies & Documentation",
            description: "Develop required documentation for ISO 27001.",
            deliverables: [
              "Security policies",
              "Risk treatment plans",
              "Operational guidelines",
              "Audit-ready documentation",
            ],
          },
          {
            title: "Certification Audit Support",
            description: "Assistance through the ISO 27001 certification process.",
            deliverables: [
              "Pre-audit assessment",
              "External audit guidance",
              "Non-conformity support",
              "Post-certification improvements",
            ],
          },
        ],
      },
      {
        id: "iso-22301",
        title: "ISO 22301 - Business Continuity Management System",
        shortTitle: "ISO 22301",
        description:
          "We help organisations build resilience and ensure operational continuity in the face of disruptions, aligning with ISO 22301 standards.",
        benefits: [
          "Minimise business disruption from unexpected events and crises",
          "Ensure continuity of critical operations during emergencies",
          "Strengthen organisational resilience and stakeholder confidence",
          "Meet regulatory and contractual requirements for business continuity",
          "Protect revenue, reputation, and customer trust",
          "Foster a proactive risk management culture",
        ],
        offerings: [
          {
            title: "Business Continuity Risk Assessment",
            description: "Evaluate risks and vulnerabilities to critical operations.",
            deliverables: [
              "Pre-certification readiness assessment",
              "Guidance during external audits",
              "Support in addressing gaps or non-conformities",
              "Post-certification review and optimisation recommendations",
            ],
          },
          {
            title: "Continuity Plan Development",
            description: "Design and implement actionable continuity plans.",
            deliverables: [
              "BC and DR plans",
              "Incident response procedures",
              "Continuity strategies",
              "ISO 22301 documentation",
            ],
          },
          {
            title: "Testing & Monitoring Programs",
            description: "Ensure BCMS is functional and continuously improved.",
            deliverables: [
              "Testing exercises",
              "Performance evaluation",
              "Monitoring dashboards",
              "Improvement roadmap",
            ],
          },
          {
            title: "Certification Support",
            description: "Assistance through ISO 22301 certification.",
            deliverables: ["Readiness assessment", "Audit guidance", "Gap support", "Post-certification review"],
          },
        ],
      },
      {
        id: "pci-dss",
        title: "PCI DSS - Payment Card Industry Data Security Standard",
        shortTitle: "PCI DSS",
        description:
          "We assist businesses handling payment information to meet PCI DSS requirements, ensuring data security across card processing systems.",
        benefits: [
          "Protect sensitive payment card data from breaches and fraud",
          "Achieve compliance with global card industry standards",
          "Reduce risk of financial losses and reputational damage",
          "Strengthen customer trust and confidence in payment systems",
          "Ensure regulatory and contractual compliance with card brands",
          "Support secure and efficient payment operations",
        ],
        offerings: [
          {
            title: "PCI DSS Gap Analysis and Readiness Assessment",
            description: "We evaluate your current payment processing systems against PCI DSS standards.",
            deliverables: [
              "Assessment of cardholder data environment (CDE)",
              "Identification of compliance gaps and vulnerabilities",
              "Risk scoring and prioritisation",
              "Remediation roadmap",
            ],
          },
          {
            title: "Compliance Roadmap and Remediation Planning",
            description: "We design a step-by-step plan to achieve full PCI DSS compliance.",
            deliverables: [
              "Detailed implementation plan for controls and policies",
              "Guidance on technical and operational requirements",
              "Assignment of roles and responsibilities",
              "Timelines and milestones for certification readiness",
            ],
          },
          {
            title: "Implementation Guidance for Secure Card Data Processing",
            description: "We provide support for deploying controls and procedures to protect cardholder data.",
            deliverables: [
              "Secure network and system configurations",
              "Access controls and monitoring practices",
              "Encryption and data protection mechanisms",
              "Operational procedures for ongoing compliance",
            ],
          },
          {
            title: "Certification Support and Audit Preparation",
            description: "We help organisations prepare for PCI DSS certification and audits.",
            deliverables: [
              "Pre-audit readiness assessment",
              "Assistance during external audits",
              "Support for addressing non-compliance issues",
              "Continuous improvement recommendations",
            ],
          },
        ],
      },
      {
        id: "iso-27017",
        title: "ISO 27017 - Cloud Security Assessment",
        shortTitle: "ISO 27017",
        description:
          "We assess and strengthen your cloud infrastructure to ensure secure and compliant operations aligned with ISO 27017 standards.",
        benefits: [
          "Protect cloud-hosted data and systems from security breaches",
          "Ensure compliance with international cloud security standards",
          "Mitigate risks associated with cloud service providers",
          "Strengthen trust with clients and business partners",
          "Improve operational efficiency through secure cloud practices",
          "Foster a culture of proactive cloud security and governance",
        ],
        offerings: [
          {
            title: "Cloud Security Risk Evaluation",
            description: "We evaluate your cloud infrastructure for vulnerabilities and compliance gaps.",
            deliverables: [
              "Assessment of cloud architecture and configurations",
              "Identification of risks to data confidentiality, integrity, and availability",
              "Security gap analysis against ISO 27017 standards",
              "Risk prioritisation and mitigation recommendations",
            ],
          },
          {
            title: "Cloud Policies & Procedures",
            description: "Develop robust cloud security policies.",
            deliverables: ["Policy framework", "Security guidelines", "Operational procedures", "Governance roles"],
          },
          {
            title: "Security Control Implementation",
            description: "Deploy controls for cloud-hosted systems.",
            deliverables: [
              "Access management",
              "Encryption configurations",
              "Monitoring practices",
              "Incident response",
            ],
          },
          {
            title: "Continuous Monitoring and Audit Support",
            description: "We ensure ongoing compliance and cloud security effectiveness.",
            deliverables: [
              "Cloud security monitoring dashboards",
              "Regular compliance reviews and audits",
              "Guidance for corrective actions and continuous improvement",
              "Support for external certification readiness",
            ],
          },
        ],
      },
      {
        id: "iso-27032",
        title: "ISO 27032 - Cybersecurity Guidelines",
        shortTitle: "ISO 27032",
        description:
          "We enhance your cybersecurity posture using ISO 27032 guidelines, helping protect your organisation from evolving digital threats.",
        benefits: [
          "Safeguard critical business and customer information from cyber threats",
          "Strengthen overall cybersecurity governance and awareness",
          "Reduce risks associated with cyber attacks, data breaches, and network vulnerabilities",
          "Ensure compliance with international cybersecurity best practices",
          "Protect your organisation's reputation and operational continuity",
          "Promote a proactive and resilient cybersecurity culture",
        ],
        offerings: [
          {
            title: "Cybersecurity Risk Assessment and Mitigation",
            description: "We evaluate your current cybersecurity posture and identify potential threats.",
            deliverables: [
              "Identification of vulnerabilities across systems, networks, and applications",
              "Threat and risk analysis",
              "Prioritisation of mitigation measures",
              "Recommendations for strengthening cybersecurity controls",
            ],
          },
          {
            title: "Security Guidance",
            description: "Expert advice on securing digital assets.",
            deliverables: [
              "Secure configurations",
              "Application security",
              "Access control strategies",
              "Incident response planning",
            ],
          },
          {
            title: "Policies & Best Practices",
            description: "Develop policies aligned with ISO 27032.",
            deliverables: [
              "Cybersecurity framework",
              "Monitoring procedures",
              "Team responsibilities",
              "Improvement guidelines",
            ],
          },
          {
            title: "Ongoing Cybersecurity Governance Support",
            description: "We help your organisation maintain a proactive and compliant cybersecurity posture.",
            deliverables: [
              "Cybersecurity monitoring dashboards and metrics",
              "Continuous compliance and threat evaluation",
              "Support during audits and regulatory inspections",
              "Recommendations for ongoing security improvements",
            ],
          },
        ],
      },
      {
        id: "iso-20000",
        title: "ISO 20000 - IT Service Management",
        shortTitle: "ISO 20000",
        description:
          "We optimise IT service delivery through ISO 20000 implementation, ensuring efficient, secure, and compliant IT operations.",
        benefits: [
          "Enhance the quality and reliability of IT services",
          "Improve operational efficiency and service management processes",
          "Ensure compliance with international IT service management standards",
          "Strengthen customer satisfaction and trust through consistent service delivery",
          "Reduce operational risks and downtime",
          "Foster a culture of continual improvement in IT services",
        ],
        offerings: [
          {
            title: "IT Service Management Assessment and Gap Analysis",
            description: "We evaluate your current IT service processes against ISO 20000 standards.",
            deliverables: [
              "Assessment of existing ITSM practices",
              "Identification of gaps and areas for improvement",
              "Prioritised remediation roadmap",
              "Baseline scoring against ISO 20000 requirements",
            ],
          },
          {
            title: "ITSM Process Design",
            description: "Create IT service management processes.",
            deliverables: ["Process framework", "Workflows", "Procedures", "Performance metrics"],
          },
          {
            title: "Documentation & Monitoring",
            description: "Establish mechanisms to monitor IT service delivery.",
            deliverables: [
              "Documentation templates",
              "Performance dashboards",
              "KPI tracking",
              "Improvement recommendations",
            ],
          },
          {
            title: "Support for ISO 20000 Certification",
            description: "We guide your organisation through ISO 20000 certification.",
            deliverables: [
              "Pre-certification readiness assessment",
              "Assistance during external audits",
              "Support in addressing non-conformities",
              "Recommendations for ongoing ITSM optimisation",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ai-governance",
    title: "Artificial Intelligence Governance & Analytics",
    shortTitle: "AI Governance",
    icon: "brain",
    color: "violet",
    services: [
      {
        id: "ethical-ai",
        title: "Responsible and Ethical AI Compliance",
        shortTitle: "Ethical AI",
        description:
          "We help organisations build trustworthy AI systems by embedding ethical principles such as fairness, accountability, and transparency across all AI lifecycle stages.",
        benefits: [
          "Ensure AI systems operate ethically, fairly, and transparently",
          "Minimise legal and reputational risks associated with AI deployment",
          "Build trust with customers, partners, and regulators",
          "Align AI initiatives with global standards and regulatory requirements",
          "Enable responsible innovation while maintaining compliance",
          "Foster accountability and governance across AI projects",
        ],
        offerings: [
          {
            title: "Ethical AI Framework Design and Implementation",
            description: "We develop a governance framework for responsible AI deployment.",
            deliverables: [
              "Policies and guidelines for ethical AI use",
              "Alignment with international AI regulations and best practices",
              "Framework for AI accountability and transparency",
              "Implementation roadmap for organisational adoption",
            ],
          },
          {
            title: "Compliance with Global AI Regulations and Guidelines",
            description: "We ensure your AI systems meet applicable legal and regulatory requirements.",
            deliverables: [
              "Gap analysis against AI regulations",
              "Risk assessment and mitigation strategies",
              "Regulatory reporting guidance",
              "Compliance monitoring mechanisms",
            ],
          },
          {
            title: "Bias Detection and Transparency Audits",
            description: "We evaluate AI models for fairness, bias, and transparency.",
            deliverables: [
              "Dataset bias assessment",
              "Algorithmic fairness testing",
              "Model validation and corrective recommendations",
              "Transparency audit reports",
            ],
          },
          {
            title: "Governance Frameworks for AI Accountability",
            description: "We help organisations implement accountability and governance mechanisms for AI systems.",
            deliverables: [
              "Roles and responsibilities for AI governance",
              "Reporting and monitoring structures",
              "Documentation and process controls",
              "Continuous improvement framework",
            ],
          },
        ],
      },
      {
        id: "ai-risk-assessment",
        title: "AI Systems Risk Assessment",
        shortTitle: "AI Risk Assessment",
        description:
          "We assess risks throughout the AI lifecycle from design to deployment, ensuring your AI systems remain safe, transparent, and compliant.",
        benefits: [
          "Identify and mitigate risks associated with AI deployment",
          "Ensure AI systems operate safely and reliably",
          "Strengthen organisational accountability and governance",
          "Build trust with stakeholders through transparent AI practices",
          "Reduce potential legal, ethical, and operational risks",
          "Support continuous improvement in AI system performance",
        ],
        offerings: [
          {
            title: "Risk Identification During Model Design and Training",
            description: "We evaluate AI models from inception to mitigate potential risks.",
            deliverables: [
              "Analysis of AI model architecture and data pipelines",
              "Identification of risks related to fairness, bias, and security",
              "Risk classification and prioritisation",
              "Recommendations for design improvements",
            ],
          },
          {
            title: "Algorithmic Transparency Reviews",
            description: "We ensure AI algorithms are interpretable and decisions are explainable.",
            deliverables: [
              "Evaluation of algorithmic decision-making processes",
              "Documentation of model logic and outputs",
              "Transparency reporting for stakeholders",
              "Recommendations for enhancing model interpretability",
            ],
          },
          {
            title: "Impact Analysis and Mitigation Strategies",
            description: "We assess potential impacts of AI systems on people, processes, and organisations.",
            deliverables: [
              "Risk and impact assessment reports",
              "Recommendations for mitigation measures",
              "Guidance on data privacy and security compliance",
              "Operational strategies to reduce adverse impacts",
            ],
          },
          {
            title: "Continuous AI Risk Monitoring",
            description: "We establish ongoing monitoring practices for AI system safety and compliance.",
            deliverables: [
              "AI performance monitoring dashboards",
              "Alerts for anomalies, biases, and compliance deviations",
              "Periodic risk review and audit support",
              "Continuous improvement and governance recommendations",
            ],
          },
        ],
      },
      {
        id: "ai-data-protection",
        title: "AI & Data Protection Risk Assessment",
        shortTitle: "AI & Data Protection",
        description:
          "We bridge the gap between AI innovation and privacy compliance by assessing how AI systems handle personal data under frameworks like GDPR and NDPR.",
        benefits: [
          "Ensure AI systems comply with global and local data protection laws",
          "Minimise privacy risks in AI data processing and analytics",
          "Strengthen trust with customers, regulators, and partners",
          "Support ethical and responsible AI development",
          "Enable secure and compliant AI-driven innovation",
          "Reduce legal, operational, and reputational risks",
        ],
        offerings: [
          {
            title: "AI-Specific Privacy and Data Protection Assessments",
            description: "We assess how AI systems handle personal data and ensure privacy compliance.",
            deliverables: [
              "Mapping of AI data processing activities",
              "Assessment of lawful basis for personal data processing",
              "Privacy risk evaluation and mitigation recommendations",
              "Compliance reporting aligned with GDPR and NDPR",
            ],
          },
          {
            title: "Data Minimisation and Anonymisation Strategies",
            description: "We implement strategies to reduce privacy risks in AI datasets.",
            deliverables: [
              "Data minimisation plans for AI use",
              "Techniques for anonymisation and pseudonymisation",
              "Guidelines for secure handling of sensitive data",
              "Implementation support for privacy-preserving AI",
            ],
          },
          {
            title: "Regulatory Compliance Gap Analysis",
            description: "We identify gaps between your AI systems and applicable data protection laws.",
            deliverables: [
              "Gap analysis report against GDPR, NDPR, and other regulations",
              "Prioritised remediation roadmap",
              "Recommendations for policy, process, and technical improvements",
              "Ongoing monitoring and advisory support",
            ],
          },
          {
            title: "Privacy-Preserving AI Design Advisory",
            description: "We provide guidance on designing AI systems that protect privacy from inception.",
            deliverables: [
              "Best practices for AI system design with privacy by default",
              "Integration of privacy controls into AI workflows",
              "Training and guidance for development teams",
              "Documentation and compliance support",
            ],
          },
        ],
      },
      {
        id: "bias-audit",
        title: "Algorithmic Bias Audit",
        shortTitle: "Bias Audit",
        description:
          "Our specialists assess AI models for bias, discrimination, and fairness across datasets, algorithms, and outcomes, ensuring equitable performance across all groups.",
        benefits: [
          "Detect and mitigate bias in AI models to ensure fairness",
          "Prevent discrimination and reputational risk",
          "Strengthen trust with stakeholders, customers, and regulators",
          "Improve AI model performance and reliability",
          "Align AI outcomes with ethical and legal standards",
          "Promote accountability and transparency in AI decision-making",
        ],
        offerings: [
          {
            title: "Dataset Bias Evaluation",
            description: "We evaluate datasets to identify potential sources of bias.",
            deliverables: [
              "Data quality and representation analysis",
              "Identification of bias across demographic groups",
              "Recommendations for dataset improvement",
              "Documentation of findings for transparency",
            ],
          },
          {
            title: "Fairness Testing and Model Validation",
            description: "We test AI models to ensure fair and unbiased decision-making.",
            deliverables: [
              "Fairness metrics and evaluation reports",
              "Validation of AI model outcomes across diverse groups",
              "Corrective measures for identified biases",
              "Recommendations for ongoing fairness monitoring",
            ],
          },
          {
            title: "Corrective Model Tuning",
            description: "We refine AI models to reduce bias and improve fairness.",
            deliverables: [
              "Model retraining and parameter adjustment",
              "Bias mitigation strategy implementation",
              "Verification of improved fairness outcomes",
              "Documentation of tuning processes",
            ],
          },
          {
            title: "Compliance Reporting",
            description: "We provide detailed reports for accountability and regulatory requirements.",
            deliverables: [
              "Bias audit report and executive summary",
              "Compliance documentation for regulators and stakeholders",
              "Recommendations for continuous bias monitoring",
              "Guidance for integrating fairness into AI lifecycle",
            ],
          },
        ],
      },
      {
        id: "data-analytics-ml",
        title: "Data Analytics & Machine Learning",
        shortTitle: "Analytics & ML",
        description:
          "We enable data-driven transformation through advanced analytics and machine learning models tailored to your business needs.",
        benefits: [
          "Transform raw data into actionable insights for strategic decisions",
          "Predict future trends and optimise business operations",
          "Improve operational efficiency through data-driven strategies",
          "Enhance customer experience and satisfaction using predictive analytics",
          "Reduce risks and make informed, evidence-based decisions",
          "Enable innovation and competitive advantage through AI and ML",
        ],
        offerings: [
          {
            title: "Data Analytics and Modelling with Machine Learning",
            description: "We extract insights and build predictive models using structured and unstructured data.",
            deliverables: [
              "Predictive and descriptive analytics reports",
              "Machine learning models tailored to business objectives",
              "Insights from structured and unstructured data",
              "Recommendations for decision-making and operational improvement",
            ],
          },
          {
            title: "End-to-End Data Analysis Using Cutting-Edge Techniques",
            description: "We provide complete data analysis to support informed business decisions.",
            deliverables: [
              "Data collection, cleaning, and transformation pipelines",
              "Exploratory and advanced statistical analysis",
              "Visualisation dashboards for actionable insights",
              "Performance metrics and evaluation reports",
            ],
          },
          {
            title: "Predictive and Prescriptive Modelling",
            description: "We forecast future outcomes and provide actionable strategies to optimise performance.",
            deliverables: [
              "Predictive models for sales, operations, and customer behaviour",
              "Prescriptive models for optimised decision-making",
              "Scenario simulations and strategic planning insights",
              "Continuous monitoring and model refinement",
            ],
          },
        ],
      },
    ],
  },
]

export function getServiceById(serviceId: string): { category: ServiceCategory; service: Service } | null {
  for (const category of serviceCategories) {
    const service = category.services.find((s) => s.id === serviceId)
    if (service) {
      return { category, service }
    }
  }
  return null
}

export function getServicesByCategory(categoryId: string): ServiceCategory | null {
  return serviceCategories.find((c) => c.id === categoryId) || null
}
