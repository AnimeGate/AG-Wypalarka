/**
 * QueueIdlePanel
 *
 * Stats-focused right panel for idle state (queue has items, not processing).
 * Shows queue summary stats and large Start/Resume button.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ListChecks,
  Pause,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/tailwind";

interface QueueIdlePanelProps {
  stats: QueueStats;
  canStart: boolean;
  isPaused: boolean;
  onStart: () => void;
  onResume: () => void;
  onClear: () => void;
  onAddFiles: () => void;
}

// Stat item component
function StatItem({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="text-muted-foreground h-4 w-4" />
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      <span className={cn("text-lg font-semibold tabular-nums", valueColor)}>
        {value}
      </span>
    </div>
  );
}

export function QueueIdlePanel({
  stats,
  canStart,
  isPaused,
  onStart,
  onResume,
  onClear,
  onAddFiles,
}: QueueIdlePanelProps) {
  const { t } = useTranslation();

  const hasItems = stats.total > 0;
  const hasPendingItems = stats.pending > 0;
  const hasCompletedOrErrors = stats.completed > 0 || stats.error > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          {isPaused ? (
            <>
              <Pause className="h-12 w-12 text-yellow-500" />
              <h2 className="text-xl font-semibold">
                {t("queueIdlePausedTitle", "Wstrzymano")}
              </h2>
            </>
          ) : (
            <>
              <ListChecks className="text-primary h-12 w-12" />
              <h2 className="text-xl font-semibold">
                {t("queueIdleReadyTitle", "Gotowy do przetwarzania")}
              </h2>
            </>
          )}
        </div>

        {/* Stats Box */}
        <div className="bg-muted/30 w-full max-w-sm rounded-lg border px-4 py-2">
          <StatItem
            icon={Clock}
            label={t("queueIdlePending", "Oczekuje")}
            value={stats.pending}
            valueColor={stats.pending > 0 ? "text-blue-500" : undefined}
          />
          <div className="border-border border-t" />
          <StatItem
            icon={CheckCircle2}
            label={t("queueIdleCompleted", "Ukończone")}
            value={stats.completed}
            valueColor={stats.completed > 0 ? "text-green-500" : undefined}
          />
          {stats.error > 0 && (
            <>
              <div className="border-border border-t" />
              <StatItem
                icon={XCircle}
                label={t("queueIdleErrors", "Błędy")}
                value={stats.error}
                valueColor="text-red-500"
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3">
          {/* Primary Action - Start or Resume */}
          {isPaused ? (
            <Button
              size="lg"
              onClick={onResume}
              disabled={!hasPendingItems}
              className="gap-2 px-8"
            >
              <Play className="h-5 w-5" />
              {t("queueIdleResumeButton", "Wznów kolejkę")}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onStart}
              disabled={!canStart}
              className="gap-2 px-8"
            >
              <Play className="h-5 w-5" />
              {t("queueIdleStartButton", "Rozpocznij kolejkę")}
            </Button>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onAddFiles}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("queueIdleAddMoreButton", "Dodaj więcej")}
            </Button>

            {hasItems && (
              <Button
                variant="outline"
                onClick={onClear}
                disabled={!hasItems || hasCompletedOrErrors && !hasPendingItems}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("queueIdleClearButton", "Wyczyść")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
