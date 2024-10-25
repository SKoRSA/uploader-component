// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export const validateUploadInit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { originalname, mimetype, size, chunks } = req.body;

  if (!originalname || !mimetype || !size || !chunks) {
    return next(createHttpError(400, "Missing required fields"));
  }

  if (typeof size !== "number" || typeof chunks !== "number") {
    return next(createHttpError(400, "Invalid field types"));
  }

  next();
};

export const validateChunkUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fileId, chunkIndex } = req.body;

  if (!fileId || !chunkIndex) {
    return next(createHttpError(400, "Missing required fields"));
  }

  if (!req.file) {
    return next(createHttpError(400, "No chunk data provided"));
  }

  next();
};
