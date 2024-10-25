// src/components/FileUploader/FileDropZone.tsx
import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "../../utils/cn";

interface FileDropZoneProps {
  onDrop: (files: FileList) => void;
  enableDragDrop?: boolean;
  allowedTypes?: string[];
  icon?: React.ReactNode;
}

export const FileDropZone = React.forwardRef<HTMLDivElement, FileDropZoneProps>(
  ({ onDrop, enableDragDrop = true, icon, allowedTypes = [] }, ref) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (enableDragDrop) {
          setIsDragging(true);
        }
      },
      [enableDragDrop]
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      },
      []
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!enableDragDrop) return;

        const { files } = e.dataTransfer;
        if (files && files.length > 0) {
          onDrop(files);
        }
      },
      [enableDragDrop, onDrop]
    );

    const handleClick = useCallback(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      if (allowedTypes.length) {
        input.accept = allowedTypes.join(",");
      }
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          onDrop(files);
        }
      };
      input.click();
    }, [allowedTypes, onDrop]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-all",
          "hover:border-gray-400",
          isDragging && "border-primary bg-primary/5",
          "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            {icon || <Upload className="h-8 w-8 text-primary" />}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold">
              Drop files here or click to upload
            </span>
            <span className="text-sm text-gray-500">
              {allowedTypes.length
                ? `Supported formats: ${allowedTypes.join(", ")}`
                : "Any file format supported"}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

FileDropZone.displayName = "FileDropZone";
