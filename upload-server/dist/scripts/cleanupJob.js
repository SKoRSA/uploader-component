"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupJob = startCleanupJob;
// src/scripts/cleanupJob.js
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const File_1 = __importDefault(require("../models/File")); // Adjust the path if needed
async function deleteAllRecords() {
    try {
        await File_1.default.deleteMany({}); // Deletes all documents in the File collection
        console.log("All records have been deleted from the database.");
    }
    catch (error) {
        console.error("Error deleting records:", error);
    }
}
function clearUploadsFolder() {
    const directory = path_1.default.join(__dirname, "../../uploads");
    fs_1.default.readdir(directory, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return;
        }
        for (const file of files) {
            fs_1.default.unlink(path_1.default.join(directory, file), (err) => {
                if (err)
                    throw err;
            });
        }
        console.log("Uploads folder cleared.");
    });
}
async function startCleanupJob() {
    // Export the function
    node_cron_1.default.schedule("*/5 * * * *", () => {
        console.log("Running scheduled cleanup job...");
        deleteAllRecords();
        clearUploadsFolder();
    });
}
