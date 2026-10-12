import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InvitationModel, DocumentModel } from "@/models";
import { generateSecureToken, hashToken } from "@/lib/utils";
import { sendInvitationEmail } from "@/lib/email";

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
        { error: "Only the document owner can resend invitations" },
        { status: 403 }
      );
    }

    const rawToken = generateSecureToken(32);
    invitation.tokenHash = hashToken(rawToken);
    invitation.status = "pending";
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await invitation.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/shared/invite/${rawToken}`;

    await sendInvitationEmail({
      toEmail: invitation.invitedEmail,
      documentTitle: doc.title,
      invitedByName: user.name,
      role: invitation.role,
      inviteUrl,
    });

    return NextResponse.json({ message: "Invitation resent successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/invitations/[id]/resend error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
