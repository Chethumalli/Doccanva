import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShareLink extends Document {
  documentId: mongoose.Types.ObjectId;
  tokenHash: string;
  permission: "viewer" | "editor";
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ShareLinkSchema = new Schema<IShareLink>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    permission: {
      type: String,
      enum: ["viewer", "editor"],
      required: true,
      default: "viewer",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ShareLinkModel: Model<IShareLink> =
  mongoose.models.ShareLink ||
  mongoose.model<IShareLink>("ShareLink", ShareLinkSchema);

export default ShareLinkModel;
