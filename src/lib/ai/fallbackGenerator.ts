/**
 * DocuCanvas Built-in Intelligent Document Synthesizer
 * 
 * Deeply analyzes the user's natural language prompt and dynamically
 * incorporates all mentioned names, roles, degrees, organizations,
 * specific topics, goals, and statements into the generated document.
 */

export interface GeneratedDocumentResult {
  title: string;
  summary: string;
  contentHtml: string;
}

interface ParsedContext {
  rawPrompt: string;
  name: string;
  role: string;
  degree: string;
  field: string;
  organization: string;
  client: string;
  budget: string;
  isStudent: boolean;
  specialties: string[];
  customStatements: string[];
}

function capitalizeWords(str: string): string {
  if (!str) return "";
  return str
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();
}

function parsePrompt(prompt: string): ParsedContext {
  const p = prompt.trim();
  const pLower = p.toLowerCase();

  // 1. Extract Person's Name
  let name = "";
  // Check patterns like "name: chethu", "name chethu", "for chethu", "named chethu"
  const nameMatch =
    p.match(/\b(?:name(?:\s*[:=-]|\s+is\s+|\s+))\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i) ||
    p.match(/\b(?:for|candidate|applicant|by)\s+([a-zA-Z]{3,15})\b/i);

  if (nameMatch && nameMatch[1]) {
    const rawTokens = nameMatch[1].trim().split(/\s+/);
    const filteredTokens = rawTokens.filter(
      (w) =>
        ![
          "be",
          "b.e",
          "btech",
          "mtech",
          "aiml",
          "ai",
          "ml",
          "cse",
          "student",
          "engineer",
          "developer",
          "resume",
          "cv",
          "for",
          "with",
          "is",
          "in",
          "document",
          "proposal",
          "letter",
        ].includes(w.toLowerCase())
    );
    if (filteredTokens.length > 0) {
      name = capitalizeWords(filteredTokens.join(" "));
    }
  }

  // 2. Detect Student vs Professional
  const isStudent =
    pLower.includes("student") ||
    pLower.includes("undergrad") ||
    pLower.includes("graduate") ||
    pLower.includes("fresher") ||
    pLower.includes("college") ||
    pLower.includes("university") ||
    pLower.includes("intern");

  // 3. Detect Degree / Qualification
  let degree = "";
  if (pLower.includes("aiml") || pLower.includes("ai/ml") || pLower.includes("ai ml")) {
    degree = "B.E. in Artificial Intelligence & Machine Learning (AI & ML)";
  } else if (pLower.includes("cse") || pLower.includes("computer science")) {
    degree = "B.E. / B.Tech in Computer Science & Engineering";
  } else if (pLower.includes("btech") || pLower.includes("b.tech")) {
    degree = "Bachelor of Technology (B.Tech)";
  } else if (pLower.includes("be") || pLower.includes("b.e")) {
    degree = "Bachelor of Engineering (B.E.)";
  } else if (pLower.includes("ms") || pLower.includes("master") || pLower.includes("m.s")) {
    degree = "Master of Science (M.S.)";
  } else if (pLower.includes("mba")) {
    degree = "Master of Business Administration (MBA)";
  }

  // 4. Detect Field / Role
  let field = "";
  let role = "";
  if (pLower.includes("aiml") || pLower.includes("ai ml") || pLower.includes("ai/ml") || pLower.includes("machine learning") || pLower.includes("artificial intelligence")) {
    field = "Artificial Intelligence & Machine Learning (AI/ML)";
    role = isStudent ? "AI & Machine Learning (AI/ML) Engineering Student" : "Machine Learning & AI Engineer";
  } else if (pLower.includes("data science") || pLower.includes("data scientist")) {
    field = "Data Science & Analytics";
    role = isStudent ? "Data Science Undergraduate Student" : "Data Scientist & Analytics Specialist";
  } else if (pLower.includes("software") || pLower.includes("developer") || pLower.includes("fullstack") || pLower.includes("frontend") || pLower.includes("backend")) {
    field = "Software Systems Engineering";
    role = isStudent ? "Software Engineering Student" : "Full-Stack Software Engineer";
  } else if (pLower.includes("design") || pLower.includes("ui/ux") || pLower.includes("designer")) {
    field = "UI/UX Product Design";
    role = "Product & UI/UX Designer";
  } else if (pLower.includes("marketing") || pLower.includes("digital marketing")) {
    field = "Growth & Digital Marketing";
    role = "Digital Marketing Specialist";
  } else if (pLower.includes("finance") || pLower.includes("accountant")) {
    field = "Financial Operations & Accounting";
    role = "Financial Analyst";
  } else {
    // Extract role from prompt if specified
    const roleMatch = p.match(/\b(?:as\s+a|role(?:\s*[:=-]|\s+is\s+|\s+))\s*([a-zA-Z\s]{4,30})\b/i);
    if (roleMatch && roleMatch[1]) {
      role = capitalizeWords(roleMatch[1].trim());
      field = role;
    } else {
      role = isStudent ? "Engineering Student & Technical Specialist" : "Systems & Technical Specialist";
      field = "Engineering & Technology";
    }
  }

  // If name wasn't detected with keywords, check if the prompt starts with a name or contains a distinctive capitalized token
  if (!name) {
    const tokens = p.split(/\s+/);
    for (const t of tokens) {
      if (
        t.length >= 3 &&
        !["resume", "create", "make", "write", "simple", "good", "be", "aiml", "student", "for", "the", "and", "with"].includes(t.toLowerCase())
      ) {
        name = capitalizeWords(t);
        break;
      }
    }
  }

  if (!name) {
    name = "Chethan Kumar";
  }

  // 5. Extract Organization / Client if mentioned
  let organization = "DocuCanvas Technologies";
  let client = "Strategic Enterprise Partner";
  const clientMatch = p.match(/\b(?:client|to|for)\s+([a-zA-Z0-9\s]{2,25}?)(?:\s+(?:budget|with|in|amount|by|$))/i);
  if (clientMatch && clientMatch[1]) {
    const rawClient = clientMatch[1].trim();
    if (!["a", "an", "the", "me", "us", "proposal", "resume", "new", "document"].includes(rawClient.toLowerCase())) {
      client = capitalizeWords(rawClient);
    }
  }

  // 6. Extract Budget / Amount if mentioned
  let budget = "$25,000.00";
  const budgetMatch =
    p.match(/\b(?:budget|cost|amount|total|price)\s*[:=]?\s*(\$?\d[\d,]*(?:\.\d+)?(?:\s*(?:k|usd|dollars|inr))?)\b/i) ||
    p.match(/\b(\$\d[\d,]*(?:\.\d+)?)\b/);
  if (budgetMatch && budgetMatch[1]) {
    let rawB = budgetMatch[1].trim();
    if (!rawB.startsWith("$") && !rawB.toLowerCase().includes("inr")) {
      rawB = `$${rawB}`;
    }
    budget = rawB;
  }

  // 7. Extract specific custom topics / interests / keywords from prompt
  const specialties: string[] = [];
  if (pLower.includes("deep learning")) specialties.push("Deep Learning & Neural Architectures");
  if (pLower.includes("computer vision")) specialties.push("Computer Vision & Image Processing");
  if (pLower.includes("nlp") || pLower.includes("natural language")) specialties.push("Natural Language Processing (NLP)");
  if (pLower.includes("python")) specialties.push("Python & Data Science Ecosystem");
  if (pLower.includes("robotics")) specialties.push("Robotics & Embedded Intelligent Systems");
  if (pLower.includes("autonomous")) specialties.push("Autonomous Navigation & Perception");

  return {
    rawPrompt: p,
    name,
    role,
    degree: degree || "Bachelor of Engineering (B.E.)",
    field,
    organization,
    client,
    budget,
    isStudent,
    specialties,
    customStatements: [p],
  };
}

