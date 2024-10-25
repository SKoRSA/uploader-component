// src/App.tsx
import { useState } from "react";
import {
  FileDropZone,
  UploadList,
  PreviewModal,
} from "./components/FileUploader";
import { useFileUpload } from "./hooks/useFileUpload";

function App() {
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const {
    files,
    uploadProgress,
    handleFiles,
    handleRetry,
    handleCancel,
    handleRemove,
    queueLength,
    activeUploads,
  } = useFileUpload({
    maxConcurrentUploads: 3,
    maxTotalUploads: 10,
    chunkSize: 2 * 1024 * 1024,
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    immediateUpload: true,
  });

  const handleDrop = (fileList: FileList) => {
    console.log("Files dropped:", fileList.length);
    const newFiles = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "pending" as const,
    }));
    handleFiles(newFiles);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">File Uploader</h1>

        <FileDropZone
          onDrop={handleDrop}
          allowedTypes={[".jpg", ".png", ".pdf", ".xlsx"]}
        />

        <UploadList
          files={files}
          uploadProgress={uploadProgress}
          onRetry={handleRetry}
          onCancel={handleCancel}
          onRemove={handleRemove}
          onPreview={setPreviewFile}
          showPreviews={true}
          activeUploads={activeUploads}
          queueLength={queueLength}
        />
      </div>

      <PreviewModal
        file={previewFile}
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

export default App;
