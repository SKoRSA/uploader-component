// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
  }
}
