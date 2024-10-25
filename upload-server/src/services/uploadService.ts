// src/services/uploadService.ts
import { promises as fsPromises } from "fs";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import config from "../config/config";
import File, { IFile } from "../models/File";
import Chunk from "../models/Chunk";

export class UploadService {
  static async ensureUploadDirectory() {
    try {
      await fsPromises.mkdir(config.uploadDir, { recursive: true });
    } catch (error: unknown) {
      console.error("Error creating upload directory:", error);
    }
  }

  static async initializeUpload(
    originalname: string,
    mimetype: string,
    size: number,
    chunks: number
  ): Promise<IFile> {
    try {
      await this.ensureUploadDirectory();

      const file = new File({
        filename: `${Date.now()}-${originalname}`,
        originalname,
        mimetype,
        size,
        chunks,
        status: "pending",
      });

      await file.save();
      return file;
    } catch (error) {
      throw createHttpError(500, "Failed to initialize upload");
    }
  }

  static async uploadChunk(
    fileId: string,
    chunkIndex: number,
    chunkData: Buffer
  ): Promise<void> {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw createHttpError(404, "File not found");
      }

      // Validate chunk index
      if (chunkIndex >= file.chunks) {
        throw createHttpError(400, "Invalid chunk index");
      }

      // Check if chunk already exists
      const existingChunk = await Chunk.findOne({
        fileId: file._id,
        index: chunkIndex,
      });
      if (existingChunk) {
        throw createHttpError(400, "Chunk already uploaded");
      }

      const chunk = new Chunk({
        fileId: file._id,
        index: chunkIndex,
        data: chunkData,
      });

      await chunk.save();

      file.currentChunk = Math.max(file.currentChunk, chunkIndex + 1);
      file.status = "uploading";
      await file.save();
    } catch (error) {
      if (createHttpError.isHttpError(error)) throw error;
      throw createHttpError(500, "Failed to upload chunk");
    }
  }

  static async finalizeUpload(fileId: string): Promise<IFile> {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw createHttpError(404, "File not found");
      }

      if (file.currentChunk !== file.chunks) {
        throw createHttpError(
          400,
          "All chunks must be uploaded before finalizing"
        );
      }

      // Get all chunks in order
      const chunks = await Chunk.find({ fileId: file._id }).sort({ index: 1 });
      const filePath = path.join(config.uploadDir, file.filename);

      // Write file using streams
      const writeStream = fs.createWriteStream(filePath);

      try {
        for (const chunk of chunks) {
          await new Promise<void>((resolve, reject) => {
            writeStream.write(chunk.data, (error: Error | null | undefined) => {
              if (error) reject(error);
              else resolve();
            });
          });
        }

        await new Promise<void>((resolve) => writeStream.end(resolve));

        // Update file status and path
        file.status = "completed";
        file.path = filePath;
        await file.save();

        // Clean up chunks
        await Chunk.deleteMany({ fileId: file._id });

        return file;
      } catch (error) {
        throw createHttpError(500, "Failed to write file");
      } finally {
        writeStream.end();
      }
    } catch (error) {
      if (createHttpError.isHttpError(error)) throw error;
      throw createHttpError(500, "Failed to finalize upload");
    }
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw createHttpError(404, "File not found");
      }

      if (file.path) {
        try {
          await fsPromises.unlink(file.path);
        } catch (error: unknown) {
          console.error("Error deleting file from disk:", error);
        }
      }

      await Chunk.deleteMany({ fileId: file._id });
      await file.deleteOne();
    } catch (error) {
      if (createHttpError.isHttpError(error)) throw error;
      throw createHttpError(500, "Failed to delete file");
    }
  }

  static async getFileInfo(fileId: string): Promise<IFile> {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw createHttpError(404, "File not found");
      }
      return file;
    } catch (error) {
      if (createHttpError.isHttpError(error)) throw error;
      throw createHttpError(500, "Failed to get file info");
    }
  }
}
