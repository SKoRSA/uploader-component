
# File Uploader Component

A modern, feature-rich file upload component built with React, TypeScript, and Express. This component provides a robust solution for handling file uploads with features like chunked uploading, progress tracking, and preview capabilities.

## Features

- 📁 Drag and drop file upload
- 📊 Progress tracking with individual file progress
- 🔄 Chunked file upload support
- 🖼 File preview for images and PDFs
- 🔄 Retry mechanism for failed uploads
- ⏸ Pause/Cancel upload functionality
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🚦 Queue management for multiple files
- 🔍 File type validation
- 📝 Detailed error handling
- 🌙 Dark mode support

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Vite
  - Lucide Icons

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose

## Installation

### Frontend

```bash

# Navigate to the client directory
cd upload-client

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend

```bash
# Navigate to the server directory
cd upload-server

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### Backend (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/file-upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
CHUNK_SIZE=2097152
ALLOWED_TYPES=image/*,application/pdf
```

## Usage

```tsx
import { FileUploader } from './components/FileUploader';

function App() {
  return (
    <div className="container mx-auto p-8">
      <FileUploader
        maxFileSize={50 * 1024 * 1024} // 50MB
        maxConcurrentUploads={3}
        maxTotalUploads={10}
        allowedTypes={['.jpg', '.png', '.pdf']}
        chunkSize={2 * 1024 * 1024} // 2MB chunks
        autoRetry={true}
        maxRetries={3}
        retryDelay={1000}
        showPreviews={true}
      />
    </div>
  );
}
```

## Component Props

| Prop                   | Type        | Default              | Description                              |
| ---------------------- | ----------- | -------------------- | ---------------------------------------- |
| maxFileSize             | number      | 50MB                 | Maximum file size in bytes               |
| maxConcurrentUploads    | number      | 3                    | Maximum number of concurrent uploads     |
| maxTotalUploads         | number      | 10                   | Maximum number of files in queue         |
| allowedTypes            | string[]    | ['.jpg', '.png', '.pdf'] | Allowed file types                      |
| chunkSize               | number      | 2MB                  | Size of upload chunks                   |
| autoRetry               | boolean     | true                 | Automatically retry failed uploads       |
| maxRetries              | number      | 3                    | Maximum number of retry attempts         |
| retryDelay              | number      | 1000                 | Delay between retries (ms)              |
| showPreviews            | boolean     | true                 | Show file previews                      |
| onUploadComplete        | function    | -                    | Callback when upload completes           |
| onUploadError           | function    | -                    | Callback when upload fails               |

## API Endpoints

### Upload Endpoints

- POST /api/upload/init - Initialize upload
- POST /api/upload/chunk - Upload chunk
- POST /api/upload/finalize - Finalize upload
- DELETE /api/upload/:fileId - Delete file
- GET /api/upload/:fileId - Get file info

## Directory Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── ...
└── server/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    └── ...
```

## Features in Detail

### Chunked Upload Process

1. File is split into chunks of specified size
2. Each chunk is uploaded separately
3. Progress is tracked per chunk
4. Failed chunks can be retried independently

### Queue Management

- Implements a FIFO queue for uploads
- Limits concurrent uploads
- Provides progress tracking per file
- Handles failed uploads with retry mechanism

### File Preview

- Image preview with zoom functionality
- PDF preview support
- Custom preview for other file types

### Error Handling

- Comprehensive error messages
- Automatic retry mechanism
- User-friendly error notifications
- Network error recovery

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
