import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { FavoriteModel } from "@/models";
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

    await connectToDatabase();
    const existing = await FavoriteModel.findOne({
      userId: new mongoose.Types.ObjectId(user.id),
      templateId: new mongoose.Types.ObjectId(id),
    });

    if (existing) {
      await FavoriteModel.findByIdAndDelete(existing._id);
      return NextResponse.json({ isFavorite: false });
    } else {
      await FavoriteModel.create({
        userId: new mongoose.Types.ObjectId(user.id),
        templateId: new mongoose.Types.ObjectId(id),
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/templates/[id]/favorite error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
