import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel, InvitationModel } from "@/models";
import { checkDocumentAccess } from "@/lib/permissions";
import { generateSecureToken, hashToken } from "@/lib/utils";
import { createInvitationSchema } from "@/lib/validation";
import { sendInvitationEmail } from "@/lib/email";
import mongoose from "mongoose";

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

    const access = await checkDocumentAccess(id, user.id);
    if (!access.canShare) {
      return NextResponse.json(
        { error: "Only the owner can invite collaborators" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const validation = createInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { invitedEmail, role } = validation.data;

    // Prevent inviting oneself
    if (invitedEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself to your own document." },
        { status: 400 }
      );
    }

    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check for existing pending invitation
    let invitation = await InvitationModel.findOne({
      documentId: id,
      invitedEmail,
      status: "pending",
    });

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (invitation) {
      invitation.role = role;
      invitation.tokenHash = tokenHash;
      invitation.expiresAt = expiresAt;
      await invitation.save();
    } else {
      invitation = await InvitationModel.create({
        documentId: new mongoose.Types.ObjectId(id),
        invitedEmail,
        role,
        tokenHash,
        status: "pending",
        expiresAt,
        invitedBy: new mongoose.Types.ObjectId(user.id),
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/shared/invite/${rawToken}`;

    // Send email notification
    await sendInvitationEmail({
      toEmail: invitedEmail,
      documentTitle: doc.title,
      invitedByName: user.name,
      role,
      inviteUrl,
    });

    return NextResponse.json(
      {
        message: `Invitation successfully sent to ${invitedEmail}`,
        invitation: {
          id: invitation._id,
          invitedEmail: invitation.invitedEmail,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/documents/[id]/invitations error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
