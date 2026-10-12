import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

FavoriteSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export const FavoriteModel: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", FavoriteSchema);

export default FavoriteModel;
