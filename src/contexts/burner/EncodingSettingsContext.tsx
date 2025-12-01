/**
 * Encoding Settings Context
 *
 * Provides encoding settings state and GPU availability info
 * to all burner components without prop drilling.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { EncodingSettings } from "@/components/burner/BurnerSettings";
import { useFFmpeg, type FFmpegEncodingParams } from "./FFmpegContext";

// Re-export FFmpegEncodingParams for convenience
export type { FFmpegEncodingParams };

interface EncodingSettingsContextType {
  // Settings state
  settings: EncodingSettings;
  setSettings: (settings: EncodingSettings) => void;

  // GPU info
  gpuAvailable: boolean | undefined;
  gpuInfo: string;

  // Derived helpers
  getBitrate: () => string;
  getSettingsForFFmpeg: () => FFmpegEncodingParams;
}

const EncodingSettingsContext = createContext<EncodingSettingsContextType | null>(null);

const DEFAULT_SETTINGS: EncodingSettings = {
  profile: "1080p",
  qualityPreset: "medium",
  customBitrate: "2400k",
  useHardwareAccel: true,
  codec: "h264",
  preset: "p4",
  qualityMode: "vbr",
  cq: 19,
  spatialAQ: true,
  temporalAQ: true,
  rcLookahead: 20,
};

interface EncodingSettingsProviderProps {
  children: ReactNode;
}

export function EncodingSettingsProvider({ children }: EncodingSettingsProviderProps) {
  const { ffmpegInstalled } = useFFmpeg();
  const [settings, setSettings] = useState<EncodingSettings>(DEFAULT_SETTINGS);
  const [gpuAvailable, setGpuAvailable] = useState<boolean | undefined>(undefined);
  const [gpuInfo, setGpuInfo] = useState<string>("");

  // Check GPU availability when FFmpeg is installed
  useEffect(() => {
    if (ffmpegInstalled) {
      const checkGpu = async () => {
        try {
          const result = await window.ffmpegAPI.checkGpu();
          setGpuAvailable(result.available);
          setGpuInfo(result.info ?? "");
        } catch {
          setGpuAvailable(false);
          setGpuInfo("Error checking GPU");
        }
      };
      checkGpu();
    }
  }, [ffmpegInstalled]);

  // Sync encoding settings changes with queue processor
  useEffect(() => {
    const syncSettings = async () => {
      const ffmpegParams = getSettingsForFFmpeg();

      try {
        await window.ffmpegAPI.queueUpdateSettings(ffmpegParams);
      } catch (error) {
        console.error("Failed to sync settings with queue processor:", error);
      }
    };

    syncSettings();
  }, [settings]);

  const getBitrate = (): string => {
    return settings.qualityPreset === "custom"
      ? settings.customBitrate
      : settings.customBitrate;
  };

  const getSettingsForFFmpeg = (): FFmpegEncodingParams => {
    return {
      bitrate: getBitrate(),
      useHardwareAccel: settings.useHardwareAccel,
      gpuEncode: settings.useHardwareAccel,
      codec: settings.codec,
      preset: settings.preset,
      qualityMode: settings.qualityMode,
      cq: settings.cq,
      spatialAQ: settings.spatialAQ,
      temporalAQ: settings.temporalAQ,
      rcLookahead: settings.rcLookahead,
      scaleWidth: settings.scaleWidth,
      scaleHeight: settings.scaleHeight,
    };
  };

  const value: EncodingSettingsContextType = {
    settings,
    setSettings,
    gpuAvailable,
    gpuInfo,
    getBitrate,
    getSettingsForFFmpeg,
  };

  return (
    <EncodingSettingsContext.Provider value={value}>
      {children}
    </EncodingSettingsContext.Provider>
  );
}

export function useEncodingSettings(): EncodingSettingsContextType {
  const context = useContext(EncodingSettingsContext);
  if (!context) {
    throw new Error("useEncodingSettings must be used within EncodingSettingsProvider");
  }
  return context;
}
