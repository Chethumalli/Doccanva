import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ShareLinkModel, DocumentModel } from "@/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const link = await ShareLinkModel.findById(id);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Verify owner of document
    const doc = await DocumentModel.findById(link.documentId);
    if (!doc || doc.ownerId.toString() !== user.id.toString()) {
      return NextResponse.json(
        { error: "Only the document owner can revoke share links" },
        { status: 403 }
      );
    }

    link.revokedAt = new Date();
    await link.save();

    return NextResponse.json({ message: "Share link revoked successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("DELETE /api/share-links/[id] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
