/**
 * FFmpeg IPC Listeners
 *
 * Main entry point for registering all FFmpeg-related IPC handlers.
 * Delegates to specialized handler modules for organization.
 */

import { BrowserWindow } from "electron";
import {
  registerFileHandlers,
  registerProcessHandlers,
  registerDownloadHandlers,
  registerDiskSpaceHandlers,
  registerQueueHandlers,
} from "./handlers";

/**
 * Registers all FFmpeg-related IPC event listeners.
 *
 * @param mainWindow - The main BrowserWindow instance
 */
export function addFfmpegEventListeners(mainWindow: BrowserWindow): void {
  // File selection and output path handlers
  registerFileHandlers(mainWindow);

  // FFmpeg process control handlers
  registerProcessHandlers(mainWindow);

  // FFmpeg download handlers
  registerDownloadHandlers(mainWindow);

  // Disk space check handlers
  registerDiskSpaceHandlers();

  // Queue management handlers
  registerQueueHandlers(mainWindow);
}
