/**
 * BurnerQueuePanel
 *
 * Left panel showing the queue list with drag-drop support.
 * Only rendered when queue has items (empty state is handled by QueueEmptyState).
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DropZone } from "@/components/ui/drop-zone";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListOrdered } from "lucide-react";
import { useTranslation } from "react-i18next";
import { debugLog } from "@/helpers/debug-logger";
import {
  categorizeDroppedFiles,
  autoPairFiles,
  getFileName,
} from "@/lib/drop-helpers";
import { BurnerQueueItem } from "./BurnerQueueItem";
import { UnpairedFilesDialog } from "./UnpairedFilesDialog";

interface BurnerQueuePanelProps {
  queue: QueueItem[];
  stats: QueueStats;
  isProcessing: boolean;
  onAddFiles: (
    files: Array<Omit<QueueItem, "id" | "status" | "progress" | "logs">>,
  ) => void;
  onRemoveItem: (id: string) => void;
  onOpenFolder?: (outputPath: string) => void;
}

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov", ".webm", ".m4v", ".wmv", ".flv"];
const SUBTITLE_EXTENSIONS = [".ass", ".srt", ".ssa", ".sub", ".vtt"];
const ALL_EXTENSIONS = [...VIDEO_EXTENSIONS, ...SUBTITLE_EXTENSIONS];

export function BurnerQueuePanel({
  queue,
  stats,
  isProcessing,
  onAddFiles,
  onRemoveItem,
  onOpenFolder,
}: BurnerQueuePanelProps) {
  const { t } = useTranslation();
  const [unpairedDialogOpen, setUnpairedDialogOpen] = useState(false);
  const [unpairedVideos, setUnpairedVideos] = useState<string[]>([]);

  const handleQueueDrop = async (files: File[]) => {
    const { videos, subtitles } = categorizeDroppedFiles(files);

    if (videos.length === 0) {
      debugLog.file("Only subtitle files dropped, ignoring");
      return;
    }

    debugLog.file(
      `Dropped ${videos.length} video(s) and ${subtitles.length} subtitle(s)`,
    );

    if (subtitles.length === 0) {
      // Only videos - prompt user to select subtitle
      debugLog.file("No subtitles dropped, showing unpaired dialog");
      setUnpairedVideos(videos);
      setUnpairedDialogOpen(true);
      return;
    }

    // Try to auto-pair
    const { paired, unpaired } = autoPairFiles(videos, subtitles);

    debugLog.file(
      `Auto-paired ${paired.length} files, ${unpaired.length} unpaired`,
    );

    // Add paired items to queue
    if (paired.length > 0) {
      const items = await Promise.all(
        paired.map(async ({ video, subtitle }) => {
          let outputPath: string;
          try {
            outputPath = await window.ffmpegAPI.getDefaultOutputPath(video);
          } catch {
            const baseName = getFileName(video).replace(/\.[^.]+$/, "");
            outputPath = `${baseName}_with_subs.mp4`;
          }
          return {
            videoPath: video,
            videoName: getFileName(video),
            subtitlePath: subtitle,
            subtitleName: getFileName(subtitle),
            outputPath,
          };
        }),
      );
      onAddFiles(items);
    }

    // Handle unpaired videos
    if (unpaired.length > 0) {
      setUnpairedVideos(unpaired);
      setUnpairedDialogOpen(true);
    }
  };

  const handleUnpairedSubtitleSelected = async (subtitlePath: string) => {
    debugLog.file(
      `Applying subtitle ${getFileName(subtitlePath)} to ${unpairedVideos.length} videos`,
    );

    const items = await Promise.all(
      unpairedVideos.map(async (video) => {
        let outputPath: string;
        try {
          outputPath = await window.ffmpegAPI.getDefaultOutputPath(video);
        } catch {
          const baseName = getFileName(video).replace(/\.[^.]+$/, "");
          outputPath = `${baseName}_with_subs.mp4`;
        }
        return {
          videoPath: video,
          videoName: getFileName(video),
          subtitlePath,
          subtitleName: getFileName(subtitlePath),
          outputPath,
        };
      }),
    );

    onAddFiles(items);
    setUnpairedDialogOpen(false);
    setUnpairedVideos([]);
  };

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            <CardTitle>{t("burnerQueueTitle")}</CardTitle>
          </div>
          <CardDescription>{t("burnerQueueDesc")}</CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {t("burnerQueueTotal")}:{" "}
              <span className="text-foreground font-medium">{stats.total}</span>
            </span>
            <span className="text-muted-foreground">
              {t("burnerQueueCompleted")}:{" "}
              <span className="font-medium text-green-600">{stats.completed}</span>
            </span>
            {stats.error > 0 && (
              <span className="text-muted-foreground">
                {t("burnerQueueFailed")}:{" "}
                <span className="text-destructive font-medium">{stats.error}</span>
              </span>
            )}
          </div>

          {/* Queue List with Drop Zone */}
          <DropZone
            onDrop={handleQueueDrop}
            accept={ALL_EXTENSIONS}
            multiple
            disabled={isProcessing}
            className="min-h-0 flex-1 rounded-lg border-2 border-dashed border-transparent transition-colors"
            activeClassName="border-primary bg-primary/5"
          >
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {queue.map((item) => (
                  <BurnerQueueItem
                    key={item.id}
                    item={item}
                    onRemove={onRemoveItem}
                    onOpenFolder={onOpenFolder}
                  />
                ))}
              </div>
            </ScrollArea>
          </DropZone>
        </CardContent>
      </Card>

      {/* Unpaired Videos Dialog */}
      <UnpairedFilesDialog
        open={unpairedDialogOpen}
        videos={unpairedVideos}
        onSelectSubtitle={handleUnpairedSubtitleSelected}
        onCancel={() => {
          setUnpairedDialogOpen(false);
          setUnpairedVideos([]);
        }}
      />
    </>
  );
}
