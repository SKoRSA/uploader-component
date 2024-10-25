// src/models/File.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  uploadDate: Date;
  status: "pending" | "uploading" | "completed" | "error";
  chunks: number;
  currentChunk: number;
  path?: string;
}

const FileSchema = new Schema<IFile>({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "uploading", "completed", "error"],
    default: "pending",
  },
  chunks: { type: Number, required: true },
  currentChunk: { type: Number, default: 0 },
  path: { type: String },
});

export default mongoose.model<IFile>("File", FileSchema);
