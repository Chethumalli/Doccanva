import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  editorContent: Record<string, unknown>;
  schemaVersion: number;
  visibility: "private" | "public";
  templateId?: mongoose.Types.ObjectId | null;
  currentVersion: number;
  wordCount: number;
  characterCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const defaultInitialContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Untitled Document" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Start typing your professional Microsoft Word document here...",
        },
      ],
    },
  ],
};

const DocumentSchema = new Schema<IDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Document",
    },
    editorContent: {
      type: Schema.Types.Mixed,
      required: true,
      default: defaultInitialContent,
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ ownerId: 1, deletedAt: 1, updatedAt: -1 });

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
