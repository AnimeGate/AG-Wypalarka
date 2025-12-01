/**
 * FFmpeg Processor
 *
 * Core class for managing FFmpeg encoding processes.
 * Handles process lifecycle, progress tracking, and error handling.
 */

import { spawn, ChildProcess } from "child_process";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { FFmpegDownloader } from "../ffmpeg-downloader";

import { escapeSubtitlePath, validatePathForFFmpeg } from "./ffmpeg-path-utils";
import {
  extractDuration,
  parseProgressLine,
  filterLogLines,
  categorizeLog,
} from "./ffmpeg-output-parser";
import {
  normalizeSettings,
  buildEncoderArgs,
  type EncodingSettings,
  type FFmpegCallbacks,
  type FFmpegProgress,
} from "./ffmpeg-settings";

/**
 * FFmpeg process manager for subtitle burning.
 *
 * Handles:
 * - FFmpeg process lifecycle (start, cancel)
 * - Progress tracking and ETA calculation
 * - Log parsing and categorization
 * - Output file management
 */
export class FFmpegProcessor {
  private process: ChildProcess | null = null;
  private callbacks: FFmpegCallbacks;
  private videoDuration: number = 0;
  private outputPath: string = "";
  private startTime: number = 0;
  private wasCancelled: boolean = false;

