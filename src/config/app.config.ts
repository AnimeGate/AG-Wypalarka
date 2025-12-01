/**
 * Centralized Application Configuration
 *
 * This is the single source of truth for all app metadata.
 *
 * IMPORTANT: After changing these values:
 * 1. Update package.json manually (name, productName, build.appId, build.nsis.shortcutName)
 * 2. Rebuild the app (pnpm run build or pnpm run dist:dir)
 * 3. Clear any cached builds if necessary
 */

/**
 * Application Display Name
 * Used in: window titles, i18n translations, notifications
 */
export const APP_NAME = "AG-Wypalarka";

/**
 * Application ID (reverse domain notation)
 * Used in: Windows notifications (appUserModelId)
 * Should match package.json's build.appId
 */
export const APP_ID = "com.animegate.ag-wypalarka";

/**
 * Product Name (same as APP_NAME in most cases)
 * Should match package.json's productName
 */
export const PRODUCT_NAME = "AG-Wypalarka";

/**
 * Main Window Configuration
 */
export const MAIN_WINDOW = {
  title: "AG-Wypalarka",
  width: 1400,
  height: 900,
};

/**
 * Debug Console Configuration
 */
export const DEBUG_CONSOLE = {
  title: "AG-Wypalarka - Debug Console",
  width: 1000,
  height: 600,
  backgroundColor: "#0d1117",
};

/**
 * HTML Page Title
 * Used in: index.html <title> tag
 */
export const HTML_TITLE = "AG-Wypalarka";

/**
 * GitHub Repository Configuration
 * Used for: changelog history, release notes
 * Should match package.json's build.publish section
 */
export const GITHUB_CONFIG = {
  owner: "AnimeGate",
  repo: "AG-Wypalarka",
};

/**
 * Combined App Configuration
 * Provides a single export for all app settings
 */
export const APP_CONFIG = {
  name: APP_NAME,
  id: APP_ID,
  productName: PRODUCT_NAME,
  mainWindow: MAIN_WINDOW,
  debugConsole: DEBUG_CONSOLE,
  htmlTitle: HTML_TITLE,
  github: GITHUB_CONFIG,
};
