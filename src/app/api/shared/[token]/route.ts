import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ShareLinkModel, DocumentModel } from "@/models";
import { hashToken } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectToDatabase();
    const tokenHash = hashToken(token);

    const link = await ShareLinkModel.findOne({
      tokenHash,
      revokedAt: null,
    });

    if (!link) {
      return NextResponse.json(
        { error: "This share link is invalid or has been revoked." },
        { status: 404 }
      );
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired." },
        { status: 410 }
      );
    }

    const doc = await DocumentModel.findById(link.documentId).populate(
      "ownerId",
      "name email image"
    );

    if (!doc || doc.deletedAt) {
      return NextResponse.json(
        { error: "The requested document no longer exists." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document: doc,
      permission: link.permission,
      canEdit: link.permission === "editor",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/shared/[token] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
