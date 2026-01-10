import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  username: string;
  highScore: number; // Deprecated but kept for backward compatibility
  highScores: {
    easy: number;
    medium: number;
    hard: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    highScore: {
      type: Number,
      default: 0,
    },
    highScores: {
      easy: {
        type: Number,
        default: 0,
      },
      medium: {
        type: Number,
        default: 0,
      },
      hard: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
