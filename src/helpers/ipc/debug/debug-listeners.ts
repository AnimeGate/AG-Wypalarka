import { BrowserWindow, ipcMain } from "electron";
import { DEBUG_CHANNELS } from "./debug-channels";
import { debugLog } from "../../debug-mode";

type DebugLogLevel =
  | "info"
  | "success"
  | "warn"
  | "error"
  | "debug"
  | "route"
  | "ipc"
  | "updater"
  | "ffmpeg"
  | "queue"
  | "file"
  | "legal"
  | "perf"
  | "network"
  | "state"
  | "lifecycle";

/**
 * Register debug IPC listeners
 */
export function registerDebugListeners(_mainWindow: BrowserWindow): void {
  // Handle renderer debug logs
  ipcMain.on(
    DEBUG_CHANNELS.LOG,
    (
      _event,
      data: {
        level: DebugLogLevel;
        message: string;
        args: unknown[];
      }
    ) => {
      const { level, message, args } = data;

      // Route to appropriate debug log function (this will also send to debug console)
      switch (level) {
        case "info":
          debugLog.info(`[RENDERER] ${message}`, ...args);
          break;
        case "success":
          debugLog.success(`[RENDERER] ${message}`, ...args);
          break;
        case "warn":
          debugLog.warn(`[RENDERER] ${message}`, ...args);
          break;
        case "error":
          debugLog.error(`[RENDERER] ${message}`, ...args);
          break;
        case "debug":
          debugLog.debug(`[RENDERER] ${message}`, ...args);
          break;
        case "route":
          debugLog.route(message, ...args);
          break;
        case "ipc":
          debugLog.ipc(message, ...args);
          break;
        case "updater":
          debugLog.updater(message, ...args);
          break;
        case "ffmpeg":
          debugLog.ffmpeg(message, ...args);
          break;
        case "queue":
          debugLog.queue(message, ...args);
          break;
        case "file":
          debugLog.file(message, ...args);
          break;
        case "legal":
          debugLog.legal(message, ...args);
          break;
        case "perf":
          debugLog.perf(message, ...args);
          break;
        case "network":
          debugLog.network(message, ...args);
          break;
        case "state":
          debugLog.state(message, ...args);
          break;
        case "lifecycle":
          debugLog.lifecycle(message, ...args);
          break;
      }
    }
  );
}
