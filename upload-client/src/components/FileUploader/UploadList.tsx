// src/components/FileUploader/UploadList.tsx
import React from "react";
import { FileWithProgress } from "../../types/file";
import { UploadProgressMap } from "../../types/file";
import { UploadItem } from "./UploadItem";
import { Trash2 } from "lucide-react";

interface UploadListProps {
  files: FileWithProgress[];
  uploadProgress: UploadProgressMap;
  onRetry: (fileId: string) => void;
  onCancel: (fileId: string) => void;
  onRemove: (fileId: string) => void;
  onPreview?: (file: File) => void;
  showPreviews?: boolean;
  activeUploads: number;
  queueLength: number;
}

export const UploadList: React.FC<UploadListProps> = ({
  files,
  uploadProgress,
  onRetry,
  onCancel,
  onRemove,
  onPreview,
  showPreviews = true,
  activeUploads,
  queueLength,
}) => {
  if (files.length === 0) {
    return null;
  }

  const totalSize = files.reduce((acc, file) => acc + file.file.size, 0);
  const uploadedSize = files.reduce((acc, file) => {
    const progress = uploadProgress[file.id] || 0;
    return acc + (file.file.size * progress) / 100;
  }, 0);
  const completedFiles = files.filter(
    (file) => file.status === "complete"
  ).length;

  return (
    <div className="mt-6 space-y-4">
      {/* Upload Stats */}
      <div className="rounded-lg bg-white p-4 shadow-sm border">
        <div className="flex justify-between mb-2">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Upload Progress</h3>
            <p className="text-sm text-gray-500">
              {completedFiles} of {files.length} files completed
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium">
              {formatFileSize(uploadedSize)} / {formatFileSize(totalSize)}
            </p>
            <p className="text-sm text-gray-500">
              {activeUploads} active • {queueLength} in queue
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${Math.round((uploadedSize / totalSize) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3">
        {files.map((file) => (
          <UploadItem
            key={file.id}
            item={{
              ...file,
              progress: uploadProgress[file.id] || 0,
            }}
            onRetry={() => onRetry(file.id)}
            onCancel={() => onCancel(file.id)}
            onRemove={() => onRemove(file.id)}
            onPreview={onPreview ? () => onPreview(file.file) : undefined}
            showPreview={showPreviews}
          />
        ))}
      </div>

      {/* Clear All Button */}
      {files.length > 0 && (
        <div className="flex justify-end pt-4">
          <button
            onClick={() => files.forEach((f) => onRemove(f.id))}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
