// src/components/FileUploader/UploadItem.tsx
import React from "react";
import { FileWithProgress } from "../../types/file";
import { X, RefreshCw, Trash2, Eye } from "lucide-react";
import { cn } from "../../utils/cn";

interface UploadItemProps {
  item: FileWithProgress;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
  onPreview?: (file: File) => void;
  showPreview?: boolean;
}

export const UploadItem: React.FC<UploadItemProps> = ({
  item,
  onRetry,
  onCancel,
  onRemove,
  onPreview,
  showPreview = true,
}) => {
  const { id, file, progress, status, error } = item;

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const canPreview = showPreview && (isImage || isPDF);

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-lg border p-4 transition-all",
        status === "error" && "border-destructive bg-destructive/5",
        status === "complete" && "border-green-500 bg-green-50"
      )}
    >
      {/* File Icon/Preview */}
      <div className="h-12 w-12 flex-shrink-0">
        {isImage ? (
          <div
            className="h-full w-full rounded-md bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${URL.createObjectURL(file)})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-100">
            <span className="text-xs uppercase text-gray-500">
              {file.name.split(".").pop()}
            </span>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium" title={file.name}>
            {file.name}
          </p>
          <span className="text-sm text-gray-500">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          {status === "uploading" && (
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {status === "complete" && (
            <p className="text-sm text-green-600">Upload complete</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {canPreview && (
          <button
            onClick={() => onPreview?.(file)}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            title="Preview file"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}

        {status === "uploading" && (
          <button
            onClick={() => onCancel?.(id)}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            title="Cancel upload"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {status === "error" && (
          <button
            onClick={() => onRetry?.(id)}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            title="Retry upload"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {(status === "complete" || status === "error") && (
          <button
            onClick={() => onRemove?.(id)}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            title="Remove file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
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
