/**
 * Settings IPC channel constants
 */

export const SETTINGS_CHANNELS = {
  GET_OUTPUT: "settings:get-output",
  UPDATE_OUTPUT: "settings:update-output",
  SELECT_OUTPUT_FOLDER: "settings:select-output-folder",
  OUTPUT_UPDATED: "settings:output-updated",
} as const;
