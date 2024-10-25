"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const uploadService_1 = require("../services/uploadService");
const config_1 = __importDefault(require("../config/config"));
const http_errors_1 = __importDefault(require("http-errors"));
class UploadController {
    static async initUpload(req, res, next) {
        try {
            const { originalname, mimetype, size, chunks } = req.body;
            // Validate file type
            if (!config_1.default.allowedTypes.some((type) => {
                if (type.endsWith("/*")) {
                    return mimetype.startsWith(type.slice(0, -2));
                }
                return type === mimetype;
            })) {
                throw (0, http_errors_1.default)(415, "File type not supported");
            }
            // Validate file size
            if (size > config_1.default.maxFileSize) {
                throw (0, http_errors_1.default)(413, "File too large");
            }
            const file = await uploadService_1.UploadService.initializeUpload(originalname, mimetype, size, chunks);
            res.json({
                fileId: file._id,
                filename: file.filename,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadChunk(req, res, next) {
        try {
            const { fileId, chunkIndex } = req.body;
            const chunkData = req.file?.buffer;
            if (!chunkData) {
                throw (0, http_errors_1.default)(400, "No chunk data provided");
            }
            await uploadService_1.UploadService.uploadChunk(fileId, parseInt(chunkIndex), chunkData);
            res.json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    static async finalizeUpload(req, res, next) {
        try {
            const { fileId } = req.body;
            const file = await uploadService_1.UploadService.finalizeUpload(fileId);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteFile(req, res, next) {
        try {
            const { fileId } = req.params;
            await uploadService_1.UploadService.deleteFile(fileId);
            res.json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    static async getFileInfo(req, res, next) {
        try {
            const { fileId } = req.params;
            const file = await uploadService_1.UploadService.getFileInfo(fileId);
            res.json(file);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UploadController = UploadController;
