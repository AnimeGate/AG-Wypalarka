/**
 * QueueProcessingPanel
 *
 * Processing view for queue mode with progress ring, stats, and logs.
 * Reuses components from single file mode.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProgressRing, StatsBar, CollapsibleLogs } from "./progress";

interface QueueProcessingPanelProps {
  currentItem: QueueItem | null;
  onPause: () => void;
}

export function QueueProcessingPanel({
  currentItem,
  onPause,
}: QueueProcessingPanelProps) {
  const { t } = useTranslation();

  // Get progress values with fallbacks
  const progress = currentItem?.progress;
  const percentage = progress?.percentage ?? 0;
  const eta = progress?.eta ?? null;
  const fps = progress?.fps ?? 0;
  const speed = progress?.speed ?? "—";
  const bitrate = progress?.bitrate ?? "—";
  const time = progress?.time ?? "00:00:00";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {/* Sticky Header with Pause Button */}
      <div className="bg-card/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="text-primary h-5 w-5 animate-spin" />
          <div>
            <h3 className="font-semibold">
              {t("queueProcessingTitle", "Przetwarzanie")}
            </h3>
            {currentItem && (
              <p className="text-muted-foreground max-w-xs truncate text-sm" title={currentItem.videoName}>
                {currentItem.videoName}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={onPause} className="gap-2">
          <Pause className="h-4 w-4" />
          {t("queueProcessingPauseButton", "Wstrzymaj")}
        </Button>
      </div>

      {/* Scrollable Content */}
      <CardContent className="flex min-h-0 flex-1 flex-col items-center gap-6 overflow-y-auto p-6">
        {/* Progress Ring */}
        <ProgressRing
          percentage={percentage}
          eta={eta}
          size={180}
          strokeWidth={8}
        />

        {/* Stats Bar */}
        <StatsBar
          fps={fps}
          speed={speed}
          bitrate={bitrate}
          time={time}
          className="w-full max-w-lg"
        />

        {/* FFmpeg Logs - expanded to fill remaining space */}
        {currentItem && (
          <CollapsibleLogs
            logs={currentItem.logs}
            defaultOpen={true}
            className="w-full flex-1"
          />
        )}
      </CardContent>
    </Card>
  );
}
