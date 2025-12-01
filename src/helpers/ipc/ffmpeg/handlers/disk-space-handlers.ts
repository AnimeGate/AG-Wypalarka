/**
 * Disk Space Handlers
 *
 * IPC handlers for disk space checks and video duration queries.
 */

import { ipcMain } from "electron";
import * as path from "path";
import { FFMPEG_CHANNELS } from "../ffmpeg-channels";
import { getVideoDuration } from "@/lib/ffmpeg";
import {
  getDiskSpace,
  estimateOutputSize,
  formatBytes,
  type DiskSpaceInfo,
  type DiskSpaceCheckResult,
} from "@/lib/disk-space";
import { debugLog } from "../../../debug-mode";

/**
 * Registers disk space and video duration handlers.
 */
export function registerDiskSpaceHandlers(): void {
  // Get disk space for a path
  ipcMain.handle(
    FFMPEG_CHANNELS.GET_DISK_SPACE,
    async (_, targetPath: string): Promise<DiskSpaceInfo> => {
      debugLog.ipc(`IPC: GET_DISK_SPACE called for path: ${targetPath}`);
      try {
        const outputDir = path.dirname(targetPath);
        const spaceInfo = await getDiskSpace(outputDir);
        debugLog.ipc(`IPC: GET_DISK_SPACE - Available: ${formatBytes(spaceInfo.available)}`);
        return spaceInfo;
      } catch (error) {
        debugLog.error(`IPC: GET_DISK_SPACE - Failed: ${error}`);
        // Return fallback values if check fails
        return {
          available: 0,
          total: 0,
          driveLetter: "?:",
        };
      }
    }
  );

  // Get video duration
  ipcMain.handle(
    FFMPEG_CHANNELS.GET_VIDEO_DURATION,
    async (_, videoPath: string): Promise<number> => {
      debugLog.ipc(`IPC: GET_VIDEO_DURATION called for: ${videoPath}`);
      try {
        const duration = await getVideoDuration(videoPath);
        debugLog.ipc(`IPC: GET_VIDEO_DURATION - Result: ${duration}ms`);
        return duration;
      } catch (error) {
        debugLog.error(`IPC: GET_VIDEO_DURATION - Failed: ${error}`);
        throw error;
      }
    }
  );

  // Check disk space for encoding
  ipcMain.handle(
    FFMPEG_CHANNELS.CHECK_DISK_SPACE,
    async (
      _,
      outputPath: string,
      videoPath: string,
      settings: {
        bitrate?: string;
        qualityMode?: string;
        cqValue?: number;
      }
    ): Promise<DiskSpaceCheckResult> => {
      debugLog.ipc(`IPC: CHECK_DISK_SPACE called - output: ${outputPath}, video: ${videoPath}`);
      try {
        // Get output directory (file might not exist yet)
        const outputDir = path.dirname(outputPath);

        // Get disk space
        const spaceInfo = await getDiskSpace(outputDir);

        // Get video duration
        const duration = await getVideoDuration(videoPath);

        // Estimate required space
        const requiredSpace = estimateOutputSize(duration, settings);

        // Check if sufficient (with 500MB minimum buffer)
        const minimumBuffer = 500 * 1024 * 1024; // 500 MB
        const sufficient = spaceInfo.available >= requiredSpace + minimumBuffer;

        const result: DiskSpaceCheckResult = {
          sufficient,
          available: spaceInfo.available,
          required: requiredSpace,
          availableFormatted: formatBytes(spaceInfo.available),
          requiredFormatted: formatBytes(requiredSpace),
          driveLetter: spaceInfo.driveLetter,
        };

        debugLog.ipc(
          `IPC: CHECK_DISK_SPACE - Sufficient: ${sufficient}, Available: ${result.availableFormatted}, Required: ${result.requiredFormatted}`
        );

        return result;
      } catch (error) {
        debugLog.warn(`IPC: CHECK_DISK_SPACE - Failed: ${error}`);
        // If check fails, allow encoding to proceed (don't block on check failure)
        return {
          sufficient: true, // Optimistic fallback
          available: 0,
          required: 0,
          availableFormatted: "Unknown",
          requiredFormatted: "Unknown",
          driveLetter: "?:",
        };
      }
    }
  );
}
