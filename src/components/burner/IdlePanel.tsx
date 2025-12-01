/**
 * IdlePanel
 *
 * Simplified panel shown when idle/error state.
 * Shows file status checklist and large start button.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clapperboard,
  FolderOpen,
  Play,
  RefreshCw,
  CheckCircle2,
  Circle,
  AlertCircle,
  Film,
  FileText,
  FolderOutput,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/tailwind";

interface FileInfo {
  name: string;
  path: string;
}

interface IdlePanelProps {
  status: "idle" | "error";
  errorMessage?: string;
  videoFile?: FileInfo | null;
  subtitleFile?: FileInfo | null;
  outputPath?: string | null;
  canStart: boolean;
  onStart: () => void;
}

export function IdlePanel({
  status,
  errorMessage,
  videoFile,
  subtitleFile,
  outputPath,
  canStart,
  onStart,
}: IdlePanelProps) {
  const { t } = useTranslation();

  const isReady = videoFile && subtitleFile && outputPath;

  // Extract output file name from path
  const outputFileName = outputPath?.split(/[\\/]/).pop() || null;

  // Render checklist item
  const ChecklistItem = ({
    label,
    value,
    fullPath,
    icon: Icon,
    selected,
  }: {
    label: string;
    value: string | null;
    fullPath?: string;
    icon: React.ElementType;
    selected: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 py-2">
            {selected ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            ) : (
              <Circle className="text-muted-foreground h-5 w-5 shrink-0" />
            )}
            <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground w-28 shrink-0 text-sm">
              {label}
            </span>
            <span
              className={cn(
                "min-w-0 truncate text-sm",
                selected ? "font-medium" : "text-muted-foreground italic"
              )}
            >
              {value || t("idleNotSelected", "Nie wybrano")}
            </span>
          </div>
        </TooltipTrigger>
        {fullPath && (
          <TooltipContent side="bottom" className="max-w-md">
            <p className="break-all font-mono text-xs">{fullPath}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          {status === "error" ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">
                {t("idleErrorTitle", "Błąd procesu")}
              </h2>
            </>
          ) : isReady ? (
            <>
              <Clapperboard className="text-primary h-12 w-12" />
              <h2 className="text-xl font-semibold">
                {t("idleReadyTitle", "Gotowy do startu")}
              </h2>
            </>
          ) : (
            <>
              <FolderOpen className="text-muted-foreground h-12 w-12" />
              <h2 className="text-muted-foreground text-xl font-semibold">
                {t("idleSelectFilesTitle", "Wybierz pliki")}
              </h2>
            </>
          )}
        </div>

        {/* Error Message or Checklist */}
        {status === "error" && errorMessage ? (
          <div className="bg-destructive/10 border-destructive/20 w-full max-w-md rounded-lg border p-4">
            <p className="text-destructive text-center text-sm">{errorMessage}</p>
          </div>
        ) : (
          <div className="bg-muted/30 w-full max-w-lg rounded-lg border px-4 py-2">
            <ChecklistItem
              label={t("idleVideoFile", "Plik wideo")}
              value={videoFile?.name || null}
              fullPath={videoFile?.path}
              icon={Film}
              selected={!!videoFile}
            />
            <div className="border-border border-t" />
            <ChecklistItem
              label={t("idleSubtitleFile", "Plik napisów")}
              value={subtitleFile?.name || null}
              fullPath={subtitleFile?.path}
              icon={FileText}
              selected={!!subtitleFile}
            />
            <div className="border-border border-t" />
            <ChecklistItem
              label={t("idleOutputLocation", "Lokalizacja")}
              value={outputFileName}
              fullPath={outputPath || undefined}
              icon={FolderOutput}
              selected={!!outputPath}
            />
          </div>
        )}

        {/* Action Button */}
        <Button
          size="lg"
          onClick={onStart}
          disabled={!canStart}
          className="gap-2 px-8"
        >
          {status === "error" ? (
            <>
              <RefreshCw className="h-5 w-5" />
              {t("idleRetryButton", "Spróbuj ponownie")}
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {t("idleStartButton", "Rozpocznij wypalanie")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
