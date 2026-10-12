import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InvitationModel, DocumentModel } from "@/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const invitation = await InvitationModel.findById(id);
    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const doc = await DocumentModel.findById(invitation.documentId);
    if (!doc || doc.ownerId.toString() !== user.id.toString()) {
      return NextResponse.json(
        { error: "Only the document owner can revoke invitations" },
        { status: 403 }
      );
    }

    invitation.status = "revoked";
    await invitation.save();

    return NextResponse.json({ message: "Invitation revoked" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/invitations/[id]/revoke error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
