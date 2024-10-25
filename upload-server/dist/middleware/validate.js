"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChunkUpload = exports.validateUploadInit = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const validateUploadInit = (req, res, next) => {
    const { originalname, mimetype, size, chunks } = req.body;
    if (!originalname || !mimetype || !size || !chunks) {
        return next((0, http_errors_1.default)(400, "Missing required fields"));
    }
    if (typeof size !== "number" || typeof chunks !== "number") {
        return next((0, http_errors_1.default)(400, "Invalid field types"));
    }
    next();
};
exports.validateUploadInit = validateUploadInit;
const validateChunkUpload = (req, res, next) => {
    const { fileId, chunkIndex } = req.body;
    if (!fileId || !chunkIndex) {
        return next((0, http_errors_1.default)(400, "Missing required fields"));
    }
    if (!req.file) {
        return next((0, http_errors_1.default)(400, "No chunk data provided"));
    }
    next();
};
exports.validateChunkUpload = validateChunkUpload;
