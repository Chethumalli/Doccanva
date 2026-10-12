import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim() || "";
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim() || "";
  const isConfigured = Boolean(clientId && clientSecret);

  // Derive base URL for redirect URI
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/auth/callback/google`;

  let maskedId = "";
  if (isConfigured && clientId.length > 8) {
    maskedId = clientId.slice(0, 8) + "..." + clientId.slice(-8);
  }

  return NextResponse.json({
    configured: isConfigured,
    clientIdMasked: maskedId,
    redirectUri,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clientId = (body.clientId || "").trim();
    const clientSecret = (body.clientSecret || "").trim();

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Both Google Client ID and Client Secret are required." },
        { status: 400 }
      );
    }

    // Update in-memory process environment variables
    process.env.AUTH_GOOGLE_ID = clientId;
    process.env.AUTH_GOOGLE_SECRET = clientSecret;

    // Update or append in .env.local
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const setOrReplaceEnv = (content: string, key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
      } else {
        return content.trim() + `\n${key}=${value}\n`;
      }
    };

    let updated = setOrReplaceEnv(envContent, "AUTH_GOOGLE_ID", clientId);
    updated = setOrReplaceEnv(updated, "AUTH_GOOGLE_SECRET", clientSecret);

    fs.writeFileSync(envPath, updated, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Google OAuth credentials saved and activated successfully!",
    });
  } catch (error: any) {
    console.error("Failed to update Google credentials:", error);
    return NextResponse.json(
      { error: "Failed to persist credentials: " + (error?.message || "Internal error") },
      { status: 500 }
    );
  }
}
