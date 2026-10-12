import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InvitationModel, DocumentCollaboratorModel } from "@/models";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to accept this invitation." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const invitation = await InvitationModel.findById(id);
    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is no longer pending (status: ${invitation.status})` },
        { status: 400 }
      );
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    // Verify recipient email matches authenticated session
    if (invitation.invitedEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: `This invitation was issued to ${invitation.invitedEmail}, but you are signed in as ${user.email}.`,
        },
        { status: 403 }
      );
    }

    // Add or update collaborator
    await DocumentCollaboratorModel.findOneAndUpdate(
      {
        documentId: invitation.documentId,
        userId: new mongoose.Types.ObjectId(user.id),
      },
      {
        documentId: invitation.documentId,
        userId: new mongoose.Types.ObjectId(user.id),
        role: invitation.role,
        grantedBy: invitation.invitedBy,
      },
      { upsert: true, new: true }
    );

    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    return NextResponse.json({
      message: "Invitation accepted successfully",
      documentId: invitation.documentId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/invitations/[id]/accept error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
