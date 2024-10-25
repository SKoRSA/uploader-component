// src/hooks/useFileUpload.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { FileWithProgress, UploadProgressMap } from "../types/file";
import { uploadAPI } from "../services/api";
import { useToast } from "./useToast";

interface UseFileUploadOptions {
  maxConcurrentUploads: number;
  maxTotalUploads: number;
  chunkSize: number;
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  immediateUpload: boolean;
  onUploadComplete?: (file: File) => void;
  onUploadError?: (error: string) => void;
}

export function useFileUpload({
  maxConcurrentUploads,
  maxTotalUploads,
  chunkSize,
  autoRetry,
  maxRetries,
  retryDelay,
  immediateUpload,
  onUploadComplete,
  onUploadError,
}: UseFileUploadOptions) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressMap>({});
  const [isUploading, setIsUploading] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const uploadQueueRef = useRef<Set<string>>(new Set());
  const processingRef = useRef<Set<string>>(new Set());
  const { showToast } = useToast();

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fileId]: progress,
    }));
  }, []);

  const uploadFile = useCallback(
    async (fileId: string) => {
      if (processingRef.current.has(fileId)) {
        console.log("File is already being processed:", fileId);
        return;
      }

      const fileItem = files.find((f) => f.id === fileId);
      if (!fileItem) {
        console.error("File not found:", fileId);
        return;
      }

      processingRef.current.add(fileId);
      console.log("Starting upload for:", fileItem.file.name);
      setIsUploading(true);
      setActiveUploads((prev) => prev + 1);

      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f))
        );

        const { fileId: remoteFileId } = await uploadAPI.initializeUpload(
          fileItem.file
        );
        console.log("Initialized upload with ID:", remoteFileId);

        // Store the remote ID
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, remoteId: remoteFileId } : f
          )
        );

        const totalChunks = Math.ceil(fileItem.file.size / chunkSize);
        console.log(`Total chunks to upload: ${totalChunks}`);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, fileItem.file.size);
          const chunk = fileItem.file.slice(start, end);

          let retryCount = 0;
          while (retryCount <= maxRetries) {
            try {
              await uploadAPI.uploadChunk(remoteFileId, chunk, i);
              const progress = Math.round(((i + 1) / totalChunks) * 100);
              console.log(
                `Chunk ${i + 1}/${totalChunks} uploaded (${progress}%)`
              );
              updateFileProgress(fileId, progress);
              break;
            } catch (error) {
              retryCount++;
              if (retryCount > maxRetries || !autoRetry) {
                throw error;
              }
              console.log(
                `Retrying chunk ${i + 1} (attempt ${retryCount}/${maxRetries})`
              );
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * retryCount)
              );
            }
          }
        }

        await uploadAPI.finalizeUpload(remoteFileId);
        console.log("Upload completed successfully");

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "complete", remoteId: remoteFileId }
              : f
          )
        );

        showToast(`${fileItem.file.name} uploaded successfully`, "success");
        onUploadComplete?.(fileItem.file);
      } catch (error) {
        console.error("Upload failed:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        );
        showToast(`Failed to upload ${fileItem.file.name}`, "error");
        onUploadError?.(
          error instanceof Error ? error.message : "Upload failed"
        );
      } finally {
        processingRef.current.delete(fileId);
        uploadQueueRef.current.delete(fileId);
        setActiveUploads((prev) => Math.max(0, prev - 1));
        setQueueLength((prev) => Math.max(0, prev - 1));

        if (
          uploadQueueRef.current.size === 0 &&
          processingRef.current.size === 0
        ) {
          setIsUploading(false);
        }
      }
    },
    [
      files,
      chunkSize,
      autoRetry,
      maxRetries,
      retryDelay,
      showToast,
      onUploadComplete,
      onUploadError,
      updateFileProgress,
    ]
  );

  useEffect(() => {
    const processQueue = () => {
      if (!isUploading || uploadQueueRef.current.size === 0) return;

      const availableSlots = maxConcurrentUploads - processingRef.current.size;
      if (availableSlots <= 0) return;

      const queueIterator = uploadQueueRef.current.values();
      let processed = 0;

      for (const fileId of queueIterator) {
        if (processed >= availableSlots) break;
        if (!processingRef.current.has(fileId)) {
          uploadFile(fileId);
          processed++;
        }
      }
    };

    processQueue();
  }, [isUploading, maxConcurrentUploads, uploadFile]);

  const handleFiles = useCallback(
    (newFiles: FileWithProgress[]) => {
      console.log("Handling new files:", newFiles.length);

      if (files.length + newFiles.length > maxTotalUploads) {
        showToast(
          `Maximum number of files (${maxTotalUploads}) exceeded`,
          "error"
        );
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
      setQueueLength((prev) => prev + newFiles.length);

      if (immediateUpload) {
        console.log("Adding files to upload queue");
        newFiles.forEach((file) => {
          if (!uploadQueueRef.current.has(file.id)) {
            uploadQueueRef.current.add(file.id);
          }
        });
        setIsUploading(true);
      }
    },
    [files.length, maxTotalUploads, immediateUpload, showToast]
  );

  const handleRetry = useCallback((fileId: string) => {
    console.log("Retrying upload:", fileId);
    if (!processingRef.current.has(fileId)) {
      uploadQueueRef.current.add(fileId);
      setIsUploading(true);
    }
  }, []);

  const handleCancel = useCallback(
    (fileId: string) => {
      console.log("Cancelling upload:", fileId);
      const file = files.find((f) => f.id === fileId);
      if (file?.remoteId) {
        uploadAPI.deleteFile(file.remoteId).catch(console.error);
      }

      uploadQueueRef.current.delete(fileId);
      processingRef.current.delete(fileId);
      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, status: "cancelled" } : file
        )
      );
      setQueueLength((prev) => Math.max(0, prev - 1));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    },
    [files]
  );

  const handleRemove = useCallback(
    async (fileId: string) => {
      console.log("Removing file:", fileId);

      const file = files.find((f) => f.id === fileId);

      try {
        if (file?.status === "complete" && file.remoteId) {
          console.log("Deleting file from server:", file.remoteId);
          await uploadAPI.deleteFile(file.remoteId);
          showToast(`${file.file.name} deleted successfully`, "success");
        }

        uploadQueueRef.current.delete(fileId);
        processingRef.current.delete(fileId);
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        setQueueLength((prev) => Math.max(0, prev - 1));
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      } catch (error) {
        console.error("Failed to delete file:", error);
        showToast(
          `Failed to delete ${file?.file.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error"
        );

        if (file) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, error: "Failed to delete from server" }
                : f
            )
          );
        }
      }
    },
    [files, showToast]
  );

  return {
    files,
    uploadProgress,
    isUploading,
    activeUploads,
    queueLength,
    handleFiles,
    handleRetry,
    handleCancel,
    handleRemove,
  };
}
