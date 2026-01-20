// Structured Data (JSON-LD) components for SEO optimization
// These schemas help search engines understand the content and relationships

interface PersonSchemaProps {
  name: string
  jobTitle: string
  description: string
  url: string
  imageUrl?: string
  email?: string
  sameAs?: string[] // Social media profiles
}

interface OrganizationSchemaProps {
  name: string
  url: string
  logo?: string
  description: string
  foundingDate?: string
  email?: string
  address?: {
    addressCountry: string
    addressLocality?: string
  }
}

interface ArticleSchemaProps {
  headline: string
  description: string
  url: string
  imageUrl: string
  datePublished: string
  dateModified: string
  authorName: string
  authorUrl?: string
  tags?: string[]
}

interface WebSiteSchemaProps {
  name: string
  url: string
  description: string
  potentialAction?: {
    query: string
  }
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbListSchemaProps {
  items: BreadcrumbItem[]
}

// Person Schema - For homepage and about sections
export function PersonSchema({
  name,
  jobTitle,
  description,
  url,
  imageUrl,
  email,
  sameAs = [],
}: PersonSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    jobTitle,
    description,
    url,
    ...(imageUrl && { image: imageUrl }),
    ...(email && { email }),
    ...(sameAs.length > 0 && { sameAs }),
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "University (PhD in Education & Pedagogy)",
    },
    knowsAbout: [
      "Academic English",
      "English for Academic Purposes (EAP)",
      "ESL Teaching",
      "Higher Education",
      "Curriculum Development",
      "Pedagogy",
      "Academic Writing",
      "Student-Centred Learning",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Academic English Lecturer",
      occupationLocation: {
        "@type": "Country",
        name: "United Kingdom",
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Organization Schema - For institutional branding
export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  foundingDate,
  email,
  address,
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${url}#organization`,
    name,
    url,
    ...(logo && { logo }),
    description,
    ...(foundingDate && { foundingDate }),
    ...(email && { email }),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        addressCountry: address.addressCountry,
        ...(address.addressLocality && { addressLocality: address.addressLocality }),
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Article Schema - For blog posts
export function ArticleSchema({
  headline,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  tags = [],
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    image: imageUrl,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    ...(tags.length > 0 && { keywords: tags.join(", ") }),
    inLanguage: "en-GB",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// WebSite Schema - For homepage with search action
export function WebSiteSchema({ name, url, description, potentialAction }: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    name,
    url,
    description,
    inLanguage: "en-GB",
    ...(potentialAction && {
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}/blog?search={${potentialAction.query}}`,
        },
        "query-input": `required name=${potentialAction.query}`,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// BreadcrumbList Schema - For navigation
export function BreadcrumbListSchema({ items }: BreadcrumbListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Educational Course Schema - For resources
export function CourseSchema({
  name,
  description,
  url,
  provider,
}: {
  name: string
  description: string
  url: string
  provider: string
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url,
    provider: {
      "@type": "Person",
      name: provider,
    },
    inLanguage: "en-GB",
    educationalLevel: "Higher Education",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
