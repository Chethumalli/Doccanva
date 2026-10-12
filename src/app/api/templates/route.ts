import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TemplateModel } from "@/models";
import { createTemplateSchema } from "@/lib/validation";
import { cacheService } from "@/lib/redis/redis";
import { fallbackStore } from "@/lib/db/fallbackStore";
import { StaticTemplate } from "@/lib/templates/defaultTemplates";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    const userId = user?.id || "demo-user";
    const userName = user?.name || "Chethan Kumar";
    const userEmail = user?.email || "designer@docucanvas.com";
    const userImage = user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

    const body = await req.json().catch(() => ({}));
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, category, editorContent, visibility, previewImage } =
      validation.data;

    let template: any = null;
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(userId)) {
        template = await TemplateModel.create({
          ownerId: new mongoose.Types.ObjectId(userId),
          title,
          description: description || "",
          category,
          editorContent,
          visibility: visibility || "public",
          previewImage: previewImage || "",
          usageCount: 0,
        });
      }
    } catch {
      // MongoDB offline - fallback will handle persistence
    }

    // Save in fallback store if MongoDB is offline or user is demo
    if (!template) {
      const fallbackTpl: StaticTemplate = {
        _id: `tpl-${Date.now()}`,
        title,
        description: description || "",
        category,
        visibility: visibility || "public",
        usageCount: 0,
        previewImage: previewImage || "",
        editorContent: editorContent as Record<string, unknown>,
        ownerId: {
          _id: userId,
          name: userName,
          email: userEmail,
          image: userImage,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      template = fallbackStore.addTemplate(fallbackTpl);
    }

    // Invalidate public template cache if redis is available
    if (visibility === "public") {
      try {
        await cacheService.invalidatePrefix("templates:public:");
      } catch {
        // Ignore cache failure
      }
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/templates error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
