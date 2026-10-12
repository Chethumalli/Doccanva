import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel, TemplateModel } from "@/models";
import { createDocumentSchema } from "@/lib/validation";
import { fallbackStore, StoredDocument } from "@/lib/db/fallbackStore";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/documents - list user's documents
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    const userId = user?.id || "demo-user";

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const view = searchParams.get("view") || "active";
    const sort = searchParams.get("sort") || "updatedAt_desc";

    let documents: any[] = [];
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(userId)) {
        const filter: Record<string, unknown> = {
          ownerId: new mongoose.Types.ObjectId(userId),
        };

        if (view === "trash") {
          filter.deletedAt = { $ne: null };
        } else {
          filter.deletedAt = null;
        }

        if (search.trim()) {
          filter.title = { $regex: search.trim(), $options: "i" };
        }

        let sortOption: Record<string, 1 | -1> = { updatedAt: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };
        else if (sort === "oldest") sortOption = { createdAt: 1 };
        else if (sort === "name_asc") sortOption = { title: 1 };
        else if (sort === "name_desc") sortOption = { title: -1 };

        documents = await DocumentModel.find(filter)
          .sort(sortOption)
          .limit(100)
          .lean();
      }
    } catch {
      // MongoDB offline - use fallback store
    }

    if (!documents || documents.length === 0) {
      documents = fallbackStore.getDocuments(userId, search, view, sort);
    }

    return NextResponse.json({ documents });
  } catch (error: unknown) {
    const fallbackDocs = fallbackStore.getDocuments();
    return NextResponse.json({ documents: fallbackDocs });
  }
}

// POST /api/documents - create new document
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    const userId = user?.id || "demo-user";

    const body = await req.json().catch(() => ({}));
    const validation = createDocumentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, templateId, editorContent, visibility } = validation.data;

    let initialContent = editorContent;
    let initialTitle = title || "Untitled Document";

    // Check if templateId comes from static fallback store
    if (templateId) {
      const fallbackTpl = fallbackStore.getTemplateById(templateId);
      if (fallbackTpl) {
        initialContent = fallbackTpl.editorContent;
        if (!title) {
          initialTitle = `${fallbackTpl.title} (Copy)`;
        }
      }
    }

    // Try MongoDB first if connected and templateId is MongoDB ObjectId
    let newDoc: any = null;
    try {
      await connectToDatabase();

      if (templateId && mongoose.Types.ObjectId.isValid(templateId)) {
        const template = await TemplateModel.findById(templateId);
        if (template) {
          initialContent = template.editorContent;
          if (!title) initialTitle = `${template.title} (Copy)`;
          await TemplateModel.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } });
        }
      }

      if (mongoose.Types.ObjectId.isValid(userId)) {
        newDoc = await DocumentModel.create({
          ownerId: new mongoose.Types.ObjectId(userId),
          title: initialTitle,
          editorContent: initialContent || {
            type: "doc",
            content: [
              { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: initialTitle }] },
              { type: "paragraph", content: [{ type: "text", text: "Start writing your document..." }] },
            ],
          },
          visibility: visibility || "private",
          templateId: templateId && mongoose.Types.ObjectId.isValid(templateId) ? new mongoose.Types.ObjectId(templateId) : null,
        });
      }
    } catch {
      // Fallback
    }

    if (!newDoc) {
      const fallbackDoc: StoredDocument = {
        _id: `doc-${Date.now()}`,
        ownerId: userId,
        title: initialTitle,
        editorContent: (initialContent as Record<string, unknown>) || {
          type: "doc",
          content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: initialTitle }] },
            { type: "paragraph", content: [{ type: "text", text: "Start writing your document..." }] },
          ],
        },
        schemaVersion: 1,
        visibility: visibility || "private",
        templateId: templateId || null,
        currentVersion: 1,
        wordCount: 10,
        characterCount: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          name: user?.name || "Designer",
          email: user?.email || "designer@docucanvas.com",
          image: user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Designer",
        },
      };

      newDoc = fallbackStore.saveDocument(fallbackDoc);
    }

    return NextResponse.json({ document: newDoc }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/documents error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