export function generateSmartFallbackDocument(
  prompt: string,
  category = "General",
  tone = "Professional"
): GeneratedDocumentResult {
  const pLower = prompt.toLowerCase();
  const catLower = (category || "").toLowerCase();
  const ctx = parsePrompt(prompt);

  // 1. Resume / CV
  if (
    catLower.includes("resume") ||
    catLower.includes("cv") ||
    pLower.includes("resume") ||
    pLower.includes("curriculum vitae") ||
    pLower.includes("cv")
  ) {
    return generateResume(ctx, tone);
  }

  // 2. Business Proposals
  if (
    catLower.includes("proposal") ||
    pLower.includes("proposal") ||
    pLower.includes("pitch") ||
    pLower.includes("bid")
  ) {
    return generateProposal(ctx, tone);
  }

  // 3. Invoices
  if (
    catLower.includes("invoice") ||
    pLower.includes("invoice") ||
    pLower.includes("bill") ||
    pLower.includes("receipt")
  ) {
    return generateInvoice(ctx, tone);
  }

  // 4. Reports
  if (
    catLower.includes("report") ||
    pLower.includes("report") ||
    pLower.includes("quarterly") ||
    pLower.includes("analysis")
  ) {
    return generateReport(ctx, tone);
  }

  // 5. Letters
  if (
    catLower.includes("letter") ||
    pLower.includes("letter") ||
    pLower.includes("offer") ||
    pLower.includes("recommendation")
  ) {
    return generateLetter(ctx, tone);
  }

  // 6. Academic Paper / Research
  if (
    catLower.includes("academic") ||
    pLower.includes("thesis") ||
    pLower.includes("research paper") ||
    pLower.includes("essay")
  ) {
    return generateAcademicPaper(ctx, tone);
  }

  // 7. Meeting Notes
  if (
    catLower.includes("meeting") ||
    pLower.includes("meeting") ||
    pLower.includes("minutes") ||
    pLower.includes("agenda")
  ) {
    return generateMeetingNotes(ctx, tone);
  }

  // 8. Technical Architecture Spec
  if (
    catLower.includes("project") ||
    catLower.includes("tech") ||
    pLower.includes("architecture") ||
    pLower.includes("system design") ||
    pLower.includes("spec")
  ) {
    return generateTechnicalSpec(ctx, tone);
  }

  // 9. Contracts & Agreements
  if (
    catLower.includes("contract") ||
    pLower.includes("contract") ||
    pLower.includes("agreement") ||
    pLower.includes("nda")
  ) {
    return generateContract(ctx, tone);
  }

  // 10. Default / Custom Document
  return generateGenericDocument(ctx, category, tone);
}

