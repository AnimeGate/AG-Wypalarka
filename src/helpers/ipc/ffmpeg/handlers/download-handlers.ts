/**
 * FFmpeg Download Handlers
 *
 * IPC handlers for FFmpeg download and installation.
 */

import { BrowserWindow, ipcMain } from "electron";
import { FFMPEG_CHANNELS } from "../ffmpeg-channels";
import { FFmpegDownloader } from "@/lib/ffmpeg-downloader";
import { debugLog } from "../../../debug-mode";

let currentDownloader: FFmpegDownloader | null = null;

/**
 * Registers FFmpeg download handlers.
 */
export function registerDownloadHandlers(mainWindow: BrowserWindow): void {
  // Check if FFmpeg is installed
  ipcMain.handle(FFMPEG_CHANNELS.CHECK_INSTALLED, async () => {
    debugLog.ipc("IPC: CHECK_INSTALLED called");
    const installed = FFmpegDownloader.isInstalled();
    debugLog.ipc(`IPC: CHECK_INSTALLED - Result: ${installed}`);
    return { installed };
  });

  // Start FFmpeg download
  ipcMain.handle(FFMPEG_CHANNELS.START_DOWNLOAD, async () => {
    debugLog.ipc("IPC: START_DOWNLOAD called");
    if (currentDownloader) {
      debugLog.error("IPC: START_DOWNLOAD - Download already in progress");
      throw new Error("A download is already in progress");
    }

    debugLog.info("Starting FFmpeg download...");
    currentDownloader = new FFmpegDownloader({
      onProgress: (progress) => {
        mainWindow.webContents.send(FFMPEG_CHANNELS.DOWNLOAD_PROGRESS, progress);
      },
    });

    try {
      await currentDownloader.downloadAndInstall();
      debugLog.success("FFmpeg download completed successfully");
      mainWindow.webContents.send(FFMPEG_CHANNELS.DOWNLOAD_COMPLETE);
      currentDownloader = null;
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLog.error(`FFmpeg download failed: ${errorMessage}`);
      mainWindow.webContents.send(FFMPEG_CHANNELS.DOWNLOAD_ERROR, errorMessage);
      currentDownloader = null;
      throw error;
    }
  });
}

/**
 * Gets the current downloader instance.
 */
export function getCurrentDownloader(): FFmpegDownloader | null {
  return currentDownloader;
}
