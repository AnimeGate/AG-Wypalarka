/**
 * Window Registry
 *
 * Tracks BrowserWindow instances for multi-window logging support.
 * Each window gets a unique color for visual identification in debug console.
 */

import { BrowserWindow } from "electron";

export interface WindowInfo {
  id: number;
  name: string;
  color: string;
}

const WINDOW_COLORS = [
  "#58a6ff", // Blue (Main)
  "#f0883e", // Orange
  "#a371f7", // Purple
  "#3fb950", // Green
  "#f778ba", // Pink
  "#ffd33d", // Yellow
];

class WindowRegistry {
  private windows: Map<number, WindowInfo> = new Map();
  private colorIndex = 0;

  /**
   * Register a new window with a display name
   */
  register(window: BrowserWindow, name: string): WindowInfo {
    const info: WindowInfo = {
      id: window.id,
      name,
      color: WINDOW_COLORS[this.colorIndex % WINDOW_COLORS.length],
    };
    this.windows.set(window.id, info);
    this.colorIndex++;

    // Clean up when window closes
    window.on("closed", () => this.windows.delete(window.id));

    return info;
  }

  /**
   * Get window info by ID
   */
  get(windowId: number): WindowInfo | undefined {
    return this.windows.get(windowId);
  }

  /**
   * Get window name by ID
   */
  getName(windowId: number): string {
    return this.windows.get(windowId)?.name ?? "Unknown";
  }

  /**
   * Get window color by ID
   */
  getColor(windowId: number): string {
    return this.windows.get(windowId)?.color ?? "#8b949e";
  }

  /**
   * Get all registered windows
   */
  getAll(): WindowInfo[] {
    return Array.from(this.windows.values());
  }

  /**
   * Check if a window is registered
   */
  has(windowId: number): boolean {
    return this.windows.has(windowId);
  }
}

export const windowRegistry = new WindowRegistry();
