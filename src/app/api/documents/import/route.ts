import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { parseDocxBuffer } from "@/lib/docx";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel } from "@/models";
import mongoose from "mongoose";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const createDoc = formData.get("createDoc") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate filename & extension
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { error: "Invalid file format. Only Microsoft Word (.docx) files are supported." },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 20MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate ZIP/DOCX magic bytes (PK\x03\x04 = 0x50 0x4B 0x03 0x04)
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x50 ||
      buffer[1] !== 0x4b ||
      buffer[2] !== 0x03 ||
      buffer[3] !== 0x04
    ) {
      return NextResponse.json(
        { error: "The uploaded file is not a valid DOCX package." },
        { status: 400 }
      );
    }

    const { html, messages } = await parseDocxBuffer(buffer);

    const docTitle = file.name.replace(/\.docx$/i, "") || "Imported Document";

    // If requested to save as a new document right away
    if (createDoc) {
      await connectToDatabase();
      const initialJson = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: docTitle }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Imported from Microsoft Word" }],
          },
        ],
      };

      const newDoc = await DocumentModel.create({
        ownerId: new mongoose.Types.ObjectId(user.id),
        title: docTitle,
        editorContent: initialJson,
      });

      return NextResponse.json({
        document: newDoc,
        importedHtml: html,
        messages,
      });
    }

    return NextResponse.json({
      title: docTitle,
      html,
      messages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "DOCX import failed";
    console.error("POST /api/documents/import error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
