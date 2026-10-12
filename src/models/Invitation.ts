import mongoose, { Schema, Document, Model } from "mongoose";

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface IInvitation extends Document {
  documentId: mongoose.Types.ObjectId;
  invitedEmail: string;
  role: "viewer" | "editor";
  tokenHash: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date | null;
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["viewer", "editor"],
      required: true,
      default: "viewer",
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired"],
      default: "pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const InvitationModel: Model<IInvitation> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default InvitationModel;
