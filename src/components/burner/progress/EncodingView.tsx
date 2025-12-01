/**
 * EncodingView
 *
 * Main view switcher for encoding states.
 * Renders different views based on status: processing, completed, or error.
 */

import { XCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessingView } from "./ProcessingView";
import { CompletedView } from "./CompletedView";
import { cn } from "@/utils/tailwind";

type LogType = "info" | "success" | "warning" | "error" | "debug" | "metadata";

interface LogEntry {
  log: string;
  type: LogType;
}

interface FFmpegProgress {
  frame: number;
  fps: number;
  time: string;
  bitrate: string;
  speed: string;
  percentage: number;
  eta: string | null;
}

interface CompletionStats {
  encodingTime: string;
  outputSize: string;
  compressionRatio?: string;
  avgFps?: number;
}

type EncodingStatus = "idle" | "processing" | "completed" | "error";

interface EncodingViewProps {
  status: EncodingStatus;
  progress: FFmpegProgress | null;
  logs: LogEntry[];
  errorMessage?: string;
  inputFileName?: string;
  outputFileName?: string;
  completionStats?: CompletionStats;
  onCancel?: () => void;
  onReset?: () => void;
  onOpenFolder?: () => void;
  className?: string;
}

export function EncodingView({
  status,
  progress,
  logs,
  errorMessage,
  inputFileName,
  outputFileName,
  completionStats,
  onCancel,
  onReset,
  onOpenFolder,
  className,
}: EncodingViewProps) {
  const { t } = useTranslation();

  // Processing view
  if (status === "processing") {
    return (
      <ProcessingView
        progress={progress}
        logs={logs}
        inputFileName={inputFileName}
        outputFileName={outputFileName}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  // Completed view
  if (status === "completed") {
    return (
      <CompletedView
        outputFileName={outputFileName}
        stats={completionStats}
        onOpenFolder={onOpenFolder}
        onReset={onReset}
        className={className}
      />
    );
  }

  // Error view
  if (status === "error") {
    return (
      <Card className={cn("flex h-full flex-col", className)}>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          {/* Error Icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>

          {/* Error Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">
              {t("errorTitle", { defaultValue: "Błąd kodowania" })}
            </h2>
            {errorMessage && (
              <p className="text-muted-foreground mt-2 max-w-md">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Retry Button */}
          {onReset && (
            <Button variant="outline" onClick={onReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("errorRetry", { defaultValue: "Spróbuj ponownie" })}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Idle state - should not be rendered via EncodingView
  return null;
}
