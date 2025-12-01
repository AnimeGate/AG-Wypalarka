/**
 * CompletedView
 *
 * Success screen shown after encoding completes.
 * Displays summary stats and action buttons.
 */

import { CheckCircle, FolderOpen, RefreshCw, FileVideo } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompletionStatsBar } from "./StatsBar";
import { cn } from "@/utils/tailwind";

interface CompletionStats {
  encodingTime: string;
  outputSize: string;
  compressionRatio?: string;
  avgFps?: number;
}

interface CompletedViewProps {
  outputFileName?: string;
  stats?: CompletionStats;
  onOpenFolder?: () => void;
  onReset?: () => void;
  className?: string;
}

export function CompletedView({
  outputFileName,
  stats,
  onOpenFolder,
  onReset,
  className,
}: CompletedViewProps) {
  const { t } = useTranslation();

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {/* Success Icon */}
        <div className="relative">
          <div className="bg-green-500/20 flex h-24 w-24 items-center justify-center rounded-full">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          {/* Animated ring */}
          <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
        </div>

        {/* Success Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {t("completedTitle", { defaultValue: "Ukończono!" })}
          </h2>
          {outputFileName && (
            <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
              <FileVideo className="h-4 w-4" />
              <span className="max-w-md truncate">{outputFileName}</span>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        {stats && (
          <CompletionStatsBar
            encodingTime={stats.encodingTime}
            outputSize={stats.outputSize}
            compressionRatio={stats.compressionRatio}
            avgFps={stats.avgFps}
            className="w-full max-w-xl"
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onOpenFolder && (
            <Button onClick={onOpenFolder} className="gap-2">
              <FolderOpen className="h-4 w-4" />
              {t("completedOpenFolder", { defaultValue: "Pokaż w folderze" })}
            </Button>
          )}
          {onReset && (
            <Button variant="outline" onClick={onReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("completedEncodeAnother", { defaultValue: "Koduj kolejny" })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
