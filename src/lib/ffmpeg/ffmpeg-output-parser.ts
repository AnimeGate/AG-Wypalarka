/**
 * FFmpeg Output Parser
 *
 * Utilities for parsing FFmpeg command output, including progress tracking,
 * duration extraction, and log categorization.
 */

export type LogType = "info" | "success" | "warning" | "error" | "debug" | "metadata";

export interface ParsedProgress {
  frame: number;
  fps: number;
  time: string;
  bitrate: string;
  speed: string;
  percentage: number;
  eta: string | null;
}

/**
 * Parses a time string in FFmpeg format to seconds.
 *
 * @param timeString - Time string in format HH:MM:SS.mmm or MM:SS.mmm
 * @returns Time in seconds
 *
 * @example
 * parseTime("01:30:45.50") // Returns: 5445.5
 * parseTime("05:30.25")    // Returns: 330.25
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(":");
  let seconds = 0;

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    seconds = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    // MM:SS.mmm
    seconds = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  } else {
    seconds = parseFloat(timeString);
  }

  return seconds;
}

/**
 * Extracts video duration from FFmpeg output.
 *
 * @param output - Raw FFmpeg output string
 * @returns Duration in seconds, or null if not found
 *
 * @example
 * extractDuration("Duration: 01:30:45.50, start: 0.000000")
 * // Returns: 5445.5
 */
export function extractDuration(output: string): number | null {
  const durationMatch = output.match(/Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/);
  if (durationMatch) {
    return parseTime(durationMatch[1]);
  }
  return null;
}

/**
 * Formats seconds into human-readable ETA string.
 *
 * @param seconds - Remaining time in seconds
 * @returns Formatted ETA string (e.g., "2h 30m 15s")
 */
export function formatETA(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return "Calculating...";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Categorizes a log line based on its content.
 *
 * @param log - Log line from FFmpeg output
 * @returns Log category for styling/filtering
 */
export function categorizeLog(log: string): LogType {
  const lower = log.toLowerCase();

  // Errors
  if (lower.includes("error") || lower.includes("failed") || lower.includes("invalid")) {
    return "error";
  }

  // Warnings
  if (
    lower.includes("warning") ||
    lower.includes("deprecated") ||
    (lower.includes("not found") && !lower.includes("glyph"))
  ) {
    return "warning";
  }

  // Success
  if (lower.includes("completed") || lower.includes("success") || lower.includes("done")) {
    return "success";
  }

  // Metadata (codec info, stream info, etc.)
  if (
    lower.includes("stream") ||
    lower.includes("duration") ||
    lower.includes("encoder") ||
    lower.includes("bitrate") ||
    lower.includes("video:") ||
    lower.includes("audio:")
  ) {
    return "metadata";
  }

  // Debug (very technical)
  if (lower.includes("libav") || lower.includes("configuration:")) {
    return "debug";
  }

  // Default to info
  return "info";
}

/**
 * Parses FFmpeg progress output line.
 *
 * @param data - Progress line from FFmpeg (e.g., "frame=123 fps=45 ...")
 * @param totalDuration - Total video duration in seconds (for percentage calculation)
 * @param startTime - Encoding start timestamp (for ETA calculation)
 * @returns Parsed progress object, or null if line is not a progress line
 *
 * @example
 * parseProgressLine(
 *   "frame=  123 fps=45 q=28.0 size=1024kB time=00:00:05.12 bitrate=1634.2kbits/s speed=1.5x",
 *   120, // 2 minute video
 *   Date.now() - 5000 // started 5 seconds ago
 * )
 */
export function parseProgressLine(
  data: string,
  totalDuration: number,
  startTime: number
): ParsedProgress | null {
  if (!data.includes("frame=")) return null;

  const frameMatch = data.match(/frame=\s*(\d+)/);
  const fpsMatch = data.match(/fps=\s*([\d.]+)/);
  const timeMatch = data.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
  const bitrateMatch = data.match(/bitrate=\s*([\d.]+\w+\/s)/);
  const speedMatch = data.match(/speed=\s*([\d.]+x)/);

  if (!timeMatch) return null;

  const currentTime = parseTime(timeMatch[1]);
  const percentage = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  // Calculate ETA based on encoding speed
  let eta: string | null = null;
  if (totalDuration > 0 && percentage > 0 && percentage < 100) {
    const now = Date.now();
    const elapsed = (now - startTime) / 1000; // seconds
    const estimatedTotal = elapsed / (percentage / 100);
    const remaining = estimatedTotal - elapsed;
    eta = formatETA(remaining);
  }

  return {
    frame: frameMatch ? parseInt(frameMatch[1]) : 0,
    fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
    time: timeMatch[1],
    bitrate: bitrateMatch ? bitrateMatch[1] : "N/A",
    speed: speedMatch ? speedMatch[1] : "N/A",
    percentage: Math.round(percentage * 100) / 100,
    eta,
  };
}

/**
 * Filters FFmpeg output lines to remove noisy progress updates.
 * Returns only meaningful log lines.
 *
 * @param output - Raw FFmpeg output
 * @returns Array of filtered log lines
 */
export function filterLogLines(output: string): string[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.includes("size=") && !line.includes("frame="));
}
