/**
 * Settings IPC context - exposes settings API to renderer
 */

import { contextBridge, ipcRenderer } from "electron";
import { SETTINGS_CHANNELS } from "./settings-channels";

export interface OutputSettings {
  locationMode: "same_as_input" | "custom_folder" | "input_subfolder";
  customFolder: string | null;
  filenamePrefix: string;
}

export function exposeSettingsContext() {
  contextBridge.exposeInMainWorld("settingsAPI", {
    getOutput: async (): Promise<OutputSettings> => {
      return await ipcRenderer.invoke(SETTINGS_CHANNELS.GET_OUTPUT);
    },

    updateOutput: async (partial: Partial<OutputSettings>): Promise<OutputSettings> => {
      return await ipcRenderer.invoke(SETTINGS_CHANNELS.UPDATE_OUTPUT, partial);
    },

    selectOutputFolder: async (): Promise<string | null> => {
      return await ipcRenderer.invoke(SETTINGS_CHANNELS.SELECT_OUTPUT_FOLDER);
    },

    onOutputUpdated: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on(SETTINGS_CHANNELS.OUTPUT_UPDATED, listener);
      return () => ipcRenderer.removeListener(SETTINGS_CHANNELS.OUTPUT_UPDATED, listener);
    },
  });
}
