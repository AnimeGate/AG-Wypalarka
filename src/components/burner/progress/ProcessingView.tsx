/**
 * ProcessingView
 *
 * Full-width progress view shown during encoding.
 * Combines progress ring, stats bar, file info, and collapsible logs.
 */

import { FileVideo, ArrowRight, StopCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProgressRing } from "./ProgressRing";
import { StatsBar } from "./StatsBar";
import { CollapsibleLogs } from "./CollapsibleLogs";
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

interface ProcessingViewProps {
  progress: FFmpegProgress | null;
  logs: LogEntry[];
  inputFileName?: string;
  outputFileName?: string;
  onCancel?: () => void;
  className?: string;
}

export function ProcessingView({
  progress,
  logs,
  inputFileName,
  outputFileName,
  onCancel,
  className,
}: ProcessingViewProps) {
  const { t } = useTranslation();

  return (
    <Card className={cn("flex h-full min-w-0 flex-col overflow-hidden", className)}>
      <CardContent className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden p-6">
        {/* Header with Cancel Button */}
        <div className="flex w-full items-center justify-end">
          {onCancel && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={onCancel}>
                    <StopCircle className="mr-2 h-4 w-4" />
                    {t("progressCancel", { defaultValue: "Anuluj" })}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("burnerCancel", { defaultValue: "Anuluj proces" })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Progress Ring - Centered */}
        <div className="flex flex-col items-center gap-4">
          <ProgressRing
            percentage={progress?.percentage ?? 0}
            eta={progress?.eta}
            size={200}
          />
        </div>

        {/* Stats Bar */}
        {progress && (
          <StatsBar
            fps={progress.fps}
            speed={progress.speed}
            bitrate={progress.bitrate}
            time={progress.time}
            className="w-full max-w-xl"
          />
        )}

        {/* File Info */}
        {(inputFileName || outputFileName) && (
          <div className="bg-muted/30 flex max-w-full items-center gap-2 rounded-lg px-4 py-2">
            <FileVideo className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground min-w-0 max-w-48 truncate text-sm">
              {inputFileName}
            </span>
            <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="min-w-0 max-w-48 truncate text-sm font-medium">
              {outputFileName}
            </span>
          </div>
        )}

        {/* Collapsible Logs */}
        <div className="w-full min-w-0 max-w-2xl">
          <CollapsibleLogs logs={logs} defaultOpen={false} />
        </div>
      </CardContent>
    </Card>
  );
}
