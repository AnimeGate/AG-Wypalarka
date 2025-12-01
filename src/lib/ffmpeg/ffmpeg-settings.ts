/**
 * FFmpeg Encoding Settings
 *
 * Types and utilities for managing FFmpeg encoding configuration,
 * including quality presets, hardware acceleration, and codec settings.
 */

/**
 * Progress information during encoding.
 */
export interface FFmpegProgress {
  frame: number;
  fps: number;
  time: string;
  bitrate: string;
  speed: string;
  percentage: number;
  eta: string | null;
}

/**
 * User-configurable encoding settings.
 */
export interface EncodingSettings {
  // Basic settings
  bitrate: string;
  useHardwareAccel?: boolean;

  // Extended settings
  gpuEncode?: boolean;
  codec?: "h264";
  preset?: "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7";
  qualityMode?: "cq" | "vbr" | "vbr_hq" | "cbr";
  cq?: number;
  spatialAQ?: boolean;
  temporalAQ?: boolean;
  rcLookahead?: number;
  scaleWidth?: number;
  scaleHeight?: number;
}

/**
 * Callbacks for FFmpeg process events.
 */
export interface FFmpegCallbacks {
  onProgress: (progress: FFmpegProgress) => void;
  onLog: (log: string, type: "info" | "success" | "warning" | "error" | "debug" | "metadata") => void;
  onComplete: (outputPath: string) => void;
  onError: (error: string) => void;
}

/**
 * Hardware encoder type.
 */
export type HardwareEncoder = "nvenc" | "qsv" | "amf" | "auto";

/**
 * Normalized encoding settings with all defaults applied.
 */
export interface NormalizedSettings extends EncodingSettings {
  gpuEncode: boolean;
  codec: "h264";
  hwEncoder: HardwareEncoder;
  preset: "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7";
  qualityMode: "cq" | "vbr" | "vbr_hq" | "cbr";
  cq: number;
  spatialAQ: boolean;
  temporalAQ: boolean;
  rcLookahead: number;
  bitrate: string;
}

/**
 * Default encoding settings.
 */
export const DEFAULT_SETTINGS: Partial<NormalizedSettings> = {
  gpuEncode: false,
  codec: "h264",
  hwEncoder: "auto",
  preset: "p4",
  qualityMode: "vbr_hq",
  cq: 19,
  spatialAQ: true,
  temporalAQ: true,
  rcLookahead: 20,
  bitrate: "2400k",
};

/**
 * Normalizes encoding settings by applying defaults.
 *
 * @param input - User-provided encoding settings
 * @returns Normalized settings with all defaults applied
 */
export function normalizeSettings(input: EncodingSettings): NormalizedSettings {
  const gpuEncode = input.gpuEncode ?? input.useHardwareAccel ?? false;
  const codec = input.codec ?? "h264";

  // Determine hardware encoder
  // Prefer NVENC by default; FFmpeg will error if unavailable
  let hwEncoder: HardwareEncoder = "auto";
  if (gpuEncode) {
    hwEncoder = "nvenc";
  }

  return {
    ...input,
    gpuEncode,
    codec,
    hwEncoder,
    preset: input.preset ?? "p4",
    qualityMode: input.qualityMode ?? "vbr_hq",
    cq: input.cq ?? 19,
    spatialAQ: input.spatialAQ ?? true,
    temporalAQ: input.temporalAQ ?? true,
    rcLookahead: input.rcLookahead ?? 20,
    bitrate: input.bitrate,
  };
}

/**
 * Builds FFmpeg encoder arguments based on settings.
 *
 * @param settings - Normalized encoding settings
 * @returns Array of FFmpeg arguments for video encoding
 */
export function buildEncoderArgs(settings: NormalizedSettings): string[] {
  const args: string[] = [];

  if (settings.gpuEncode) {
    // Hardware encoder choice (always H.264)
    const encoder =
      settings.hwEncoder === "qsv"
        ? "h264_qsv"
        : settings.hwEncoder === "amf"
          ? "h264_amf"
          : "h264_nvenc";
    args.push("-c:v", encoder);

    // Rate control
    const rc = settings.qualityMode;
    if (rc) args.push("-rc:v", rc);
    if ((rc === "cq" || rc === "vbr_hq") && settings.cq !== undefined) {
      args.push("-cq:v", String(settings.cq));
    }
    if (settings.preset) args.push("-preset", settings.preset);
    args.push("-tune", "hq");
    if (settings.spatialAQ) args.push("-spatial_aq", "1");
    if (settings.temporalAQ) args.push("-temporal_aq", "1");
    if (typeof settings.rcLookahead === "number") {
      args.push("-rc-lookahead", String(settings.rcLookahead));
    }
    // For CQ-based VBR, allow unconstrained bitrate
    if (rc === "vbr_hq" || rc === "cq") {
      args.push("-b:v", "0");
    } else {
      args.push("-b:v", settings.bitrate);
    }
  } else {
    // Software encoding (always H.264)
    args.push("-c:v", "libx264");
    args.push("-b:v", settings.bitrate);
    args.push("-preset", "veryfast");
    args.push("-tune", "animation");
  }

  return args;
}

/**
 * Gets preset description for display.
 *
 * @param preset - Preset value
 * @returns Human-readable preset description
 */
export function getPresetDescription(preset: NormalizedSettings["preset"]): string {
  const descriptions: Record<NormalizedSettings["preset"], string> = {
    p1: "Fastest (lowest quality)",
    p2: "Very fast",
    p3: "Fast",
    p4: "Balanced",
    p5: "Slow",
    p6: "Slower",
    p7: "Slowest (highest quality)",
  };
  return descriptions[preset];
}

/**
 * Gets quality mode description for display.
 *
 * @param mode - Quality mode value
 * @returns Human-readable quality mode description
 */
export function getQualityModeDescription(mode: NormalizedSettings["qualityMode"]): string {
  const descriptions: Record<NormalizedSettings["qualityMode"], string> = {
    cq: "Constant Quality - Best for consistent visual quality",
    vbr: "Variable Bitrate - Good balance of quality and size",
    vbr_hq: "VBR High Quality - Best quality/size ratio (recommended)",
    cbr: "Constant Bitrate - For streaming or strict size requirements",
  };
  return descriptions[mode];
}
