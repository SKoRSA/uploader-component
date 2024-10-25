// src/types/file.ts
export type FileStatus =
  | "pending"
  | "uploading"
  | "complete"
  | "error"
  | "cancelled";

export interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  status: FileStatus;
  error?: string;
  remoteId?: string;
}

export interface UploadProgressMap {
  [key: string]: number;
}

export interface UploadConfig {
  maxFileSize: number;
  maxConcurrentUploads: number;
  maxTotalUploads: number;
  chunkSize: number;
  allowedTypes: string[];
  retryAttempts: number;
  retryDelay: number;
}

export interface UploadResponse {
  fileId: string;
  filename: string;
}

export interface ChunkUploadResponse {
  success: boolean;
  message?: string;
}