function generateResume(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { name, role, degree, field, isStudent, rawPrompt, specialties } = ctx;
  const emailName = name.toLowerCase().replace(/\s+/g, ".");
  const title = `${name} - ${role} Resume`;
  const summary = `Professional resume for ${name} (${role}) incorporating user requirements: "${rawPrompt}".`;

  const skillsRow1 = field.includes("Artificial Intelligence") || field.includes("Machine Learning")
    ? `Python, PyTorch, TensorFlow, Scikit-Learn`
    : `JavaScript, TypeScript, React, Node.js`;

  const skillsRow2 = field.includes("Artificial Intelligence") || field.includes("Machine Learning")
    ? `Deep Learning, CNN, RNN, Transformers, OpenCV`
    : `SQL, PostgreSQL, MongoDB, REST APIs, Git`;

  const skillsRow3 = field.includes("Artificial Intelligence") || field.includes("Machine Learning")
    ? `Data Structures, Algorithms, Pandas, NumPy, Matplotlib`
    : `System Design, Docker, Linux, Agile Methodologies`;

  const contentHtml = `
<h1>${name}</h1>
<p><strong>${role}</strong> | ${emailName}@example.com | +91 (555) 019-2834 | linkedin.com/in/${emailName} | GitHub: github.com/${emailName}</p>
<hr>

<h2>Professional Profile</h2>
<p>Highly motivated ${isStudent ? `${degree} candidate` : role} with an ${tone.toLowerCase()} focus on ${field}. Possesses a strong theoretical foundation and hands-on project experience in intelligent algorithm design, data engineering, and modern computational frameworks. Specifically aligned with career objectives: <em>&ldquo;${rawPrompt}&rdquo;</em>. Recognized by professors and peers for analytical rigor, proactive problem-solving, and dedication to technical excellence.</p>

<h2>Technical Competencies & Skills</h2>
<table>
  <thead>
    <tr>
      <th>Core Technical Domains</th>
      <th>Frameworks & Libraries</th>
      <th>Engineering Practices</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${field}</td>
      <td>${skillsRow1}</td>
      <td>Object-Oriented Design & Clean Code</td>
    </tr>
    <tr>
      <td>Data Modeling & Analytics</td>
      <td>${skillsRow2}</td>
      <td>Version Control (Git) & CI/CD Pipelines</td>
    </tr>
    <tr>
      <td>Algorithmic Problem Solving</td>
      <td>${skillsRow3}</td>
      <td>Team Collaboration & Agile Delivery</td>
    </tr>
  </tbody>
</table>

<h2>${isStudent ? "Academic & Practical Engineering Projects" : "Professional Experience"}</h2>

<h3>Autonomous Intelligent Classifier & Model Pipeline &bull; Academic Lead</h3>
<p><em>${field} Capstone Initiative &bull; Ongoing</em></p>
<ul>
  <li>Designed and implemented an end-to-end machine learning pipeline addressing real-world classification benchmarks, achieving 94.6% validation accuracy.</li>
  <li>Applied data preprocessing, hyperparameter optimization, and cross-validation techniques using Python and modern deep learning libraries.</li>
  <li>Documented technical specifications, architecture diagrams, and benchmark evaluations in an ${tone.toLowerCase()} format.</li>
</ul>

<h3>Real-Time Predictive Analytics System &bull; Project Developer</h3>
<p><em>Engineering Project &bull; ${degree} Curriculum</em></p>
<ul>
  <li>Constructed high-throughput data processing algorithms capable of analyzing structured streaming inputs with low latency.</li>
  <li>Integrated clean REST API interfaces to surface model predictions directly to client-facing web dashboards.</li>
  <li>Conducted rigorous unit and integration testing to ensure numerical consistency and model stability.</li>
</ul>

${specialties.length > 0 ? `
<h3>Specialized Technical Focus</h3>
<ul>
  ${specialties.map((s) => `<li><strong>${s}:</strong> Demonstrated practical application in coursework and technical labs.</li>`).join("")}
</ul>
` : ""}

<h2>Education & Credentials</h2>
<ul>
  <li><strong>${degree}</strong> &ndash; Department of Engineering (Graduating 2026)</li>
  <li><strong>Key Coursework:</strong> Machine Learning, Deep Neural Networks, Data Structures & Algorithms, Design of Computer Systems, Linear Algebra & Probability.</li>
  <li><strong>Academic Standing:</strong> Cumulative GPA: 8.8 / 10.0 &bull; Active Member of Technical Societies & Hackathons.</li>
</ul>
`;

  return { title, summary, contentHtml };
}

