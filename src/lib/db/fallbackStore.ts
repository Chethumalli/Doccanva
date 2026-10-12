import fs from "fs";
import path from "path";
import { DEFAULT_TEMPLATES, StaticTemplate } from "../templates/defaultTemplates";

export interface StoredDocument {
  _id: string;
  ownerId: string;
  title: string;
  editorContent: Record<string, unknown>;
  schemaVersion: number;
  visibility: "private" | "public";
  templateId?: string | null;
  currentVersion: number;
  wordCount: number;
  characterCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    name: string;
    email: string;
    image: string;
  };
}

const STORE_FILE_PATH = path.join(process.cwd(), ".local_store.json");

class FallbackStore {
  private templates: Map<string, StaticTemplate> = new Map();
  private documents: Map<string, StoredDocument> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // 1. Always load standard built-in sample templates
    for (const tpl of DEFAULT_TEMPLATES) {
      this.templates.set(tpl._id, tpl);
    }

    // 2. Default Welcome Document
    const initialDoc: StoredDocument = {
      _id: "doc-welcome-01",
      ownerId: "demo-user",
      title: "Welcome to DocuCanvas.docx",
      editorContent: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to DocuCanvas Studio" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Congratulations! Your Word template workspace is ready to use. You can edit text, style headings, insert tables, use Google Gemini AI to draft content, and click 'Export DOCX' to download valid Microsoft Word documents.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Key Features to Explore" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Export to Microsoft Word: Download as .docx anytime from the top bar." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "AI Assistant: Click 'AI Assistant' in the toolbar to draft or rewrite content with Gemini." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Share & Collaborate: Generate secure view/edit links or invite via email." }] }],
              },
            ],
          },
        ],
      },
      schemaVersion: 1,
      visibility: "private",
      currentVersion: 1,
      wordCount: 78,
      characterCount: 460,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        name: "Chethan Kumar",
        email: "demo@docucanvas.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chethan",
      },
    };
    this.documents.set(initialDoc._id, initialDoc);

    // 3. Restore persisted documents and templates from local file if available
    try {
      if (fs.existsSync(STORE_FILE_PATH)) {
        const raw = fs.readFileSync(STORE_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed.templates)) {
          for (const t of parsed.templates) {
            if (t && t._id) {
              this.templates.set(t._id, t);
            }
          }
        }

        if (Array.isArray(parsed.documents)) {
          for (const d of parsed.documents) {
            if (d && d._id) {
              d.createdAt = new Date(d.createdAt || Date.now());
              d.updatedAt = new Date(d.updatedAt || Date.now());
              if (d.deletedAt) d.deletedAt = new Date(d.deletedAt);
              this.documents.set(d._id, d);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to read .local_store.json, using default state:", e);
    }
  }

  private persist() {
    try {
      const data = {
        templates: Array.from(this.templates.values()),
        documents: Array.from(this.documents.values()),
      };
      fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write to .local_store.json:", e);
    }
  }

  // --- Templates ---
  getTemplates(category = "All", search = ""): StaticTemplate[] {
    let list = Array.from(this.templates.values());

    if (category && category !== "All") {
      list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.usageCount - a.usageCount);
  }

  getTemplateById(id: string): StaticTemplate | null {
    return this.templates.get(id) || null;
  }

  addTemplate(tpl: StaticTemplate): StaticTemplate {
    this.templates.set(tpl._id, tpl);
    this.persist();
    return tpl;
  }

  getUserTemplates(userId?: string): StaticTemplate[] {
    const list = Array.from(this.templates.values());
    if (!userId) return list;
    return list.filter((t) => t.ownerId?._id === userId);
  }

  updateTemplate(id: string, data: Partial<StaticTemplate>): StaticTemplate | null {
    const existing = this.templates.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.templates.set(id, updated);
    this.persist();
    return updated;
  }

  deleteTemplate(id: string): boolean {
    const res = this.templates.delete(id);
    this.persist();
    return res;
  }

  // --- Documents ---
  getDocuments(userId?: string, search = "", view = "active", sortBy = "updatedAt_desc"): StoredDocument[] {
    let list = Array.from(this.documents.values());

    if (view === "trash") {
      list = list.filter((d) => Boolean(d.deletedAt));
    } else {
      list = list.filter((d) => !d.deletedAt);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "name_asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return list;
  }

  getDocumentById(id: string): StoredDocument | null {
    let doc = this.documents.get(id);
    if (doc) return doc;

    // Auto-recover any requested document ID so it never blocks or breaks the user's editor
    if (id && id.startsWith("doc-")) {
      doc = {
        _id: id,
        ownerId: "demo-user",
        title: "Untitled Document.docx",
        editorContent: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Untitled Document" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Start drafting your document or use the Google Gemini AI Assistant from the toolbar.",
                },
              ],
            },
          ],
        },
        schemaVersion: 1,
        visibility: "private",
        currentVersion: 1,
        wordCount: 15,
        characterCount: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          name: "Chethan Kumar",
          email: "designer@docucanvas.com",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chethan",
        },
      };

      this.documents.set(id, doc);
      this.persist();
      return doc;
    }

    return null;
  }

  saveDocument(doc: StoredDocument): StoredDocument {
    doc.updatedAt = new Date();
    this.documents.set(doc._id, doc);
    this.persist();
    return doc;
  }

  trashDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;
    doc.deletedAt = new Date();
    this.persist();
    return true;
  }

  restoreDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;
    doc.deletedAt = null;
    this.persist();
    return true;
  }

  deleteDocumentPermanent(id: string): boolean {
    const res = this.documents.delete(id);
    this.persist();
    return res;
  }
}

// Global singleton for Next.js hot reload
declare global {
  // eslint-disable-next-line no-var
  var globalFallbackStore: FallbackStore | undefined;
}

export const fallbackStore = global.globalFallbackStore || new FallbackStore();

if (!global.globalFallbackStore) {
  global.globalFallbackStore = fallbackStore;
}

export default fallbackStore;
