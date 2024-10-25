"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.default = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/file-upload",
    uploadDir: process.env.UPLOAD_DIR || path_1.default.join(__dirname, "../../uploads"),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB
    chunkSize: parseInt(process.env.CHUNK_SIZE || "2097152"), // 2MB
    allowedTypes: (process.env.ALLOWED_TYPES || "image/*,application/pdf").split(","),
};