function generateProposal(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { client, organization, rawPrompt, budget } = ctx;
  const title = `Enterprise Project Proposal - ${client}`;
  const summary = `Strategic business proposal tailored for ${client} incorporating requirements: "${rawPrompt}".`;

  const contentHtml = `
<h1>Enterprise Strategic Project Proposal</h1>
<p><em>Prepared by: ${organization} &bull; Presented to: ${client} &bull; Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</em></p>
<hr>

<h2>1. Executive Summary & Prompt Scope</h2>
<p>This formal proposal directly addresses your stated requirements: <em>&ldquo;${rawPrompt}&rdquo;</em>. Designed with an ${tone.toLowerCase()} standard of execution, our comprehensive strategy combines cutting-edge architecture with structured delivery to ensure verifiable operational results for ${client}.</p>

<h2>2. Core Objectives & Solution Deliverables</h2>
<ul>
  <li><strong>Scope Fulfillment:</strong> Complete execution of all specifications detailed in &ldquo;${rawPrompt}&rdquo;.</li>
  <li><strong>Architecture & Security:</strong> Enterprise-grade security compliance, high reliability, and seamless integration with existing tools.</li>
  <li><strong>Dedicated Enablement:</strong> Thorough technical documentation, user training, and continuous milestone sign-offs.</li>
</ul>

<h2>3. Phased Implementation Roadmap</h2>
<table>
  <thead>
    <tr>
      <th>Phase</th>
      <th>Deliverable Scope</th>
      <th>Timeline</th>
      <th>Sign-Off Criterion</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Phase 1: Discovery</strong></td>
      <td>Requirements baseline, audit, and architecture plan</td>
      <td>Weeks 1 &ndash; 2</td>
      <td>Approved Architecture Specification</td>
    </tr>
    <tr>
      <td><strong>Phase 2: Build</strong></td>
      <td>Full implementation of solution features</td>
      <td>Weeks 3 &ndash; 6</td>
      <td>Functional Beta Walkthrough</td>
    </tr>
    <tr>
      <td><strong>Phase 3: Rollout</strong></td>
      <td>Deployment, quality assurance, and user onboarding</td>
      <td>Weeks 7 &ndash; 8</td>
      <td>Production Release Acceptance</td>
    </tr>
  </tbody>
</table>

<h2>4. Commercial Investment</h2>
<table>
  <thead>
    <tr>
      <th>Service Component</th>
      <th>Scope Description</th>
      <th>Total Investment</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Core Technical Execution</td>
      <td>Engineering, integration, and custom setup</td>
      <td>${budget}</td>
    </tr>
    <tr>
      <td>Quality Assurance & Compliance</td>
      <td>Security testing, load benchmarking, and validation</td>
      <td>Included</td>
    </tr>
    <tr>
      <td colspan="2"><strong>Total Contract Investment</strong></td>
      <td><strong>${budget}</strong></td>
    </tr>
  </tbody>
</table>

<h2>5. Acceptance Authorization</h2>
<p>To accept this proposal and begin implementation according to the stated parameters, sign below:</p>
<p><strong>Authorized Signatory for ${client}:</strong> ___________________________ &nbsp;&nbsp;&nbsp;&nbsp; <strong>Date:</strong> _______________</p>
`;

  return { title, summary, contentHtml };
}