  constructor(callbacks: FFmpegCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Gets the path to the FFmpeg executable.
   */
  private getFfmpegPath(): string {
    const isDev = !app.isPackaged;

    if (isDev) {
      // In development, check project folder first, then userData
      const projectPath = path.join(process.cwd(), "WYPALANIE", "ffmpeg.exe");
      if (fs.existsSync(projectPath)) {
        return projectPath;
      }
      return FFmpegDownloader.getFfmpegPath();
    } else {
      // In production, always use downloaded FFmpeg in userData
      return FFmpegDownloader.getFfmpegPath();
    }
  }

  /**
   * Checks for available GPU hardware encoders.
   *
   * @returns Promise with availability status and encoder info
   */
  static async checkGpuAvailability(): Promise<{ available: boolean; info: string }> {
    return new Promise((resolve) => {
      let ffmpegPath: string;
      const isDev = !app.isPackaged;

      if (isDev) {
        const projectPath = path.join(process.cwd(), "WYPALANIE", "ffmpeg.exe");
        if (fs.existsSync(projectPath)) {
          ffmpegPath = projectPath;
        } else {
          ffmpegPath = FFmpegDownloader.getFfmpegPath();
        }
      } else {
        ffmpegPath = FFmpegDownloader.getFfmpegPath();
      }

      if (!fs.existsSync(ffmpegPath)) {
        resolve({ available: false, info: "FFmpeg not found" });
        return;
      }

      const ffmpegProcess = spawn(ffmpegPath, ["-encoders"]);
      let output = "";

      ffmpegProcess.stdout?.on("data", (data: Buffer) => {
        output += data.toString();
      });

      ffmpegProcess.stderr?.on("data", (data: Buffer) => {
        output += data.toString();
      });

      ffmpegProcess.on("close", () => {
        const hasNVENC = output.includes("h264_nvenc");
        const hasQSV = output.includes("h264_qsv");
        const hasAMF = output.includes("h264_amf");

        if (hasNVENC) {
          resolve({ available: true, info: "NVIDIA NVENC detected" });
        } else if (hasQSV) {
          resolve({ available: true, info: "Intel Quick Sync detected" });
        } else if (hasAMF) {
          resolve({ available: true, info: "AMD AMF detected" });
        } else {
          resolve({ available: false, info: "No hardware encoder detected" });
        }
      });

      ffmpegProcess.on("error", () => {
        resolve({ available: false, info: "Error checking GPU" });
      });

      setTimeout(() => {
        ffmpegProcess.kill();
        resolve({ available: false, info: "Detection timeout" });
      }, 3000);
    });
  }

  /**
   * Handles FFmpeg stderr output for duration and progress parsing.
   */
  private handleStderrOutput(data: Buffer): void {
    const output = data.toString();

    // Extract duration on first output
    if (this.videoDuration === 0) {
      const duration = extractDuration(output);
      if (duration !== null) {
        this.videoDuration = duration;
        this.callbacks.onLog(
          `Video duration detected: ${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s`,
          "metadata"
        );
      }
    }

    // Parse progress
    const progress = parseProgressLine(output, this.videoDuration, this.startTime);
    if (progress) {
      this.callbacks.onProgress(progress as FFmpegProgress);
    }

    // Send filtered log output
    const lines = filterLogLines(output);
    lines.forEach((line) => {
      if (line.trim()) {
        const logType = categorizeLog(line);
        this.callbacks.onLog(line.trim(), logType);
      }
    });
  }

  /**
   * Starts the FFmpeg encoding process.
   *
   * @param videoPath - Path to input video file
   * @param subtitlePath - Path to ASS subtitle file
   * @param outputPath - Path for output video file
   * @param settings - Encoding settings
   */
  async start(
    videoPath: string,
    subtitlePath: string,
    outputPath: string,
    settings: EncodingSettings = { bitrate: "2400k" }
  ): Promise<void> {
    if (this.process) {
      throw new Error("A process is already running");
    }

    // Validate input files exist
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }
    if (!fs.existsSync(subtitlePath)) {
      throw new Error(`Subtitle file not found: ${subtitlePath}`);
    }

    // Validate paths are safe for FFmpeg processing
    const videoValidation = validatePathForFFmpeg(videoPath);
    if (!videoValidation.isValid) {
      throw new Error(`Invalid video path: ${videoValidation.error}`);
    }
    const subtitleValidation = validatePathForFFmpeg(subtitlePath);
    if (!subtitleValidation.isValid) {
      throw new Error(`Invalid subtitle path: ${subtitleValidation.error}`);
    }
    const outputValidation = validatePathForFFmpeg(outputPath);
    if (!outputValidation.isValid) {
      throw new Error(`Invalid output path: ${outputValidation.error}`);
    }

    // Resolve output path and ensure directory exists
    let resolvedOutputPath = outputPath;
    try {
      if (!path.isAbsolute(resolvedOutputPath)) {
        resolvedOutputPath = path.join(path.dirname(videoPath), resolvedOutputPath);
      }
      fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
      this.callbacks.onLog(`Resolved output path: ${resolvedOutputPath}`, "info");
    } catch (e) {
      this.callbacks.onLog(`Failed to ensure output directory: ${String(e)}`, "warning");
    }

    this.outputPath = resolvedOutputPath;
    this.videoDuration = 0;
    this.startTime = Date.now();
    this.wasCancelled = false;

    const ffmpegPath = this.getFfmpegPath();
    if (!fs.existsSync(ffmpegPath)) {
      throw new Error(`FFmpeg executable not found: ${ffmpegPath}`);
    }

    // Log process info
    this.callbacks.onLog(`Starting FFmpeg process...`, "info");
    this.callbacks.onLog(`FFmpeg path: ${ffmpegPath}`, "debug");
    this.callbacks.onLog(`Video: ${videoPath}`, "info");
    this.callbacks.onLog(`Subtitles: ${subtitlePath}`, "info");
    this.callbacks.onLog(`Output: ${this.outputPath}`, "info");

    // Normalize settings
    const normalized = normalizeSettings(settings);
    this.callbacks.onLog(
      `Quality: ${normalized.qualityMode}${normalized.cq !== undefined ? ", CQ=" + normalized.cq : ""} | ` +
        `Encoder: ${normalized.codec} ${normalized.hwEncoder} | ` +
        `GPU Encode: ${normalized.gpuEncode ? "ON" : "OFF"}`,
      "info"
    );

    // Build FFmpeg arguments
    const args = this.buildArgs(videoPath, subtitlePath, normalized);
    this.callbacks.onLog(`Command: ${ffmpegPath} ${args.join(" ")}`, "debug");

    return this.runProcess(ffmpegPath, args);
  }

