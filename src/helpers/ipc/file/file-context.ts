/**
 * File IPC context - exposes file utilities to renderer
 */

import { contextBridge } from "electron";
import { webUtils } from "electron";

export function exposeFileContext() {
  contextBridge.exposeInMainWorld("fileAPI", {
    /**
     * Get the filesystem path from a File object (for drag & drop)
     */
    getPathForFile: (file: File): string => {
      return webUtils.getPathForFile(file);
    },
  });
}
