import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TemplateModel } from "@/models";
import { checkTemplateAccess } from "@/lib/permissions";
import { updateTemplateSchema } from "@/lib/validation";
import { cacheService } from "@/lib/redis/redis";
import { fallbackStore } from "@/lib/db/fallbackStore";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();

    // Check fallback store first for sample templates
    const fallbackTpl = fallbackStore.getTemplateById(id);
    if (fallbackTpl) {
      return NextResponse.json({
        template: fallbackTpl,
        isOwner: false,
        canEdit: false,
      });
    }

    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(id)) {
        const template = await TemplateModel.findById(id).populate("ownerId", "name email image");
        if (template) {
          const isOwner = Boolean(user && template.ownerId?._id?.toString() === user.id);
          return NextResponse.json({
            template,
            isOwner,
            canEdit: isOwner,
          });
        }
      }
    } catch {
      // Ignore
    }

    if (fallbackTpl) {
      return NextResponse.json({ template: fallbackTpl, isOwner: false, canEdit: false });
    }

    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/templates/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    const userId = user?.id || "demo-user";

    const body = await req.json().catch(() => ({}));
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    let updatedTemplate: any = null;
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(id)) {
        updatedTemplate = await TemplateModel.findByIdAndUpdate(
          id,
          validation.data,
          { new: true }
        );
      }
    } catch {
      // MongoDB offline
    }

    if (!updatedTemplate) {
      updatedTemplate = fallbackStore.updateTemplate(id, validation.data);
    }

    if (!updatedTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    try {
      await cacheService.invalidatePrefix("templates:public:");
    } catch {
      // Ignore cache failure
    }

    return NextResponse.json({ template: updatedTemplate });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("PATCH /api/templates/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();

    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(id)) {
        await TemplateModel.findByIdAndDelete(id);
      }
    } catch {
      // MongoDB offline
    }

    fallbackStore.deleteTemplate(id);

    try {
      await cacheService.invalidatePrefix("templates:public:");
    } catch {
      // Ignore cache failure
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("DELETE /api/templates/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
