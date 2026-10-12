import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel, DocumentVersionModel } from "@/models";
import { checkDocumentAccess } from "@/lib/permissions";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    const access = await checkDocumentAccess(id, user?.id);

    if (!access.hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await connectToDatabase();
    const versions = await DocumentVersionModel.find({ documentId: id })
      .populate("createdBy", "name email image")
      .sort({ versionNumber: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ versions });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/documents/[id]/versions error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await checkDocumentAccess(id, user.id);
    if (!access.canEdit) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    await connectToDatabase();
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const description = body.description || `Manual snapshot v${doc.currentVersion}`;

    const version = await DocumentVersionModel.create({
      documentId: doc._id,
      versionNumber: doc.currentVersion,
      editorContent: doc.editorContent,
      description,
      createdBy: new mongoose.Types.ObjectId(user.id),
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/documents/[id]/versions error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
