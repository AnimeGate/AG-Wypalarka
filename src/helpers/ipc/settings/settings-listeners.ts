/**
 * Settings IPC listeners - handles settings operations in main process
 */

import { ipcMain, dialog, BrowserWindow } from "electron";
import { SETTINGS_CHANNELS } from "./settings-channels";
import { SettingsStore } from "../../settings/settings-store";
import { debugLog } from "../../debug-mode";

export function registerSettingsListeners() {
  // Get output settings
  ipcMain.handle(SETTINGS_CHANNELS.GET_OUTPUT, () => {
    try {
      const store = SettingsStore.getInstance();
      const output = store.getOutput();
      debugLog.ipc(`GET_OUTPUT - returning: ${JSON.stringify(output)}`);
      return output;
    } catch (error) {
      debugLog.error(`Failed to get output settings: ${error}`);
      return {
        locationMode: "same_as_input",
        customFolder: null,
        filenamePrefix: "",
      };
    }
  });

  // Update output settings
  ipcMain.handle(SETTINGS_CHANNELS.UPDATE_OUTPUT, (_event, partial) => {
    try {
      const store = SettingsStore.getInstance();
      const updated = store.updateOutput(partial);
      debugLog.ipc(`UPDATE_OUTPUT - updated to: ${JSON.stringify(updated)}`);

      // Notify all windows that settings changed
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(SETTINGS_CHANNELS.OUTPUT_UPDATED);
      });

      return updated;
    } catch (error) {
      debugLog.error(`Failed to update output settings: ${error}`);
      throw error;
    }
  });

  // Select output folder
  ipcMain.handle(SETTINGS_CHANNELS.SELECT_OUTPUT_FOLDER, async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender);
      const result = await dialog.showOpenDialog(win!, {
        properties: ["openDirectory"],
        title: "Wybierz folder wyjściowy",
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      debugLog.error(`Failed to select output folder: ${error}`);
      return null;
    }
  });
}
