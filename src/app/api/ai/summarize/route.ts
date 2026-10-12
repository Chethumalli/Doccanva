import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { aiSummarizeSchema } from "@/lib/validation";
import { summarizeDocumentText, AIServiceError } from "@/lib/ai";
import { cacheService } from "@/lib/redis/redis";

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    const userId = user?.id || "demo-user";

    const rateLimit = await cacheService.checkRateLimit(`ai:sum:${userId}`, 15, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many AI summarize requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = aiSummarizeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { text, format } = validation.data;
    const result = await summarizeDocumentText(text, format);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof AIServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "AI service error";
    console.error("POST /api/ai/summarize error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
