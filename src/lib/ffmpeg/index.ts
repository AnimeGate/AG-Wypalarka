/**
 * FFmpeg Library
 *
 * Core FFmpeg processing functionality for subtitle burning.
 */

// Path utilities
export { escapeSubtitlePath, validatePathForFFmpeg, sanitizeFileName } from "./ffmpeg-path-utils";

// Output parsing
export {
  parseTime,
  extractDuration,
  formatETA,
  categorizeLog,
  parseProgressLine,
  filterLogLines,
  type LogType,
  type ParsedProgress,
} from "./ffmpeg-output-parser";

// Settings
export {
  normalizeSettings,
  buildEncoderArgs,
  getPresetDescription,
  getQualityModeDescription,
  DEFAULT_SETTINGS,
  type FFmpegProgress,
  type EncodingSettings,
  type FFmpegCallbacks,
  type NormalizedSettings,
  type HardwareEncoder,
} from "./ffmpeg-settings";

// Main processor
export { FFmpegProcessor, getVideoDuration } from "./ffmpeg-processor";
