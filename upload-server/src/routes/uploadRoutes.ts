// src/routes/uploadRoutes.ts
import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/uploadController";
import {
  validateUploadInit,
  validateChunkUpload,
} from "../middleware/validate";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per chunk
  },
});

// API Routes
router.post("/init", validateUploadInit, UploadController.initUpload);
router.post(
  "/chunk",
  upload.single("chunk"),
  validateChunkUpload,
  UploadController.uploadChunk
);
router.post("/finalize", UploadController.finalizeUpload);
router.delete("/:fileId", UploadController.deleteFile);
router.get("/:fileId", UploadController.getFileInfo);

// Test endpoint
router.get("/test", (_req, res) => {
  res.json({ message: "Upload API is working" });
});

export default router;
