/**
 * Queue Management Handlers
 *
 * IPC handlers for managing the FFmpeg encoding queue.
 */

import { BrowserWindow, dialog, ipcMain, Notification } from "electron";
import * as path from "path";
import { FFMPEG_CHANNELS } from "../ffmpeg-channels";
import { QueueProcessor } from "@/lib/queue-processor";
import { type EncodingSettings } from "@/lib/ffmpeg";
import { debugLog } from "../../../debug-mode";
import { t } from "../../../main-translations";

let queueProcessor: QueueProcessor | null = null;

/**
 * Initializes the queue processor with callbacks.
 */
function initializeQueueProcessor(
  mainWindow: BrowserWindow,
  settings?: EncodingSettings
): void {
  if (!queueProcessor) {
    queueProcessor = new QueueProcessor(
      {
        onQueueUpdate: (queue) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_UPDATE, queue);
        },
        onItemUpdate: (item) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_ITEM_UPDATE, item);
        },
        onItemProgress: (itemId, progress) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_ITEM_PROGRESS, {
            itemId,
            progress,
          });
        },
        onItemLog: (itemId, log, type) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_ITEM_LOG, {
            itemId,
            log,
            type,
          });
        },
        onItemComplete: (itemId, outputPath) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_ITEM_COMPLETE, {
            itemId,
            outputPath,
          });
        },
        onItemError: (itemId, error) => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_ITEM_ERROR, {
            itemId,
            error,
          });
        },
        onQueueComplete: () => {
          mainWindow.webContents.send(FFMPEG_CHANNELS.QUEUE_COMPLETE);

          // Show desktop notification with completed count
          const stats = queueProcessor?.getQueueStats();
          const completedCount = stats?.completed ?? 0;
          const notification = new Notification({
            title: t("notificationQueueCompleteTitle"),
            body: t("notificationQueueCompleteBody", { count: completedCount }),
            icon: undefined,
          });

          notification.on("click", () => {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
          });

          notification.show();
        },
      },
      settings
    );
  }
}

/**
 * Registers queue management handlers.
 */
export function registerQueueHandlers(mainWindow: BrowserWindow): void {
  // Add single item to queue
  ipcMain.handle(
    FFMPEG_CHANNELS.QUEUE_ADD_ITEM,
    async (
      _event,
      item: {
        videoPath: string;
        videoName: string;
        subtitlePath: string;
        subtitleName: string;
        outputPath: string;
      }
    ) => {
      initializeQueueProcessor(mainWindow);
      const id = queueProcessor!.addItem(item);
      return { success: true, id };
    }
  );

  // Add multiple items to queue
  ipcMain.handle(
    FFMPEG_CHANNELS.QUEUE_ADD_ITEMS,
    async (
      _event,
      items: Array<{
        videoPath: string;
        videoName: string;
        subtitlePath: string;
        subtitleName: string;
        outputPath: string;
      }>
    ) => {
      initializeQueueProcessor(mainWindow);
      const ids = queueProcessor!.addItems(items);
      return { success: true, ids };
    }
  );

  // Remove item from queue
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_REMOVE_ITEM, async (_event, id: string) => {
    if (!queueProcessor) {
      return { success: false, message: "Queue not initialized" };
    }
    queueProcessor.removeItem(id);
    return { success: true };
  });

  // Clear queue
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_CLEAR, async () => {
    if (!queueProcessor) {
      return { success: false, message: "Queue not initialized" };
    }
    queueProcessor.clearQueue();
    return { success: true };
  });

  // Reorder queue item
  ipcMain.handle(
    FFMPEG_CHANNELS.QUEUE_REORDER,
    async (_event, fromIndex: number, toIndex: number) => {
      if (!queueProcessor) {
        return { success: false, message: "Queue not initialized" };
      }
      queueProcessor.reorderItem(fromIndex, toIndex);
      return { success: true };
    }
  );

  // Start queue processing
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_START, async () => {
    if (!queueProcessor) {
      return { success: false, message: "Queue not initialized" };
    }
    await queueProcessor.start();
    return { success: true };
  });

  // Pause queue processing
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_PAUSE, async () => {
    if (!queueProcessor) {
      return { success: false, message: "Queue not initialized" };
    }
    queueProcessor.pause();
    return { success: true };
  });

  // Resume queue processing
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_RESUME, async () => {
    if (!queueProcessor) {
      return { success: false, message: "Queue not initialized" };
    }
    queueProcessor.resume();
    return { success: true };
  });

  // Get all queue items
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_GET_ALL, async () => {
    if (!queueProcessor) {
      return { queue: [] };
    }
    return { queue: queueProcessor.getQueue() };
  });

  // Get queue statistics
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_GET_STATS, async () => {
    if (!queueProcessor) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        error: 0,
        cancelled: 0,
      };
    }
    return queueProcessor.getQueueStats();
  });

  // Update queue settings
  ipcMain.handle(
    FFMPEG_CHANNELS.QUEUE_UPDATE_SETTINGS,
    async (_event, settings: EncodingSettings) => {
      initializeQueueProcessor(mainWindow, settings);
      queueProcessor!.updateSettings(settings);
      return { success: true };
    }
  );

  // Update item output path
  ipcMain.handle(
    FFMPEG_CHANNELS.QUEUE_UPDATE_ITEM_OUTPUT,
    async (_event, itemId: string, newOutputPath: string) => {
      if (!queueProcessor) {
        return { success: false, message: "Queue not initialized" };
      }
      const result = queueProcessor.updateItemOutput(itemId, newOutputPath);
      return { success: result };
    }
  );

  // Select multiple video files for queue
  ipcMain.handle(FFMPEG_CHANNELS.QUEUE_SELECT_FILES, async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Video Files",
          extensions: ["mkv", "mp4", "avi", "mov", "wmv", "flv", "webm"],
        },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "Select Video Files",
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, files: [] };
    }

    // Return video files
    const videoFiles = result.filePaths.map((filePath) => ({
      filePath,
      fileName: path.basename(filePath),
    }));

    return { success: true, files: videoFiles };
  });
}

/**
 * Gets the queue processor instance.
 */
export function getQueueProcessor(): QueueProcessor | null {
  return queueProcessor;
}
