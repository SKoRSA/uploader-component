"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/uploadRoutes.ts
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploadController_1 = require("../controllers/uploadController");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per chunk
    },
});
// API Routes
router.post("/init", validate_1.validateUploadInit, uploadController_1.UploadController.initUpload);
router.post("/chunk", upload.single("chunk"), validate_1.validateChunkUpload, uploadController_1.UploadController.uploadChunk);
router.post("/finalize", uploadController_1.UploadController.finalizeUpload);
router.delete("/:fileId", uploadController_1.UploadController.deleteFile);
router.get("/:fileId", uploadController_1.UploadController.getFileInfo);
// Test endpoint
router.get("/test", (_req, res) => {
    res.json({ message: "Upload API is working" });
});
exports.default = router;
