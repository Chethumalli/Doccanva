import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentVersion extends Document {
  documentId: mongoose.Types.ObjectId;
  versionNumber: number;
  editorContent: Record<string, unknown>;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    editorContent: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: "Snapshot",
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

DocumentVersionSchema.index(
  { documentId: 1, versionNumber: -1 }
);

export const DocumentVersionModel: Model<IDocumentVersion> =
  mongoose.models.DocumentVersion ||
  mongoose.model<IDocumentVersion>("DocumentVersion", DocumentVersionSchema);

export default DocumentVersionModel;
