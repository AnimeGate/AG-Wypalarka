/**
 * FFmpeg Process Handlers
 *
 * IPC handlers for FFmpeg process control (start, cancel, GPU check).
 */

import { BrowserWindow, ipcMain, shell, Notification } from "electron";
import * as path from "path";
import { FFMPEG_CHANNELS } from "../ffmpeg-channels";
import { FFmpegProcessor, type EncodingSettings } from "@/lib/ffmpeg";
import { debugLog } from "../../../debug-mode";
import { t } from "../../../main-translations";

let currentProcessor: FFmpegProcessor | null = null;

/**
 * Registers FFmpeg process control handlers.
 */
export function registerProcessHandlers(mainWindow: BrowserWindow): void {
  // Start FFmpeg process
  ipcMain.handle(
    FFMPEG_CHANNELS.START_PROCESS,
    async (
      _event,
      params: {
        videoPath: string;
        subtitlePath: string;
        outputPath: string;
        settings?: EncodingSettings;
      }
    ) => {
      debugLog.ipc("IPC: START_PROCESS called");
      debugLog.ipc(`  Video: ${params.videoPath}`);
      debugLog.ipc(`  Subtitle: ${params.subtitlePath}`);
      debugLog.ipc(`  Output: ${params.outputPath}`);
      if (params.settings) {
        const s = params.settings;
        debugLog.ipc(
          `  Settings: bitrate=${s.bitrate}, gpuEncode=${s.gpuEncode ?? s.useHardwareAccel}, codec=${s.codec ?? "h264"}, preset=${s.preset ?? "p4"}, rc=${s.qualityMode ?? "vbr_hq"}, cq=${s.cq ?? 19}`
        );
      }

      if (currentProcessor?.isRunning()) {
        debugLog.error("IPC: START_PROCESS - Process already running");
        throw new Error("A process is already running. Please cancel it first.");
      }

      const singleVideoName = path.basename(params.videoPath || "");

      currentProcessor = new FFmpegProcessor({
        onProgress: (progress) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.PROGRESS_UPDATE, progress);
        },
        onLog: (log, type) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.LOG_OUTPUT, {
            log,
            type,
          });
          // Mirror FFmpeg logs to Debug Console
          debugLog.ffmpeg(`[${singleVideoName}] ${log}`);
        },
        onComplete: (outputPath) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.PROCESS_COMPLETE, outputPath);
          currentProcessor = null;

          // Show desktop notification
          const fileName = path.basename(outputPath);
          const notification = new Notification({
            title: t("notificationEncodingCompleteTitle"),
            body: t("notificationEncodingCompleteBody", { fileName }),
            icon: undefined,
          });

          notification.on("click", () => {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            shell.showItemInFolder(outputPath);
          });

          notification.show();
        },
        onError: (error) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.PROCESS_ERROR, error);
          currentProcessor = null;
        },
      });

      try {
        await currentProcessor.start(
          params.videoPath,
          params.subtitlePath,
          params.outputPath,
          params.settings
        );
        return { success: true };
      } catch (error) {
        currentProcessor = null;
        throw error;
      }
    }
  );

  // Cancel FFmpeg process
  ipcMain.handle(FFMPEG_CHANNELS.CANCEL_PROCESS, async () => {
    debugLog.ipc("IPC: CANCEL_PROCESS called");
    if (currentProcessor) {
      currentProcessor.cancel();
      currentProcessor = null;
      debugLog.ipc("IPC: CANCEL_PROCESS - Process cancelled");
      return { success: true };
    }
    debugLog.warn("IPC: CANCEL_PROCESS - No process is running");
    return { success: false, message: "No process is running" };
  });

  // Check GPU availability
  ipcMain.handle(FFMPEG_CHANNELS.CHECK_GPU, async () => {
    debugLog.ipc("IPC: CHECK_GPU called");
    const result = await FFmpegProcessor.checkGpuAvailability();
    debugLog.ipc(`IPC: CHECK_GPU - Result: ${result.available ? "Available" : "Not available"}`);
    if (result.available) {
      debugLog.ipc(`IPC: CHECK_GPU - Info: ${result.info}`);
    }
    return result;
  });

  // Open output folder in file explorer
  ipcMain.handle(FFMPEG_CHANNELS.OPEN_OUTPUT_FOLDER, async (_event, filePath: string) => {
    debugLog.ipc(`IPC: OPEN_OUTPUT_FOLDER called: ${filePath}`);
    try {
      shell.showItemInFolder(filePath);
      debugLog.ipc("IPC: OPEN_OUTPUT_FOLDER - Opened successfully");
      return { success: true };
    } catch (error) {
      debugLog.error(`IPC: OPEN_OUTPUT_FOLDER - Failed: ${error}`);
      console.error("Failed to open output folder:", error);
      return { success: false, error: String(error) };
    }
  });
}

/**
 * Gets the current processor instance (for use by other handlers).
 */
export function getCurrentProcessor(): FFmpegProcessor | null {
  return currentProcessor;
}

/**
 * Sets the current processor instance (for use by other handlers).
 */
export function setCurrentProcessor(processor: FFmpegProcessor | null): void {
  currentProcessor = processor;
}
