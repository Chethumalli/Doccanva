import mongoose, { Schema, Document, Model } from "mongoose";

export type TemplateCategory =
  | "Resume and CV"
  | "Business Proposals"
  | "Invoices"
  | "Reports"
  | "Letters"
  | "Academic Assignments"
  | "Meeting Notes"
  | "Project Documentation"
  | "Contracts and Agreements"
  | "Marketing Documents"
  | "General";

export interface ITemplate extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: TemplateCategory;
  editorContent: Record<string, unknown>;
  schemaVersion: number;
  visibility: "public" | "private";
  previewImage?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
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
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
      index: true,
    },
    editorContent: {
      type: Schema.Types.Mixed,
      required: true,
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    previewImage: {
      type: String,
      default: "",
    },
    usageCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

TemplateSchema.index({ visibility: 1, category: 1, updatedAt: -1 });

export const TemplateModel: Model<ITemplate> =
  mongoose.models.Template ||
  mongoose.model<ITemplate>("Template", TemplateSchema);

export default TemplateModel;