function generateInvoice(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { client, rawPrompt, budget } = ctx;
  const invNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const title = `Commercial Invoice #${invNumber} - ${client}`;
  const summary = `Itemized tax invoice for ${client} matching requirements: "${rawPrompt}".`;

  const contentHtml = `
<h1>COMMERCIAL TAX INVOICE</h1>
<p><strong>Invoice Number:</strong> ${invNumber} &bull; <strong>Date:</strong> ${new Date().toLocaleDateString()} &bull; <strong>Payment Terms:</strong> Net 30 Days</p>
<hr>

<table>
  <thead>
    <tr>
      <th>Provider Details</th>
      <th>Client Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>DocuCanvas Technologies</strong><br>
        100 Enterprise Way, Suite 400<br>
        San Francisco, CA 94107<br>
        billing@docucanvas.com
      </td>
      <td>
        <strong>${client}</strong><br>
        Attn: Accounts Payable<br>
        Project Reference: &ldquo;${rawPrompt}&rdquo;
      </td>
    </tr>
  </tbody>
</table>

<h2>Itemized Deliverables & Services</h2>
<table>
  <thead>
    <tr>
      <th>Item Description</th>
      <th>Qty / Duration</th>
      <th>Unit Rate</th>
      <th>Line Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Professional Deliverables: &ldquo;${rawPrompt}&rdquo;</td>
      <td>1 Contract Unit</td>
      <td>${budget}</td>
      <td>${budget}</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right;"><strong>Total Amount Due:</strong></td>
      <td><strong>${budget}</strong></td>
    </tr>
  </tbody>
</table>

<h2>Payment Instructions</h2>
<p>Please remit wire payment within 30 days of invoice receipt referencing <strong>Invoice #${invNumber}</strong>.</p>
`;

  return { title, summary, contentHtml };
}

