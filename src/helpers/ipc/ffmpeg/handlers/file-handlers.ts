/**
 * FFmpeg File Selection Handlers
 *
 * IPC handlers for file dialogs, output path resolution, and conflict detection.
 */

import { BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import { FFMPEG_CHANNELS } from "../ffmpeg-channels";
import { debugLog } from "../../../debug-mode";
import { SettingsStore } from "@/helpers/settings/settings-store";

/**
 * Sanitizes a filename by removing invalid characters.
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Registers file selection and output path handlers.
 */
export function registerFileHandlers(mainWindow: BrowserWindow): void {
  // Select video file dialog
  ipcMain.handle(FFMPEG_CHANNELS.SELECT_VIDEO_FILE, async () => {
    debugLog.ipc("IPC: SELECT_VIDEO_FILE called");
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        {
          name: "Video Files",
          extensions: ["mkv", "mp4", "avi", "mov", "wmv", "flv", "webm"],
        },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "Select Video File",
    });

    if (result.canceled || result.filePaths.length === 0) {
      debugLog.ipc("IPC: SELECT_VIDEO_FILE - User cancelled");
      return null;
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    debugLog.ipc(`IPC: SELECT_VIDEO_FILE - Selected: ${fileName}`);

    return { filePath, fileName };
  });

  // Select subtitle file dialog
  ipcMain.handle(FFMPEG_CHANNELS.SELECT_SUBTITLE_FILE, async () => {
    debugLog.ipc("IPC: SELECT_SUBTITLE_FILE called");
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "ASS Subtitles", extensions: ["ass"] },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "Select Subtitle File",
    });

    if (result.canceled || result.filePaths.length === 0) {
      debugLog.ipc("IPC: SELECT_SUBTITLE_FILE - User cancelled");
      return null;
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    debugLog.ipc(`IPC: SELECT_SUBTITLE_FILE - Selected: ${fileName}`);

    return { filePath, fileName };
  });

  // Select output path dialog
  ipcMain.handle(FFMPEG_CHANNELS.SELECT_OUTPUT_PATH, async (_event, defaultName: string) => {
    debugLog.ipc(`IPC: SELECT_OUTPUT_PATH called (default: ${defaultName})`);
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: [
        { name: "MP4 Video", extensions: ["mp4"] },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "Save Output Video",
    });

    if (result.canceled || !result.filePath) {
      debugLog.ipc("IPC: SELECT_OUTPUT_PATH - User cancelled");
      return null;
    }

    debugLog.ipc(`IPC: SELECT_OUTPUT_PATH - Selected: ${result.filePath}`);
    return result.filePath;
  });

  // Resolve default output path based on settings
  ipcMain.handle(
    FFMPEG_CHANNELS.GET_DEFAULT_OUTPUT_PATH,
    async (
      _event,
      videoPath: string,
      override?: { prefix?: string; directory?: string | null }
    ) => {
      const store = SettingsStore.getInstance();
      const outputSettings = store.getOutput();

      try {
        const videoDir = path.dirname(videoPath);
        const base = path.basename(videoPath, path.extname(videoPath));

        const prefix = (override?.prefix ?? outputSettings.filenamePrefix ?? "").trim();
        const customDir =
          override?.directory === undefined ? outputSettings.customFolder : override.directory;
        const useCustom =
          (outputSettings.locationMode === "custom_folder" && !!customDir) ||
          (!!customDir && customDir.length > 0);
        const subfolderMode = outputSettings.locationMode === "input_subfolder";
        const targetDir = useCustom
          ? (customDir as string)
          : subfolderMode
            ? path.join(videoDir, "wypalone")
            : videoDir;

        // Ensure target dir exists if subfolder
        if (subfolderMode) {
          try {
            fs.mkdirSync(targetDir, { recursive: true });
          } catch {
            // Ignore errors
          }
        }

        const suffixWithSpace = prefix ? ` ${prefix}` : "";
        const sanitizedBase = sanitizeFileName(base + suffixWithSpace);
        const fileName = `${sanitizedBase}.mp4`;
        const full = path.join(targetDir, fileName);

        debugLog.ipc(`Resolved default output: ${full}`);
        return full;
      } catch (e) {
        debugLog.error(`Failed to resolve default output path: ${e}`);
        // Fallback: same folder, basic suffix
        try {
          const videoDir = path.dirname(videoPath);
          const base = path.basename(videoPath, path.extname(videoPath));
          return path.join(videoDir, `${base}_with_subs.mp4`);
        } catch {
          return "output_with_subs.mp4";
        }
      }
    }
  );

  // Check if output file exists
  ipcMain.handle(FFMPEG_CHANNELS.CHECK_OUTPUT_EXISTS, async (_event, outputPath: string) => {
    debugLog.ipc(`IPC: CHECK_OUTPUT_EXISTS called: ${outputPath}`);
    const exists = fs.existsSync(outputPath);
    debugLog.ipc(`IPC: CHECK_OUTPUT_EXISTS - Result: ${exists}`);
    return exists;
  });

  // Resolve output conflict by appending number
  ipcMain.handle(FFMPEG_CHANNELS.RESOLVE_OUTPUT_CONFLICT, async (_event, outputPath: string) => {
    debugLog.ipc(`IPC: RESOLVE_OUTPUT_CONFLICT called: ${outputPath}`);
    const dir = path.dirname(outputPath);
    const ext = path.extname(outputPath);
    const base = path.basename(outputPath, ext);

    let counter = 1;
    let newPath = outputPath;
    while (fs.existsSync(newPath)) {
      newPath = path.join(dir, `${base}_${counter}${ext}`);
      counter++;
    }
    debugLog.ipc(`IPC: RESOLVE_OUTPUT_CONFLICT - Resolved to: ${newPath}`);
    return newPath;
  });
}
