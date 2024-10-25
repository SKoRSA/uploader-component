"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
// src/services/uploadService.ts
const fs_1 = require("fs");
const fs_2 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_errors_1 = __importDefault(require("http-errors"));
const config_1 = __importDefault(require("../config/config"));
const File_1 = __importDefault(require("../models/File"));
const Chunk_1 = __importDefault(require("../models/Chunk"));
class UploadService {
    static async ensureUploadDirectory() {
        try {
            await fs_1.promises.mkdir(config_1.default.uploadDir, { recursive: true });
        }
        catch (error) {
            console.error("Error creating upload directory:", error);
        }
    }
    static async initializeUpload(originalname, mimetype, size, chunks) {
        try {
            await this.ensureUploadDirectory();
            const file = new File_1.default({
                filename: `${Date.now()}-${originalname}`,
                originalname,
                mimetype,
                size,
                chunks,
                status: "pending",
            });
            await file.save();
            return file;
        }
        catch (error) {
            throw (0, http_errors_1.default)(500, "Failed to initialize upload");
        }
    }
    static async uploadChunk(fileId, chunkIndex, chunkData) {
        try {
            const file = await File_1.default.findById(fileId);
            if (!file) {
                throw (0, http_errors_1.default)(404, "File not found");
            }
            // Validate chunk index
            if (chunkIndex >= file.chunks) {
                throw (0, http_errors_1.default)(400, "Invalid chunk index");
            }
            // Check if chunk already exists
            const existingChunk = await Chunk_1.default.findOne({
                fileId: file._id,
                index: chunkIndex,
            });
            if (existingChunk) {
                throw (0, http_errors_1.default)(400, "Chunk already uploaded");
            }
            const chunk = new Chunk_1.default({
                fileId: file._id,
                index: chunkIndex,
                data: chunkData,
            });
            await chunk.save();
            file.currentChunk = Math.max(file.currentChunk, chunkIndex + 1);
            file.status = "uploading";
            await file.save();
        }
        catch (error) {
            if (http_errors_1.default.isHttpError(error))
                throw error;
            throw (0, http_errors_1.default)(500, "Failed to upload chunk");
        }
    }
    static async finalizeUpload(fileId) {
        try {
            const file = await File_1.default.findById(fileId);
            if (!file) {
                throw (0, http_errors_1.default)(404, "File not found");
            }
            if (file.currentChunk !== file.chunks) {
                throw (0, http_errors_1.default)(400, "All chunks must be uploaded before finalizing");
            }
            // Get all chunks in order
            const chunks = await Chunk_1.default.find({ fileId: file._id }).sort({ index: 1 });
            const filePath = path_1.default.join(config_1.default.uploadDir, file.filename);
            // Write file using streams
            const writeStream = fs_2.default.createWriteStream(filePath);
            try {
                for (const chunk of chunks) {
                    await new Promise((resolve, reject) => {
                        writeStream.write(chunk.data, (error) => {
                            if (error)
                                reject(error);
                            else
                                resolve();
                        });
                    });
                }
                await new Promise((resolve) => writeStream.end(resolve));
                // Update file status and path
                file.status = "completed";
                file.path = filePath;
                await file.save();
                // Clean up chunks
                await Chunk_1.default.deleteMany({ fileId: file._id });
                return file;
            }
            catch (error) {
                throw (0, http_errors_1.default)(500, "Failed to write file");
            }
            finally {
                writeStream.end();
            }
        }
        catch (error) {
            if (http_errors_1.default.isHttpError(error))
                throw error;
            throw (0, http_errors_1.default)(500, "Failed to finalize upload");
        }
    }
    static async deleteFile(fileId) {
        try {
            const file = await File_1.default.findById(fileId);
            if (!file) {
                throw (0, http_errors_1.default)(404, "File not found");
            }
            if (file.path) {
                try {
                    await fs_1.promises.unlink(file.path);
                }
                catch (error) {
                    console.error("Error deleting file from disk:", error);
                }
            }
            await Chunk_1.default.deleteMany({ fileId: file._id });
            await file.deleteOne();
        }
        catch (error) {
            if (http_errors_1.default.isHttpError(error))
                throw error;
            throw (0, http_errors_1.default)(500, "Failed to delete file");
        }
    }
    static async getFileInfo(fileId) {
        try {
            const file = await File_1.default.findById(fileId);
            if (!file) {
                throw (0, http_errors_1.default)(404, "File not found");
            }
            return file;
        }
        catch (error) {
            if (http_errors_1.default.isHttpError(error))
                throw error;
            throw (0, http_errors_1.default)(500, "Failed to get file info");
        }
    }
}
exports.UploadService = UploadService;