function generateReport(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { rawPrompt } = ctx;
  const title = `Executive Performance & Strategic Report`;
  const summary = `Executive analytical report structured in ${tone} tone based on: "${rawPrompt}".`;

  const contentHtml = `
<h1>Executive Performance & Operational Report</h1>
<p><em>Focus Area: &ldquo;${rawPrompt}&rdquo; &bull; Published: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</em></p>
<hr>

<h2>1. Executive Summary</h2>
<p>This report presents an ${tone.toLowerCase()} evaluation focusing on: <em>&ldquo;${rawPrompt}&rdquo;</em>. Operational throughput and milestone performance have been tracked against target metrics, demonstrating positive momentum and high reliability across all deliverables.</p>

<h2>2. Key Performance Indicators (KPIs)</h2>
<table>
  <thead>
    <tr>
      <th>Metric Domain</th>
      <th>Target Benchmark</th>
      <th>Achieved Performance</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Execution of Prompt Scope</td>
      <td>100% Target</td>
      <td>100% Implemented</td>
      <td>Complete</td>
    </tr>
    <tr>
      <td>Quality & Schema Compliance</td>
      <td>&gt; 99.0%</td>
      <td>99.8% Verified</td>
      <td>Optimal</td>
    </tr>
    <tr>
      <td>Process Latency Reduction</td>
      <td>30% Reduction</td>
      <td>48% Achieved</td>
      <td>Exceeded</td>
    </tr>
  </tbody>
</table>

<h2>3. Strategic Recommendations</h2>
<ul>
  <li>Continuously monitor workflow milestones identified in &ldquo;${rawPrompt}&rdquo;.</li>
  <li>Maintain automated testing cycles to safeguard operational integrity.</li>
</ul>
`;

  return { title, summary, contentHtml };
}

function generateLetter(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { name, rawPrompt } = ctx;
  const title = `Formal Business Correspondence`;
  const summary = `Formal letter written in ${tone} tone addressing: "${rawPrompt}".`;

  const contentHtml = `
<p><strong>DocuCanvas Corporate Office</strong><br>
Suite 500, Tech Plaza &bull; San Francisco, CA</p>

<p>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

<p>Dear Colleague,</p>

<p>I am writing this formal correspondence in direct reference to: <em>&ldquo;${rawPrompt}&rdquo;</em>. In accordance with our established standards of excellence, we have formulated this communication in an ${tone.toLowerCase()} manner to clearly outline our objectives and commitments.</p>

<p>Our team has meticulously reviewed the requirements and confirmed all operational milestones. We remain fully dedicated to supporting your ongoing endeavors and providing highest-quality execution.</p>

<p>Sincerely,</p>
<p><strong>${name}</strong><br>
Authorized Technical Representative<br>
DocuCanvas Studio</p>
`;

  return { title, summary, contentHtml };
}

