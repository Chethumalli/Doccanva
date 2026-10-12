import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "disconnected";
  try {
    await connectToDatabase();
    dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
  } catch {
    dbStatus = "error";
  }

  const googleOAuth = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const geminiAI = Boolean(process.env.GEMINI_API_KEY);
  const redis = Boolean(process.env.REDIS_URL);
  const email = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

  return NextResponse.json({
    status: "ok",
    services: {
      mongodb: dbStatus,
      googleOAuth: googleOAuth ? "configured" : "developer-fallback",
      geminiAI: geminiAI ? "configured" : "mock-or-missing-key",
      redis: redis ? "configured" : "in-memory-fallback",
      email: email ? "configured" : "console-fallback",
    },
    version: "1.0.0",
    uptime: process.uptime(),
  });
}
