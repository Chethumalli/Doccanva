# DocuCanvas — DOCX Template Suite & Word Editor

> A Canva-inspired, production-oriented web application designed for creating, editing, managing, sharing, and publishing Microsoft Word document templates with Google Gemini AI.

---

## 🚀 Features

- **Google OAuth & Secure Sessions:** Sign in with official Google OAuth via Auth.js / NextAuth, complete with session persistence and fallback development credentials.
- **Word Document Editor (TipTap):** Full rich-text editor with headings (H1–H3), bold, italic, underline, strikethrough, text color, highlight, paragraph alignments, bullet & ordered lists, 3x3 tables, hyperlinks, and images.
- **Paper Canvas Layout:** Standard 8.5" x 11" Word paper layout with realistic margins, print styling, and responsive scaling.
- **Real-Time Autosave:** Debounced autosaving with live status badges (`Saved`, `Saving`, `Unsaved`, `Failed`), conflict resolution, and versioning.
- **DOCX Import & Export:**
  - **Export:** Converts TipTap JSON into valid Microsoft Word `.docx` archives preserving typography, tables, headings, and lists.
  - **Import:** Upload `.docx` files, validated with magic byte checks and converted into sanitized HTML via `mammoth`.
- **Public & Private Templates:** Publish reusable templates in categories (Business Proposals, Resumes, Invoices, Reports, Letters, etc.) or keep them strictly private.
- **One-Click Clones:** Independent duplication ensuring changes to new documents never modify the original template.
- **Cryptographic Share Links:** Share view or edit permissions with unguessable random tokens, SHA-256 hashes, and optional expiration dates.
- **Email Invitations:** Send collaboration invitations via Nodemailer, verify email identity upon acceptance, and manage collaborator roles.
- **Google Gemini AI Assistant:** Server-side Gemini 1.5 Flash integration to generate proposals, rewrite text to change tone, and summarize documents.
- **Redis Caching & Rate Limiting:** High-performance caching for public templates with invalidation upon template changes, plus rate-limiting on AI endpoints with in-memory fallbacks.
- **Comprehensive Test Suite:** Automated Vitest unit and integration tests covering tokens, validation schemas, cache operations, and DOCX archive validity.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| **Rich-Text Editor** | TipTap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, extensions) |
| **State Management**| Zustand stores (`useEditorStore`, `useDashboardStore`) |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | NextAuth (Auth.js) with Google Provider |
| **Document Engine** | `docx` (Word generator) + `mammoth` (DOCX parser) + `sanitize-html` |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) |
| **Cache & Limiting** | Redis (`ioredis`) with seamless in-memory fallback |
| **Email Service** | Nodemailer with responsive HTML templates |
| **Validation** | Zod v3 |
| **Testing** | Vitest |

---

## 📋 Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/docucanvas`) or a MongoDB Atlas connection string.
- *(Optional)* **Redis**: Local Redis server or Upstash Redis URL.
- *(Optional)* **Google Cloud OAuth Client ID & Secret**.
- *(Optional)* **Google Gemini API Key**.

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "canva bot"
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/docucanvas

# NextAuth Secret
AUTH_SECRET=development_secret_32_characters_random_docucanvas_key_2025
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (Optional in dev: fallback credentials provider available)
AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_google_client_secret

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Redis (Optional: falls back to in-memory cache)
REDIS_URL=redis://localhost:6379

# Email (Optional: logs invitation URLs to console if omitted)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="DocuCanvas <noreply@docucanvas.com>"
```

### 3. Seed Database
Run the automated seed script to populate sample templates, categories, and a demo document:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated Vitest test suite:
```bash
npm test
```
Runs unit and integration tests:
- Cryptographic token generation and SHA-256 hashing
- Zod schema validation for documents, templates, share links, and invitations
- In-memory cache operations, prefix invalidation, and rate limiting
- Real DOCX OpenXML archive generation verifying magic byte signatures (`PK\x03\x04`)

---

## 🔑 Service Configuration Guides

### Google OAuth Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services > Credentials**.
3. Configure the **OAuth Consent Screen** (User Type: External).
4. Create an **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000` (and your production domain)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (and `https://your-domain.vercel.app/api/auth/callback/google`)
5. Copy the Client ID and Client Secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

### Google Gemini API Setup
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a new key.
3. Add it to `GEMINI_API_KEY` in `.env.local`.

### MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user under **Database Access**.
3. In **Network Access**, add `0.0.0.0/0` (or your specific server IP).
4. Copy the connection string into `MONGODB_URI`.

---

## 📂 Project Architecture

```
docucanvas/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx      # Sign in (Google & Dev credentials)
│   │   ├── dashboard/page.tsx         # Workspace dashboard & filters
│   │   ├── editor/[id]/page.tsx       # Word-style document editor
│   │   ├── templates/page.tsx         # Public template gallery
│   │   ├── shared/[token]/page.tsx    # Shared document access
│   │   ├── settings/page.tsx          # Account settings & health diagnostics
│   │   └── api/                       # REST route handlers
│   ├── components/
│   │   ├── layout/                    # Navbar, Sidebar
│   │   ├── dashboard/                 # DocumentCard, DocumentTable, FilterBar, CreateDocModal
│   │   ├── editor/                    # EditorToolbar, EditorCanvas, AIModal, ShareModal, ExportPreviewModal, VersionHistoryModal, SaveTemplateModal
│   │   └── templates/                 # TemplateCard, TemplatePreviewModal
│   ├── lib/
│   │   ├── auth/                      # NextAuth configuration & session helpers
│   │   ├── db/                        # Mongoose database connection singleton
│   │   ├── redis/                     # Redis cache & rate limiter with memory fallback
│   │   ├── permissions/               # Centralized authorization & access checks
│   │   ├── email/                     # Nodemailer invitation sender
│   │   ├── ai/                        # Google Gemini API wrapper
│   │   ├── docx/                      # Mammoth parser & docx archive generator
│   │   └── validation/                # Zod request validation schemas
│   ├── models/                        # Mongoose data models
│   ├── stores/                        # Zustand stores (useEditorStore, useDashboardStore)
│   └── types/                         # TypeScript interfaces
├── tests/                             # Vitest automated test suite
├── scripts/seed.ts                    # Database population script
├── .env.example                       # Environment configuration template
├── DEPLOYMENT.md                      # Production deployment guide
└── README.md
```

---

## 📄 License
MIT © 2026 DocuCanvas