  /**
   * Builds complete FFmpeg argument array.
   */
  private buildArgs(
    videoPath: string,
    subtitlePath: string,
    settings: ReturnType<typeof normalizeSettings>
  ): string[] {
    const args: string[] = [];

    // Input
    args.push("-i", videoPath);

    // Video filter chain
    const vfParts: string[] = [];
    if (settings.scaleWidth && settings.scaleHeight) {
      vfParts.push(`scale=${settings.scaleWidth}:${settings.scaleHeight}`);
    }
    vfParts.push(`subtitles='${escapeSubtitlePath(subtitlePath)}'`);
    if (settings.gpuEncode) {
      vfParts.push("format=yuv420p");
    }
    args.push("-vf", vfParts.join(","));

    // Video encoder settings
    args.push(...buildEncoderArgs(settings));

    // Audio copy (no re-encoding)
    args.push("-c:a", "copy");

    // MP4 faststart and overwrite
    if (this.outputPath.toLowerCase().endsWith(".mp4")) {
      args.push("-movflags", "+faststart");
    }
    args.push("-y");

    // Output file
    args.push(this.outputPath);

    return args;
  }

  /**
   * Runs the FFmpeg process and handles events.
   */
  private runProcess(ffmpegPath: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn(ffmpegPath, args);

      this.process.stderr?.on("data", (data: Buffer) => {
        this.handleStderrOutput(data);
      });

      this.process.stdout?.on("data", (data: Buffer) => {
        this.callbacks.onLog(`[stdout] ${data.toString()}`, "debug");
      });

      this.process.on("error", (error) => {
        this.callbacks.onError(`Process error: ${error.message}`);
        this.process = null;
        reject(error);
      });

      this.process.on("close", (code) => {
        this.process = null;

        if (code === 0) {
          this.callbacks.onLog("Process completed successfully!", "success");
          this.callbacks.onComplete(this.outputPath);
          resolve();
        } else if (code !== null) {
          const error = `Process exited with code ${code}`;
          this.callbacks.onError(error);
          reject(new Error(error));
        } else {
          // Process was cancelled
          this.callbacks.onLog("Process was cancelled", "warning");
          this.cleanupPartialOutput();
          resolve();
        }
      });
    });
  }

  /**
   * Cleans up partial output file after cancellation.
   */
  private cleanupPartialOutput(): void {
    if (this.wasCancelled && this.outputPath) {
      try {
        if (fs.existsSync(this.outputPath)) {
          fs.unlinkSync(this.outputPath);
          this.callbacks.onLog("Partial output file deleted", "info");
        }
      } catch (err) {
        this.callbacks.onLog(`Failed to delete partial output: ${err}`, "warning");
      }
    }
  }

  /**
   * Cancels the running FFmpeg process.
   */
  cancel(): void {
    if (this.process) {
      this.callbacks.onLog("Cancelling process...", "warning");
      this.wasCancelled = true;
      this.process.kill("SIGTERM");
    }
  }

  /**
   * Checks if a process is currently running.
   */
  isRunning(): boolean {
    return this.process !== null;
  }
}

/**
 * Gets video duration in milliseconds using FFprobe.
 *
 * @param videoPath - Path to video file
 * @returns Duration in milliseconds
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobePath = FFmpegDownloader.getFfprobePath();

    if (!fs.existsSync(ffprobePath)) {
      reject(new Error("FFprobe not found"));
      return;
    }

    const ffprobeProcess = spawn(ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    let output = "";
    let errorOutput = "";

    ffprobeProcess.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
    });

    ffprobeProcess.stderr?.on("data", (data: Buffer) => {
      errorOutput += data.toString();
    });

    ffprobeProcess.on("close", (code) => {
      if (code === 0) {
        const durationSeconds = parseFloat(output.trim());
        if (!isNaN(durationSeconds)) {
          resolve(durationSeconds * 1000);
        } else {
          reject(new Error("Failed to parse video duration"));
        }
      } else {
        reject(new Error(`FFprobe exited with code ${code}: ${errorOutput}`));
      }
    });

    ffprobeProcess.on("error", (error) => {
      reject(new Error(`FFprobe process error: ${error.message}`));
    });

    setTimeout(() => {
      ffprobeProcess.kill();
      reject(new Error("Duration check timed out"));
    }, 10000);
  });
}
