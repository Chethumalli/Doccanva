import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel } from "@/models";

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
    const doc = await DocumentModel.findOne({
      _id: id,
      ownerId: user.id,
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    doc.deletedAt = null;
    await doc.save();

    return NextResponse.json({ message: "Document restored", document: doc });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/documents/[id]/restore error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
