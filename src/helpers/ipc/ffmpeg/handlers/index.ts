/**
 * FFmpeg IPC Handlers
 *
 * Barrel export for all FFmpeg-related IPC handlers.
 */

export { registerFileHandlers } from "./file-handlers";
export { registerProcessHandlers, getCurrentProcessor, setCurrentProcessor } from "./process-handlers";
export { registerDownloadHandlers, getCurrentDownloader } from "./download-handlers";
export { registerDiskSpaceHandlers } from "./disk-space-handlers";
export { registerQueueHandlers, getQueueProcessor } from "./queue-handlers";
