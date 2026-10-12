import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TemplateModel } from "@/models";
import { cacheService } from "@/lib/redis/redis";
import { fallbackStore } from "@/lib/db/fallbackStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "All";
    const search = searchParams.get("search") || "";

    const cacheKey = `templates:public:${category.toLowerCase()}:${search.toLowerCase().trim()}`;
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      return NextResponse.json({ templates: cachedData, source: "cache" });
    }

    let templates: any[] = [];
    try {
      await connectToDatabase();
      const filter: Record<string, unknown> = {
        visibility: "public",
      };

      if (category && category !== "All") {
        filter.category = category;
      }

      if (search.trim()) {
        filter.$or = [
          { title: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      }

      templates = await TemplateModel.find(filter)
        .populate("ownerId", "name image")
        .sort({ usageCount: -1, createdAt: -1 })
        .limit(60)
        .lean();
    } catch (dbErr) {
      console.warn("MongoDB query skipped, using built-in template catalogue:", (dbErr as any)?.message);
    }

    // If database returned no templates or is unavailable, use full built-in sample templates
    if (!templates || templates.length === 0) {
      templates = fallbackStore.getTemplates(category, search);
    }

    // Cache result
    await cacheService.set(cacheKey, templates, 300);

    return NextResponse.json({ templates, source: "live" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/templates/public fallback:", msg);
    const fallbackTemplates = fallbackStore.getTemplates();
    return NextResponse.json({ templates: fallbackTemplates, source: "fallback" });
  }
}
