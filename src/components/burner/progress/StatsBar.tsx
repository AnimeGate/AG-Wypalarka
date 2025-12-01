/**
 * StatsBar
 *
 * Horizontal stats cards showing encoding metrics.
 */

import { Film, Zap, BarChart3, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/tailwind";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-muted/50 flex flex-1 flex-col items-center gap-1 rounded-lg p-3 transition-colors hover:bg-muted",
        className
      )}
    >
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}

interface StatsBarProps {
  fps: number;
  speed: string;
  bitrate: string;
  time: string;
  className?: string;
}

export function StatsBar({ fps, speed, bitrate, time, className }: StatsBarProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex gap-3", className)}>
      <StatCard
        icon={<Film className="h-3.5 w-3.5" />}
        label={t("statFps", { defaultValue: "FPS" })}
        value={fps.toFixed(1)}
      />
      <StatCard
        icon={<Zap className="h-3.5 w-3.5" />}
        label={t("statSpeed", { defaultValue: "Prędkość" })}
        value={speed}
      />
      <StatCard
        icon={<BarChart3 className="h-3.5 w-3.5" />}
        label={t("statBitrate", { defaultValue: "Bitrate" })}
        value={bitrate}
      />
      <StatCard
        icon={<Clock className="h-3.5 w-3.5" />}
        label={t("statTime", { defaultValue: "Czas" })}
        value={time}
      />
    </div>
  );
}

// Completion stats variant
interface CompletionStatsBarProps {
  encodingTime: string;
  outputSize?: string;
  compressionRatio?: string;
  avgFps?: number;
  className?: string;
}

export function CompletionStatsBar({
  encodingTime,
  outputSize,
  compressionRatio,
  avgFps,
  className,
}: CompletionStatsBarProps) {
  const { t } = useTranslation();

  // Only show output size if it has an actual value (not placeholder)
  const showOutputSize = outputSize && outputSize !== "—" && outputSize !== "-";

  return (
    <div className={cn("flex gap-3", className)}>
      <StatCard
        icon={<Clock className="h-3.5 w-3.5" />}
        label={t("statDuration", { defaultValue: "Czas kodowania" })}
        value={encodingTime}
      />
      {showOutputSize && (
        <StatCard
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          label={t("statOutputSize", { defaultValue: "Rozmiar" })}
          value={outputSize}
        />
      )}
      {compressionRatio && (
        <StatCard
          icon={<Zap className="h-3.5 w-3.5" />}
          label={t("statCompression", { defaultValue: "Kompresja" })}
          value={compressionRatio}
        />
      )}
      {avgFps !== undefined && (
        <StatCard
          icon={<Film className="h-3.5 w-3.5" />}
          label={t("statAvgFps", { defaultValue: "Śr. FPS" })}
          value={avgFps.toFixed(0)}
        />
      )}
    </div>
  );
}
