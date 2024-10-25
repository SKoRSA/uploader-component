// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (createHttpError.isHttpError(err)) {
    res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status,
      },
    });
  } else {
    res.status(500).json({
      error: {
        message: "Internal Server Error",
        status: 500,
      },
    });
  }
};
