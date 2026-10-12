import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TemplateModel } from "@/models";
import { fallbackStore } from "@/lib/db/fallbackStore";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    const userId = user?.id || "demo-user";

    // 1. Check fallback store first
    let source: any = fallbackStore.getTemplateById(id);

    // 2. If not found in fallback, check MongoDB
    if (!source) {
      try {
        await connectToDatabase();
        if (mongoose.Types.ObjectId.isValid(id)) {
          source = await TemplateModel.findById(id);
        }
      } catch {
        // Ignore
      }
    }

    if (!source) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    let duplicated: any = null;
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(userId)) {
        duplicated = await TemplateModel.create({
          ownerId: new mongoose.Types.ObjectId(userId),
          title: `${source.title} (My Copy)`,
          description: source.description,
          category: source.category,
          editorContent: source.editorContent,
          schemaVersion: source.schemaVersion || 1,
          visibility: "private",
          previewImage: source.previewImage || "",
          usageCount: 0,
        });
      }
    } catch {
      // Ignore
    }

    if (!duplicated) {
      duplicated = {
        _id: `tpl-${Date.now()}`,
        ownerId: {
          _id: userId,
          name: user?.name || "Designer",
          email: user?.email || "designer@docucanvas.com",
          image: user?.image || "",
        },
        title: `${source.title} (My Copy)`,
        description: source.description,
        category: source.category,
        editorContent: source.editorContent,
        schemaVersion: 1,
        visibility: "private",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallbackStore.addTemplate(duplicated);
    }

    return NextResponse.json({ template: duplicated }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/templates/[id]/duplicate error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
