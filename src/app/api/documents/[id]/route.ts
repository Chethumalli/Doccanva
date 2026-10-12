import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel, DocumentVersionModel } from "@/models";
import { checkDocumentAccess } from "@/lib/permissions";
import { updateDocumentSchema } from "@/lib/validation";
import { fallbackStore } from "@/lib/db/fallbackStore";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();

    // Check fallback store first
    const fallbackDoc = fallbackStore.getDocumentById(id);
    if (fallbackDoc) {
      return NextResponse.json({
        document: fallbackDoc,
        accessLevel: "owner",
        canEdit: true,
        canShare: true,
        canDelete: true,
      });
    }

    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(id)) {
        const document = await DocumentModel.findById(id).populate("ownerId", "name email image");
        if (document) {
          const isOwner = Boolean(user && document.ownerId?._id?.toString() === user.id);
          return NextResponse.json({
            document,
            accessLevel: isOwner ? "owner" : "viewer",
            canEdit: isOwner,
            canShare: isOwner,
            canDelete: isOwner,
          });
        }
      }
    } catch {
      // Ignore
    }

    if (fallbackDoc) {
      return NextResponse.json({
        document: fallbackDoc,
        accessLevel: "owner",
        canEdit: true,
        canShare: true,
        canDelete: true,
      });
    }

    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/documents/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/documents/[id] - update document content/title (autosave)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();

    const body = await req.json().catch(() => ({}));
    const validation = updateDocumentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, editorContent, visibility, wordCount, characterCount } = validation.data;

    // Check fallback store
    const fallbackDoc = fallbackStore.getDocumentById(id);
    if (fallbackDoc) {
      if (title !== undefined) fallbackDoc.title = title;
      if (editorContent !== undefined) {
        fallbackDoc.editorContent = editorContent;
        fallbackDoc.currentVersion += 1;
      }
      if (visibility !== undefined) fallbackDoc.visibility = visibility;
      if (wordCount !== undefined) fallbackDoc.wordCount = wordCount;
      if (characterCount !== undefined) fallbackDoc.characterCount = characterCount;

      fallbackStore.saveDocument(fallbackDoc);
      return NextResponse.json({
        document: fallbackDoc,
        version: fallbackDoc.currentVersion,
      });
    }

    try {
      await connectToDatabase();
      const updateData: Record<string, unknown> = {};

      if (title !== undefined) updateData.title = title;
      if (editorContent !== undefined) {
        updateData.editorContent = editorContent;
        updateData.$inc = { currentVersion: 1 };
      }
      if (visibility !== undefined) updateData.visibility = visibility;
      if (wordCount !== undefined) updateData.wordCount = wordCount;
      if (characterCount !== undefined) updateData.characterCount = characterCount;

      const updatedDocument = await DocumentModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (updatedDocument) {
        return NextResponse.json({
          document: updatedDocument,
          version: updatedDocument.currentVersion,
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("PATCH /api/documents/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/documents/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";

    const fallbackDoc = fallbackStore.getDocumentById(id);
    if (fallbackDoc) {
      if (permanent || fallbackDoc.deletedAt) {
        fallbackStore.deleteDocumentPermanent(id);
        return NextResponse.json({ message: "Document permanently deleted" });
      } else {
        fallbackStore.trashDocument(id);
        return NextResponse.json({ message: "Document moved to trash" });
      }
    }

    try {
      await connectToDatabase();
      const doc = await DocumentModel.findById(id);
      if (doc) {
        if (permanent || doc.deletedAt) {
          await DocumentModel.findByIdAndDelete(id);
          await DocumentVersionModel.deleteMany({ documentId: id });
          return NextResponse.json({ message: "Document permanently deleted" });
        } else {
          doc.deletedAt = new Date();
          await doc.save();
          return NextResponse.json({ message: "Document moved to trash" });
        }
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({ message: "Document removed" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("DELETE /api/documents/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
