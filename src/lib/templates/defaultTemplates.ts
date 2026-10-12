export interface StaticTemplate {
  _id: string;
  title: string;
  description: string;
  category: string;
  visibility: "public" | "private";
  usageCount: number;
  previewImage?: string;
  editorContent: Record<string, unknown>;
  ownerId: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_TEMPLATES: StaticTemplate[] = [
  // 1. Resume and CV
  {
    _id: "tpl-resume-01",
    title: "Executive Tech Lead Resume",
    description: "Modern ATS-optimized resume for engineering leaders, software architects, and senior developers.",
    category: "Resume and CV",
    visibility: "public",
    usageCount: 342,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Alex Morgan" }],
        },
        {
          type: "paragraph",
          attrs: { textAlign: "left" },
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Principal Software Engineer & Cloud Architect",
            },
            { type: "text", text: " | San Francisco, CA | alex.morgan@example.com | (555) 019-2834" },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Professional Summary" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Results-driven engineering leader with 10+ years of experience designing fault-tolerant distributed systems, scaling cloud infrastructures to tens of millions of monthly active users, and mentoring high-performing engineering teams.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Work Experience" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "CloudScale Systems — Staff Software Engineer",
            },
            { type: "text", text: " (2022 – Present)" },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Architected real-time collaborative document engine reducing end-to-end sync latency by 45%.",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Led migration from monolithic architecture to modular microservices handling 25,000 requests/sec with 99.99% uptime.",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Standardized CI/CD test automation pipelines reducing deployment lead time from 4 days to 35 minutes.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Apex Technologies — Senior Full-Stack Engineer",
            },
            { type: "text", text: " (2018 – 2022)" },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Developed customer billing portal processing $18M+ annually with automated compliance reporting.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Core Technical Competencies" }],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Languages & Frameworks" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Databases & Cloud" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Architecture & DevOps" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "TypeScript, React, Next.js, Node.js, Python, Go" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "MongoDB, Redis, PostgreSQL, AWS, GCP" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Microservices, Docker, Kubernetes, CI/CD, Kafka" }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // 2. Business Proposals
  {
    _id: "tpl-proposal-01",
    title: "Enterprise Strategic Proposal",
    description: "Professional proposal layout with project roadmap, deliverable milestones, and budget breakdown.",
    category: "Business Proposals",
    visibility: "public",
    usageCount: 512,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Enterprise Transformation Proposal" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Prepared for: ",
            },
            { type: "text", text: "Global Enterprises Board of Directors | " },
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Date: ",
            },
            { type: "text", text: "Fiscal Year 2026" },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Executive Summary" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Modern organizations face growing complexity across decentralized document lifecycles and collaboration stacks. This proposal outlines a multi-phase digital transformation initiative that unifies template management, automated Microsoft Word OpenXML generation, and AI-assisted drafting to increase operational throughput by 65%.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Scope of Work & Phases" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Phase 1: Architecture Audit & Security Review — ",
                    },
                    { type: "text", text: "Assessment of existing documentation workflows, access controls, and compliance criteria." },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Phase 2: Platform Integration & Automated Pipelines — ",
                    },
                    { type: "text", text: "Full implementation of authenticated Word template editing, share links, and Gemini AI assistance." },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Phase 3: Rollout & Quality Benchmarking — ",
                    },
                    { type: "text", text: "User enablement, SLA verification, and enterprise-wide deployment." },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "3. Projected Budget & Timeline" }],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Milestone Deliverable" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Duration" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Investment (USD)" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Architecture & Security Audit" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "3 Weeks" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$18,500" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Full-Stack Implementation" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "6 Weeks" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$42,000" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Enterprise Onboarding & SLA Guarantee" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "2 Weeks" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$12,000" }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // 3. Invoices
  {
    _id: "tpl-invoice-01",
    title: "Standard Commercial Invoice",
    description: "Detailed corporate billing invoice with line items, tax rate computation, and bank transfer credentials.",
    category: "Invoices",
    visibility: "public",
    usageCount: 290,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "TAX INVOICE #INV-2026-880" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Issued By: ",
            },
            { type: "text", text: "DocuCanvas Technology Solutions Inc. | VAT ID: US-92818293\n" },
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Billed To: ",
            },
            { type: "text", text: "Acme Global Ventures | Attention: Accounts Payable" },
          ],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Description" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Hours / Qty" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Rate" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Amount (USD)" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Cloud Architecture Consultation" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "40" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$175.00" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$7,000.00" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Custom Word DOCX Template Engine" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "1" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$5,500.00" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$5,500.00" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Total Amount Due" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "—" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Net 30" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "$12,500.00" }] }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Payment Instructions" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Please remit funds via ACH / Wire Transfer within 30 days of issue.\nBank Name: First International Silicon Bank\nAccount Number: 9812-4029-1928\nRouting / SWIFT: FISBUS33" },
          ],
        },
      ],
    },
  },

  // 4. Reports
  {
    _id: "tpl-report-01",
    title: "Quarterly Performance Report",
    description: "Structured corporate quarterly report layout with KPI metrics, risks, and executive conclusions.",
    category: "Reports",
    visibility: "public",
    usageCount: 215,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Q3 Fiscal Performance & Engineering Report" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Prepared by: Corporate Strategy & Technology Division | October 2026" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Operational Highlights" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "During the third quarter, the platform observed an accelerated transition toward cloud-native document processing, showing significant improvements across latency, reliability, and collaborator adoption.",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Customer Retention increased to 94.2% year-over-year." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Average document export speed decreased to 340ms across all Word processing clusters." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Successfully completed SOC2 Type II compliance audit without findings." }] }],
            },
          ],
        },
      ],
    },
  },

  // 5. Letters
  {
    _id: "tpl-letter-01",
    title: "Executive Employment Offer Letter",
    description: "Formal corporate employment agreement letter covering compensation, benefits, and start date terms.",
    category: "Letters",
    visibility: "public",
    usageCount: 188,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Confidential Offer of Employment" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Dear Candidate,\n\nOn behalf of DocuCanvas Technologies, we are thrilled to formally extend an offer of employment for the position of Senior Full-Stack Engineer." }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Compensation & Benefits Package" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Annual Base Salary: $165,000 USD paid bi-weekly." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Equity Grant: Stock options subject to standard four-year vesting with a one-year cliff." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Health, Dental & Vision: Comprehensive employer-funded health coverage." }] }],
            },
          ],
        },
      ],
    },
  },

  // 6. Academic Assignments
  {
    _id: "tpl-academic-01",
    title: "University Research Paper & Thesis",
    description: "Academic manuscript format with abstract, methodology, data analysis, and citation references.",
    category: "Academic Assignments",
    visibility: "public",
    usageCount: 260,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Empirical Analysis of Distributed Word Document Rendering" }],
        },
        {
          type: "paragraph",
          attrs: { textAlign: "center" },
          content: [{ type: "text", text: "Department of Computer Science — Academic Research Series" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Abstract" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This paper evaluates the performance characteristics of modern rich-text schema conversions to OpenXML architectures. We demonstrate that client-side debounced state trees coupled with serverless binary packing offer superior cache efficiency and memory containment.",
            },
          ],
        },
      ],
    },
  },

  // 7. Meeting Notes
  {
    _id: "tpl-meeting-01",
    title: "Executive Board Meeting Minutes",
    description: "Meeting agenda, attendee roll call, discussion topics, and assigned action item owners.",
    category: "Meeting Notes",
    visibility: "public",
    usageCount: 175,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Executive Board Meeting Minutes" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Date: October 12, 2026 | Location: Headquarters & Virtual Conference" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Attendees" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Chief Executive Officer, Chief Technology Officer, VP of Product, Head of Security." }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Key Action Items" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "[Action] Finalize Google Cloud OAuth integration policies (Owner: Lead Architect, Due: Friday)." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "[Action] Complete template catalog verification across all 10 corporate categories (Owner: Product Team)." }] }],
            },
          ],
        },
      ],
    },
  },

  // 8. Project Documentation
  {
    _id: "tpl-projdoc-01",
    title: "Technical Architecture & System Design",
    description: "Software engineering design document detailing architecture, data models, and API interfaces.",
    category: "Project Documentation",
    visibility: "public",
    usageCount: 228,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "System Architecture & Engineering Specification" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Status: Approved | Author: Principal Systems Architect | Version: 2.4" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Architecture Overview" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The application is built on Next.js App Router, using MongoDB for document storage, TipTap for rich text editing, and OpenXML docx packaging for reliable Microsoft Word file exports.",
            },
          ],
        },
      ],
    },
  },

  // 9. Contracts and Agreements
  {
    _id: "tpl-contract-01",
    title: "Mutual Non-Disclosure Agreement (NDA)",
    description: "Standard confidential disclosure agreement protecting intellectual property and proprietary trade secrets.",
    category: "Contracts and Agreements",
    visibility: "public",
    usageCount: 310,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "MUTUAL NON-DISCLOSURE AGREEMENT" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This Mutual Non-Disclosure Agreement (the \"Agreement\") is entered into as of the Effective Date by and between the Disclosing Party and the Receiving Party.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Confidential Information Defined" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Confidential Information includes all proprietary technical data, software code, business roadmaps, trade secrets, and financial details disclosed either orally or in writing.",
            },
          ],
        },
      ],
    },
  },

  // 10. Marketing Documents
  {
    _id: "tpl-marketing-01",
    title: "Product Launch Go-To-Market Plan",
    description: "Strategic marketing campaign roadmap, audience targeting, channels, and measurable KPIs.",
    category: "Marketing Documents",
    visibility: "public",
    usageCount: 195,
    ownerId: {
      _id: "author-1",
      name: "DocuCanvas Studio",
      email: "templates@docucanvas.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuCanvas",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editorContent: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Product Launch & Go-To-Market Strategy" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Campaign: DocuCanvas Global Launch | Team: Growth & Product Marketing" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "1. Target Audience & Positioning" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Positioned at the intersection of Canva's visual simplicity and Microsoft Word's professional utility. Targeted toward business operators, proposal writers, software architects, and academics.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Key Marketing Channels" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Product Hunt & Hacker News Launch Showcases." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "LinkedIn Enterprise Thought Leadership on automated Word document generation." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Template Marketplace SEO & Community Sharing." }] }],
            },
          ],
        },
      ],
    },
  },
];
