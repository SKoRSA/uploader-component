// src/controllers/uploadController.ts
import { Request, Response, NextFunction } from "express";
import { UploadService } from "../services/uploadService";
import config from "../config/config";
import createHttpError from "http-errors";

export class UploadController {
  static async initUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { originalname, mimetype, size, chunks } = req.body;

      // Validate file type
      if (
        !config.allowedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return mimetype.startsWith(type.slice(0, -2));
          }
          return type === mimetype;
        })
      ) {
        throw createHttpError(415, "File type not supported");
      }

      // Validate file size
      if (size > config.maxFileSize) {
        throw createHttpError(413, "File too large");
      }

      const file = await UploadService.initializeUpload(
        originalname,
        mimetype,
        size,
        chunks
      );

      res.json({
        fileId: file._id,
        filename: file.filename,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadChunk(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId, chunkIndex } = req.body;
      const chunkData = req.file?.buffer;

      if (!chunkData) {
        throw createHttpError(400, "No chunk data provided");
      }

      await UploadService.uploadChunk(fileId, parseInt(chunkIndex), chunkData);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async finalizeUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.body;
      const file = await UploadService.finalizeUpload(fileId);

      res.json({
        success: true,
        file: {
          id: file._id,
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      await UploadService.deleteFile(fileId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getFileInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const file = await UploadService.getFileInfo(fileId);
      res.json(file);
    } catch (error) {
      next(error);
    }
  }
}
