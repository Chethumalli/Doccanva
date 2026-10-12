import mongoose, { Schema, Document, Model } from "mongoose";

export type CollaboratorRole = "viewer" | "editor";

export interface IDocumentCollaborator extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: CollaboratorRole;
  grantedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DocumentCollaboratorSchema = new Schema<IDocumentCollaborator>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["viewer", "editor"],
      required: true,
      default: "viewer",
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

DocumentCollaboratorSchema.index(
  { documentId: 1, userId: 1 },
  { unique: true }
);

export const DocumentCollaboratorModel: Model<IDocumentCollaborator> =
  mongoose.models.DocumentCollaborator ||
  mongoose.model<IDocumentCollaborator>(
    "DocumentCollaborator",
    DocumentCollaboratorSchema
  );

export default DocumentCollaboratorModel;
