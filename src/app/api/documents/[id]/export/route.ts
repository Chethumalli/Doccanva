import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel } from "@/models";
import { exportTipTapToDocx } from "@/lib/docx";
import { fallbackStore } from "@/lib/db/fallbackStore";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    let docTitle = "document";
    let editorContent: Record<string, unknown> = {};

    // Check fallback store first
    const fallbackDoc = fallbackStore.getDocumentById(id);
    if (fallbackDoc) {
      docTitle = fallbackDoc.title;
      editorContent = fallbackDoc.editorContent;
    } else {
      try {
        await connectToDatabase();
        if (mongoose.Types.ObjectId.isValid(id)) {
          const doc = await DocumentModel.findById(id);
          if (doc) {
            docTitle = doc.title;
            editorContent = doc.editorContent as Record<string, unknown>;
          }
        }
      } catch {
        // Ignore
      }
    }

    if (!docTitle || Object.keys(editorContent).length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docxBuffer = await exportTipTapToDocx(editorContent, docTitle);

    const cleanFileName = docTitle
      .replace(/[^a-zA-Z0-9_\-\s.]/g, "")
      .trim() || "document";

    const encodedFileName = encodeURIComponent(`${cleanFileName}.docx`);

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${cleanFileName}.docx"; filename*=UTF-8''${encodedFileName}`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Export failed";
    console.error("GET /api/documents/[id]/export error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
