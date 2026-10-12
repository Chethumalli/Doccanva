import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InvitationModel } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const invitations = await InvitationModel.find({
      invitedEmail: user.email.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("documentId", "title")
      .populate("invitedBy", "name email image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ invitations });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/invitations error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
