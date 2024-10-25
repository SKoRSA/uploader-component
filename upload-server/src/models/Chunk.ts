// src/models/Chunk.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IChunk extends Document {
  fileId: Schema.Types.ObjectId;
  index: number;
  data: Buffer;
}

const ChunkSchema = new Schema<IChunk>({
  fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
  index: { type: Number, required: true },
  data: { type: Buffer, required: true },
});

ChunkSchema.index({ fileId: 1, index: 1 }, { unique: true });

export default mongoose.model<IChunk>("Chunk", ChunkSchema);
