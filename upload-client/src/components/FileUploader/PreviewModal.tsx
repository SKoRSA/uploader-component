// src/components/FileUploader/PreviewModal.tsx
import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";


interface PreviewModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      setLoading(true);
      setError(null);
      setZoom(1);
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fixed inset-6 z-50 bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{file.name}</h2>
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-auto p-4 h-[calc(100%-5rem)]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {objectUrl && (
            <>
              {file.type.startsWith("image/") && (
                <img
                  src={objectUrl}
                  alt={file.name}
                  className="mx-auto transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError("Failed to load image");
                  }}
                />
              )}

              {file.type === "application/pdf" && (
                <iframe
                  src={objectUrl}
                  className="w-full h-full"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError("Failed to load PDF");
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
