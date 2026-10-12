import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ShareLinkModel } from "@/models";
import { checkDocumentAccess } from "@/lib/permissions";
import { generateSecureToken, hashToken } from "@/lib/utils";
import { createShareLinkSchema } from "@/lib/validation";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id]/share-links - List active share links
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await checkDocumentAccess(id, user.id);
    if (access.accessLevel !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can view share links" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const links = await ShareLinkModel.find({
      documentId: id,
      revokedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ links });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/documents/[id]/share-links error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/documents/[id]/share-links - Create new share link
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await checkDocumentAccess(id, user.id);
    if (!access.canShare) {
      return NextResponse.json(
        { error: "Only the owner can create share links" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const validation = createShareLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { permission, expiresInHours } = validation.data;

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    let expiresAt: Date | null = null;
    if (expiresInHours) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    const shareLink = await ShareLinkModel.create({
      documentId: new mongoose.Types.ObjectId(id),
      tokenHash,
      permission,
      expiresAt,
      createdBy: new mongoose.Types.ObjectId(user.id),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${appUrl}/shared/${rawToken}`;

    return NextResponse.json(
      {
        shareLink: {
          id: shareLink._id,
          permission: shareLink.permission,
          expiresAt: shareLink.expiresAt,
          createdAt: shareLink.createdAt,
        },
        token: rawToken,
        shareUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/documents/[id]/share-links error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
