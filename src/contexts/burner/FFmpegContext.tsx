/**
 * FFmpeg Context
 *
 * Manages FFmpeg installation state, process status, logs, and progress.
 * Handles single-file encoding operations.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { debugLog } from "@/helpers/debug-logger";

/**
 * FFmpeg encoding parameters passed to startProcess.
 */
export interface FFmpegEncodingParams {
  bitrate: string;
  useHardwareAccel?: boolean;
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

export type ProcessStatus = "idle" | "processing" | "completed" | "error";
export type LogType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "debug"
  | "metadata";

export interface LogEntry {
  log: string;
  type: LogType;
}

export interface FFmpegProgress {
  frame: number;
  fps: number;
  time: string;
  bitrate: string;
  speed: string;
  percentage: number;
  eta: string | null;
}

interface FFmpegContextType {
  // Installation state
  ffmpegInstalled: boolean | null;
  showDownloadDialog: boolean;
  setShowDownloadDialog: (show: boolean) => void;

  // Process state
  status: ProcessStatus;
  logs: LogEntry[];
  progress: FFmpegProgress | null;
  errorMessage: string | undefined;
  completedOutputPath: string | null;

  // Actions
  startProcess: (
    videoPath: string,
    subtitlePath: string,
    outputPath: string,
    settings: FFmpegEncodingParams,
  ) => Promise<void>;
  cancelProcess: () => Promise<void>;
  reset: () => void;
  openOutputFolder: () => Promise<void>;
  handleDownloadDialogClose: () => Promise<void>;
  recheckInstallation: () => Promise<void>;
}

const FFmpegContext = createContext<FFmpegContextType | null>(null);

interface FFmpegProviderProps {
  children: ReactNode;
}

export function FFmpegProvider({ children }: FFmpegProviderProps) {
  // Installation state
  const [ffmpegInstalled, setFfmpegInstalled] = useState<boolean | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  // Process state
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<FFmpegProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [completedOutputPath, setCompletedOutputPath] = useState<string | null>(
    null,
  );

  // Check FFmpeg installation on mount
  useEffect(() => {
    const checkFfmpeg = async () => {
      try {
        const result = await window.ffmpegAPI.checkInstalled();
        setFfmpegInstalled(result.installed);
        if (!result.installed) {
          setShowDownloadDialog(true);
        }
      } catch {
        setFfmpegInstalled(false);
        setShowDownloadDialog(true);
      }
    };
    checkFfmpeg();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const unsubProgress = window.ffmpegAPI.onProgress((prog) => {
      setProgress(prog as FFmpegProgress);
    });

    const unsubLog = window.ffmpegAPI.onLog((data) => {
      setLogs((prev) => [
        ...prev,
        { log: data.log, type: data.type as LogType },
      ]);
    });

    const unsubComplete = window.ffmpegAPI.onComplete((outputPath) => {
      setStatus("completed");
      setCompletedOutputPath(outputPath);
      setLogs((prev) => [
        ...prev,
        { log: `✓ Process completed successfully!`, type: "success" },
        { log: `Output: ${outputPath}`, type: "info" },
      ]);
    });

    const unsubError = window.ffmpegAPI.onError((error) => {
      setStatus("error");
      setErrorMessage(error);
      setLogs((prev) => [...prev, { log: `✗ Error: ${error}`, type: "error" }]);
    });

    return () => {
      unsubProgress();
      unsubLog();
      unsubComplete();
      unsubError();
    };
  }, []);

  const startProcess = useCallback(
    async (
      videoPath: string,
      subtitlePath: string,
      outputPath: string,
      settings: FFmpegEncodingParams,
    ) => {
      try {
        setStatus("processing");
        setLogs([]);
        setProgress(null);
        setErrorMessage(undefined);

        await window.ffmpegAPI.startProcess({
          videoPath,
          subtitlePath,
          outputPath,
          settings,
        });
      } catch (error) {
        setStatus("error");
        const errorMsg = error instanceof Error ? error.message : String(error);
        setErrorMessage(errorMsg);
        debugLog.error("Failed to start process:", errorMsg);
        setLogs((prev) => [
          ...prev,
          { log: `✗ Failed to start process: ${errorMsg}`, type: "error" },
        ]);
      }
    },
    [],
  );

  const cancelProcess = useCallback(async () => {
    try {
      await window.ffmpegAPI.cancelProcess();
      setStatus("idle");
      setLogs((prev) => [
        ...prev,
        { log: "Process cancelled by user", type: "warning" },
      ]);
    } catch (error) {
      debugLog.error("Failed to cancel process:", error);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setLogs([]);
    setProgress(null);
    setErrorMessage(undefined);
    setCompletedOutputPath(null);
  }, []);

  const openOutputFolder = useCallback(async () => {
    if (completedOutputPath) {
      try {
        await window.ffmpegAPI.openOutputFolder(completedOutputPath);
      } catch (error) {
        debugLog.error("Failed to open output folder:", error);
      }
    }
  }, [completedOutputPath]);

  const handleDownloadDialogClose = useCallback(async () => {
    setShowDownloadDialog(false);
    // Re-check FFmpeg installation after dialog closes
    try {
      const result = await window.ffmpegAPI.checkInstalled();
      setFfmpegInstalled(result.installed);
    } catch {
      setFfmpegInstalled(false);
    }
  }, []);

  const recheckInstallation = useCallback(async () => {
    try {
      const result = await window.ffmpegAPI.checkInstalled();
      setFfmpegInstalled(result.installed);
    } catch {
      setFfmpegInstalled(false);
    }
  }, []);

  const value: FFmpegContextType = {
    ffmpegInstalled,
    showDownloadDialog,
    setShowDownloadDialog,
    status,
    logs,
    progress,
    errorMessage,
    completedOutputPath,
    startProcess,
    cancelProcess,
    reset,
    openOutputFolder,
    handleDownloadDialogClose,
    recheckInstallation,
  };

  return (
    <FFmpegContext.Provider value={value}>{children}</FFmpegContext.Provider>
  );
}

export function useFFmpeg(): FFmpegContextType {
  const context = useContext(FFmpegContext);
  if (!context) {
    throw new Error("useFFmpeg must be used within FFmpegProvider");
  }
  return context;
}
