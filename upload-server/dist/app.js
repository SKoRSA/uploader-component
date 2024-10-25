"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const config_1 = __importDefault(require("./config/config"));
const cleanupJob_1 = require("./scripts/cleanupJob");
const app = (0, express_1.default)();
// Middlewares
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Routes
app.use("/api/upload", uploadRoutes_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Connect to MongoDB and start server
mongoose_1.default
    .connect(config_1.default.mongoUri)
    .then(() => {
    console.log("Connected to MongoDB");
    const port = config_1.default.port;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Upload directory: ${config_1.default.uploadDir}`);
        (0, cleanupJob_1.startCleanupJob)();
    });
})
    .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
});
exports.default = app;
