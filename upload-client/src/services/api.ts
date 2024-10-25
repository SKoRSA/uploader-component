// src/services/api.ts
import { UploadResponse, ChunkUploadResponse } from "../types/file";

const API_BASE_URL = "http://localhost:3000/api/upload";

export class UploadAPI {
  private chunkSize: number;

  constructor(chunkSize: number) {
    this.chunkSize = chunkSize;
  }

  async initializeUpload(file: File): Promise<UploadResponse> {
    const response = await fetch(`${API_BASE_URL}/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
        chunks: Math.ceil(file.size / this.chunkSize),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to initialize upload");
    }

    return response.json();
  }

  async uploadChunk(
    fileId: string,
    chunk: Blob,
    index: number
  ): Promise<ChunkUploadResponse> {
    const formData = new FormData();
    formData.append("chunk", chunk, "chunk");
    formData.append("fileId", fileId);
    formData.append("chunkIndex", index.toString());

    const response = await fetch(`${API_BASE_URL}/chunk`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload chunk");
    }

    return response.json();
  }

  async finalizeUpload(fileId: string): Promise<UploadResponse> {
    const response = await fetch(`${API_BASE_URL}/finalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to finalize upload");
    }

    return response.json();
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${fileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete file");
    }
  }

  async getFileInfo(fileId: string): Promise<UploadResponse> {
    const response = await fetch(`${API_BASE_URL}/${fileId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get file info");
    }

    return response.json();
  }
}

export const uploadAPI = new UploadAPI(2 * 1024 * 1024); // 2MB chunks
