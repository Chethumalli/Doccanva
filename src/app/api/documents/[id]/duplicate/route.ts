import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel } from "@/models";
import { checkDocumentAccess } from "@/lib/permissions";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await checkDocumentAccess(id, user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await connectToDatabase();
    const sourceDoc = await DocumentModel.findById(id);
    if (!sourceDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const duplicatedDoc = await DocumentModel.create({
      ownerId: new mongoose.Types.ObjectId(user.id),
      title: `${sourceDoc.title} (Copy)`,
      editorContent: sourceDoc.editorContent,
      schemaVersion: sourceDoc.schemaVersion,
      visibility: "private",
      templateId: sourceDoc.templateId,
      wordCount: sourceDoc.wordCount,
      characterCount: sourceDoc.characterCount,
    });

    return NextResponse.json({ document: duplicatedDoc }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/documents/[id]/duplicate error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