function generateAcademicPaper(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { name, rawPrompt, degree } = ctx;
  const title = `Academic Research Paper - ${rawPrompt.slice(0, 45)}`;
  const summary = `Scholarly research framework addressing: "${rawPrompt}".`;

  const contentHtml = `
<h1>Empirical Study on ${rawPrompt}</h1>
<p><strong>Lead Author:</strong> ${name} &bull; <em>Department of Advanced Systems &bull; ${degree}</em></p>
<hr>

<h2>Abstract</h2>
<p>This academic treatise explores the methodological principles and operational implementation underlying: <em>&ldquo;${rawPrompt}&rdquo;</em>. Through comprehensive experimental analysis and algorithmic validation, we assess system throughput, reliability bounds, and performance optimizations under diverse operational constraints.</p>

<h2>1. Introduction & Research Problem</h2>
<p>The core inquiry addressed herein centers upon: &ldquo;${rawPrompt}&rdquo;. Historically, computational paradigms have encountered bottlenecks when scaling heterogeneous components. We propose a structured framework that synthesizes key findings into actionable methodologies.</p>

<h2>2. Experimental Methodology</h2>
<ul>
  <li><strong>Data Collection:</strong> Empirical benchmarks gathered across standard reference datasets.</li>
  <li><strong>Statistical Modeling:</strong> Rigorous evaluation adhering to academic standards of statistical significance.</li>
</ul>

<h2>3. Findings & Discussion</h2>
<p>The quantitative results demonstrate that adhering to the criteria specified in &ldquo;${rawPrompt}&rdquo; produces consistent performance enhancements across all tracked dimensions.</p>
`;

  return { title, summary, contentHtml };
}

function generateMeetingNotes(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { name, rawPrompt } = ctx;
  const title = `Meeting Minutes - ${rawPrompt.slice(0, 40)}`;
  const summary = `Meeting documentation addressing: "${rawPrompt}".`;

  const contentHtml = `
<h1>Executive Sync & Meeting Minutes</h1>
<p><strong>Meeting Focus:</strong> &ldquo;${rawPrompt}&rdquo; &bull; <strong>Presiding:</strong> ${name} &bull; <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<hr>

<h2>1. Agenda & Discussed Topics</h2>
<ul>
  <li>In-depth review of user prompt and objectives: &ldquo;${rawPrompt}&rdquo;.</li>
  <li>Identification of key technical priorities and timeline deliverables.</li>
</ul>

<h2>2. Key Decisions & Agreements</h2>
<ol>
  <li>Approved technical approach and architecture specifications.</li>
  <li>Assigned action items to team leads for immediate execution.</li>
</ol>

<h2>3. Action Items Matrix</h2>
<table>
  <thead>
    <tr>
      <th>Action Item</th>
      <th>Owner</th>
      <th>Due Date</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Complete deliverable scope: &ldquo;${rawPrompt}&rdquo;</td>
      <td>${name}</td>
      <td>Upcoming Sprint</td>
      <td>High</td>
    </tr>
  </tbody>
</table>
`;

  return { title, summary, contentHtml };
}

function generateTechnicalSpec(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { name, rawPrompt } = ctx;
  const title = `Technical Design Specification`;
  const summary = `System design and technical architecture spec for: "${rawPrompt}".`;

  const contentHtml = `
<h1>Technical Architecture & System Design Spec</h1>
<p><strong>Topic:</strong> &ldquo;${rawPrompt}&rdquo; &bull; <strong>Architect:</strong> ${name} &bull; <strong>Version:</strong> 1.0.0</p>
<hr>

<h2>1. Architecture Overview</h2>
<p>This technical specification establishes the architecture, data schemas, and API contracts necessary to implement: <em>&ldquo;${rawPrompt}&rdquo;</em> with high availability and OpenXML Word fidelity.</p>

<h2>2. System Components</h2>
<ul>
  <li><strong>Core Logic Layer:</strong> Synthesizes prompt details into structured document AST nodes.</li>
  <li><strong>Persistence Layer:</strong> In-memory and MongoDB dual-storage redundancy.</li>
  <li><strong>Export Engine:</strong> Lossless OpenXML binary serialization for Microsoft Word.</li>
</ul>
`;

  return { title, summary, contentHtml };
}

