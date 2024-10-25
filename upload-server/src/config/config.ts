// src/config/config.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/file-upload",
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads"),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB
  chunkSize: parseInt(process.env.CHUNK_SIZE || "2097152"), // 2MB
  allowedTypes: (process.env.ALLOWED_TYPES || "image/*,application/pdf").split(
    ","
  ),
};
