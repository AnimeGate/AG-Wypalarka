/**
 * QueueEmptyState
 *
 * Full-width drop zone for empty queue state.
 * Shows centered upload area with drag-and-drop support.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/ui/drop-zone";
import { Upload, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QueueEmptyStateProps {
  onDrop: (files: File[]) => void;
  onAddClick: () => void;
  disabled?: boolean;
}

const VIDEO_EXTENSIONS = [".mp4", ".mkv"];
const SUBTITLE_EXTENSIONS = [".ass"];
const ALL_EXTENSIONS = [...VIDEO_EXTENSIONS, ...SUBTITLE_EXTENSIONS];

export function QueueEmptyState({
  onDrop,
  onAddClick,
  disabled = false,
}: QueueEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <DropZone
      onDrop={onDrop}
      accept={ALL_EXTENSIONS}
      multiple
      disabled={disabled}
      className="h-full w-full flex-1"
      activeClassName="[&>div]:border-primary [&>div]:bg-primary/5"
    >
      <Card className="flex h-full flex-col border-2 border-dashed transition-colors">
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          {/* Icon */}
          <div className="bg-muted/50 rounded-full p-6">
            <Upload className="text-muted-foreground h-12 w-12" />
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-lg font-medium">
              {t("queueEmptyTitle", "Przeciągnij pliki tutaj")}
            </p>
            <p className="text-muted-foreground mt-1">
              {t("queueEmptyOr", "lub")}
            </p>
          </div>

          {/* Add button */}
          <Button
            variant="default"
            size="lg"
            onClick={onAddClick}
            disabled={disabled}
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            {t("queueEmptyAddButton", "Dodaj pliki")}
          </Button>

          {/* Hint */}
          <p className="text-muted-foreground text-center text-sm">
            {t("queueEmptyHint", "Wideo (.mp4, .mkv) + napisy (.ass)")}
          </p>
        </CardContent>
      </Card>
    </DropZone>
  );
}