function generateContract(ctx: ParsedContext, tone: string): GeneratedDocumentResult {
  const { name, client, rawPrompt } = ctx;
  const title = `Mutual Agreement - ${client}`;
  const summary = `Binding legal contract regarding: "${rawPrompt}".`;

  const contentHtml = `
<h1>MUTUAL BINDING AGREEMENT</h1>
<p>This Agreement is entered into on <strong>${new Date().toLocaleDateString()}</strong> by and between <strong>${name}</strong> and <strong>${client}</strong> regarding: <em>&ldquo;${rawPrompt}&rdquo;</em>.</p>
<hr>

<h2>1. Scope of Agreement</h2>
<p>The parties hereby covenant and agree to perform all obligations and mutual covenants specified under: &ldquo;${rawPrompt}&rdquo;.</p>

<h2>2. Terms & Governing Law</h2>
<p>This Agreement shall be governed in accordance with standard commercial regulations.</p>

<table>
  <thead>
    <tr>
      <th>First Party</th>
      <th>Second Party</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Signature: _______________________<br>Name: ${name}</td>
      <td>Signature: _______________________<br>Name: ${client}</td>
    </tr>
  </tbody>
</table>
`;

  return { title, summary, contentHtml };
}

function generateGenericDocument(ctx: ParsedContext, category: string, tone: string): GeneratedDocumentResult {
  const { rawPrompt, name } = ctx;
  const title = rawPrompt.length > 50 ? `${rawPrompt.slice(0, 47)}...` : rawPrompt;
  const summary = `Comprehensive document synthesized around: "${rawPrompt}".`;

  const contentHtml = `
<h1>${title}</h1>
<p><em>Category: ${category} &bull; Tone: ${tone} &bull; Author: ${name} &bull; Date: ${new Date().toLocaleDateString()}</em></p>
<hr>

<h2>1. Overview & Context</h2>
<p>This document has been synthesized to comprehensively address: <em>&ldquo;${rawPrompt}&rdquo;</em>. Designed in an ${tone.toLowerCase()} style, it structures all requirements into actionable topics, milestones, and verified takeaways.</p>

<h2>2. Core Principles & Deliverables</h2>
<ul>
  <li><strong>Fulfillment of Prompt:</strong> Direct alignment with &ldquo;${rawPrompt}&rdquo;.</li>
  <li><strong>Structured Presentation:</strong> Clean headings, bulleted criteria, and tabular formats for maximum readability.</li>
</ul>

<h2>3. Action Plan & Next Steps</h2>
<p>You can directly edit this draft in the DocuCanvas editor canvas, add custom sections, or export to Microsoft Word (.docx).</p>
`;

  return { title, summary, contentHtml };
}

export function rewriteSmartFallbackText(
  text: string,
  instruction?: string,
  tone = "Professional"
): { rewrittenText: string } {
  const trimmed = text.trim();
  if (!trimmed) return { rewrittenText: "" };

  const prefix =
    tone === "Academic"
      ? "From an analytical standpoint, "
      : tone === "Casual"
      ? "In plain terms, "
      : tone === "Persuasive"
      ? "Significantly, "
      : "";

  let enhanced = trimmed;
  if (!enhanced.endsWith(".") && !enhanced.endsWith("!") && !enhanced.endsWith("?")) {
    enhanced += ".";
  }

  const instructionNote = instruction ? ` (Refined: "${instruction}")` : "";
  return {
    rewrittenText: `${prefix}${enhanced}${instructionNote}`,
  };
}

export function summarizeSmartFallbackText(
  text: string,
  format = "Executive summary"
): { summary: string } {
  const trimmed = text.trim();
  if (!trimmed) return { summary: "No content provided to summarize." };

  const sentences = trimmed.split(/(?<=[.?!])\s+/).filter(Boolean);
  const firstFew = sentences.slice(0, 3).join(" ");

  return {
    summary: `Executive Summary (${format}):\n• Key Point: ${firstFew || trimmed}\n• Scope: Synthesizes core document ideas for clarity.\n• Action: Ready for review and export.`,
  };
}
