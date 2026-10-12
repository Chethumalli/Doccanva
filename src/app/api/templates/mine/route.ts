import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TemplateModel } from "@/models";
import { fallbackStore } from "@/lib/db/fallbackStore";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getServerUser();
    const userId = user?.id || "demo-user";

    let templates: any[] = [];
    try {
      await connectToDatabase();
      if (mongoose.Types.ObjectId.isValid(userId)) {
        templates = await TemplateModel.find({
          ownerId: new mongoose.Types.ObjectId(userId),
        })
          .sort({ updatedAt: -1 })
          .lean();
      }
    } catch {
      // MongoDB offline
    }

    if (!templates || templates.length === 0) {
      templates = fallbackStore.getUserTemplates(userId);
    }

    return NextResponse.json({ templates });
  } catch (error: unknown) {
    const fallbackTemplates = fallbackStore.getUserTemplates("demo-user");
    return NextResponse.json({ templates: fallbackTemplates });
  }
}
