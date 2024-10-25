// src/scripts/cleanupJob.js
import fs from "fs";
import path from "path";
import cron from "node-cron";
import File from "../models/File"; // Adjust the path if needed

async function deleteAllRecords() {
  try {
    await File.deleteMany({}); // Deletes all documents in the File collection
    console.log("All records have been deleted from the database.");
  } catch (error) {
    console.error("Error deleting records:", error);
  }
}

function clearUploadsFolder() {
  const directory = path.join(__dirname, "../../uploads");

  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return;
    }

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
    console.log("Uploads folder cleared.");
  });
}

export async function startCleanupJob() {
  // Export the function
  cron.schedule("*/5 * * * *", () => {
    console.log("Running scheduled cleanup job...");
    deleteAllRecords();
    clearUploadsFolder();
  });
}
