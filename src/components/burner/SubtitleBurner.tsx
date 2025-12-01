/**
 * Subtitle Burner
 *
 * Main component for burning subtitles into video files.
 * Uses contexts for state management to avoid prop drilling.
 */

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BurnerFileInput, type BurnerFileInputHandle, type FileInfo } from "./BurnerFileInput";
import { IdlePanel } from "./IdlePanel";
import { EncodingView } from "./progress";
import { BurnerQueuePanel } from "./BurnerQueuePanel";
import { QueueEmptyState } from "./QueueEmptyState";
import { QueueIdlePanel } from "./QueueIdlePanel";
import { QueueProcessingPanel } from "./QueueProcessingPanel";
import { AddFilesDialog } from "./AddFilesDialog";
import { UnpairedFilesDialog } from "./UnpairedFilesDialog";
import { SettingsModal } from "./settings";
import { FfmpegDownloadDialog } from "./FfmpegDownloadDialog";
import { DiskSpaceBar } from "./DiskSpaceBar";
import { DiskSpaceDialog } from "./DiskSpaceDialog";
import { QueueDiskSpaceDialog } from "./QueueDiskSpaceDialog";
import { QueueConflictDialog } from "./QueueConflictDialog";
import { useTranslation } from "react-i18next";
import { Flame, Download } from "lucide-react";
import { debugLog } from "@/helpers/debug-logger";
import {
  categorizeDroppedFiles,
  autoPairFiles,
  getFileName,
} from "@/lib/drop-helpers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  BurnerProviders,
  useFFmpeg,
  useEncodingSettings,
  useQueue,
  useDialogs,
} from "@/contexts/burner";
import { useProcessWithDiskCheck } from "@/hooks/burner/useProcessWithDiskCheck";
import { useQueueWithChecks } from "@/hooks/burner/useQueueWithChecks";

/**
 * Main export - wraps content with all providers
 */
export default function SubtitleBurner() {
  return (
    <BurnerProviders>
      <SubtitleBurnerContent />
    </BurnerProviders>
  );
}

/**
 * Inner content component that uses all the contexts
 */
function SubtitleBurnerContent() {
  const { t } = useTranslation();

  // Context hooks
  const {
    ffmpegInstalled,
    showDownloadDialog,
    setShowDownloadDialog,
    status,
    logs,
    progress,
    errorMessage,
    completionStats,
    inputFileName,
    outputFileName,
    cancelProcess,
    reset,
    openOutputFolder,
    handleDownloadDialogClose,
  } = useFFmpeg();

  const { settings, setSettings, gpuAvailable, gpuInfo, getBitrate } =
    useEncodingSettings();

  const {
    queue,
    stats: queueStats,
    isProcessing: isQueueProcessing,
    addItems,
    removeItem,
    clearQueue,
    pauseQueue,
    openItemFolder,
    getCurrentItem,
  } = useQueue();

  const {
    settingsDialogOpen,
    setSettingsDialogOpen,
    diskSpaceDialogOpen,
    diskSpaceCheckResult,
    queueDiskSpaceDialogOpen,
    queueDiskSpaceIssues,
    queueConflictDialogOpen,
    queueConflicts,
    handleDiskSpaceCancel,
  } = useDialogs();

  // Custom hooks for process/queue with checks
  const {
    startProcessWithCheck,
    handleDiskSpaceDialogProceed,
    handleDiskSpaceDialogChangeLocation,
  } = useProcessWithDiskCheck();

  const {
    startQueueWithChecks,
    resumeQueueWithChecks,
    handleConflictAutoRename,
    handleConflictOverwrite,
    handleConflictCancel,
    handleQueueDiskSpaceProceed,
    handleQueueDiskSpaceCancel,
  } = useQueueWithChecks();

  // Local UI state
  const [singleFileReady, setSingleFileReady] = useState(false);
  const [currentVideoPath, setCurrentVideoPath] = useState<string | null>(null);
  const [currentOutputPath, setCurrentOutputPath] = useState<string | null>(null);
  const [currentVideoFile, setCurrentVideoFile] = useState<FileInfo | null>(null);
  const [currentSubtitleFile, setCurrentSubtitleFile] = useState<FileInfo | null>(null);
  const fileInputRef = useRef<BurnerFileInputHandle>(null);

  // Queue UI state
  const [addFilesDialogOpen, setAddFilesDialogOpen] = useState(false);
  const [unpairedDialogOpen, setUnpairedDialogOpen] = useState(false);
  const [unpairedVideos, setUnpairedVideos] = useState<string[]>([]);

  // Compute if queue is paused (was started but now idle with pending items)
  const isQueuePaused = queue.some(
    (item) =>
      item.logs.length > 0 ||
      item.status === "completed" ||
      item.status === "error" ||
      item.status === "cancelled"
  ) && queueStats.processing === 0 && queueStats.pending > 0 && !isQueueProcessing;

  // Handlers
  const handleStartProcess = async (
    videoPath: string,
    subtitlePath: string,
    outputPath: string
  ) => {
    await startProcessWithCheck({ videoPath, subtitlePath, outputPath });
  };

  const handleSingleFileStart = () => {
    fileInputRef.current?.startProcess();
  };

  const handleAddFilesToQueue = async (
    files: Array<{
      videoPath: string;
      videoName: string;
      subtitlePath: string;
      subtitleName: string;
      outputPath: string;
    }>
  ) => {
    await addItems(files);
  };

  // Handle drag-drop on empty queue state
  const handleQueueDrop = async (files: File[]) => {
    const { videos, subtitles } = categorizeDroppedFiles(files);

    if (videos.length === 0) {
      debugLog.file("Only subtitle files dropped, ignoring");
      return;
    }

    debugLog.file(
      `Dropped ${videos.length} video(s) and ${subtitles.length} subtitle(s)`
    );

    if (subtitles.length === 0) {
      // Only videos - show unpaired dialog to select subtitle
      debugLog.file("No subtitles dropped, showing unpaired dialog");
      setUnpairedVideos(videos);
      setUnpairedDialogOpen(true);
      return;
    }

    // Try to auto-pair
    const { paired, unpaired } = autoPairFiles(videos, subtitles);

    debugLog.file(
      `Auto-paired ${paired.length} files, ${unpaired.length} unpaired`
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
        })
      );
      await addItems(items);
    }

    // Handle unpaired videos
    if (unpaired.length > 0) {
      debugLog.file(`${unpaired.length} videos unpaired, showing unpaired dialog`);
      setUnpairedVideos(unpaired);
      setUnpairedDialogOpen(true);
    }
  };

  // Handle subtitle selected for unpaired videos
  const handleUnpairedSubtitleSelected = async (subtitlePath: string) => {
    debugLog.file(
      `Applying subtitle ${getFileName(subtitlePath)} to ${unpairedVideos.length} videos`
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
      })
    );

    await addItems(items);
    setUnpairedDialogOpen(false);
    setUnpairedVideos([]);
  };

  // Get encoding settings for disk space estimation
  const diskSpaceEncodingSettings = {
    bitrate: getBitrate(),
    qualityMode: settings.qualityMode,
    cqValue: settings.cq,
  };

  return (
    <div className="flex h-full flex-col">
      {/* Main content area with padding */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold">{t("burnerTitle")}</h1>
              <p className="text-muted-foreground">{t("burnerSubtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SettingsModal
              settings={settings}
              onSettingsChange={setSettings}
              disabled={status === "processing" || !ffmpegInstalled}
              gpuAvailable={gpuAvailable}
              gpuInfo={gpuInfo}
              open={settingsDialogOpen}
              onOpenChange={setSettingsDialogOpen}
            />
          </div>
        </div>

        {/* FFmpeg Not Installed Alert */}
        {ffmpegInstalled === false && (
          <Alert variant="destructive">
            <Download className="h-4 w-4" />
            <AlertTitle>{t("burnerFfmpegRequired")}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{t("burnerFfmpegNotInstalled")}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDownloadDialog(true)}
                className="ml-4"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("burnerFfmpegDownload")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="single" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="w-fit">
            <TabsTrigger
              value="single"
              disabled={status === "processing" || isQueueProcessing}
            >
              {t("burnerSingleMode")}
            </TabsTrigger>
            <TabsTrigger
              value="queue"
              disabled={
                status === "processing" || isQueueProcessing || !ffmpegInstalled
              }
            >
              {t("burnerQueueMode")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4 flex min-h-0 flex-1 gap-6">
            {status === "idle" || status === "error" ? (
              <>
                {/* Left Panel - File Input */}
                <div className="w-96 flex-shrink-0 overflow-y-auto">
                  <BurnerFileInput
                    ref={fileInputRef}
                    onFilesSelected={handleStartProcess}
                    disabled={!ffmpegInstalled}
                    onVideoPathChange={setCurrentVideoPath}
                    onOutputPathChange={setCurrentOutputPath}
                    onReadyChange={setSingleFileReady}
                    onVideoFileChange={setCurrentVideoFile}
                    onSubtitleFileChange={setCurrentSubtitleFile}
                  />
                </div>

                {/* Right Panel - Idle/Error State */}
                <div className="min-w-0 flex-1">
                  <IdlePanel
                    status={status}
                    errorMessage={errorMessage}
                    videoFile={currentVideoFile}
                    subtitleFile={currentSubtitleFile}
                    outputPath={currentOutputPath}
                    canStart={singleFileReady && !!ffmpegInstalled}
                    onStart={handleSingleFileStart}
                  />
                </div>
              </>
            ) : (
              /* Full-width encoding view when processing/completed */
              <EncodingView
                status={status}
                progress={progress}
                logs={logs}
                errorMessage={errorMessage}
                inputFileName={inputFileName ?? undefined}
                outputFileName={outputFileName ?? undefined}
                completionStats={completionStats ?? undefined}
                onCancel={cancelProcess}
                onReset={reset}
                onOpenFolder={openOutputFolder}
                className="flex-1"
              />
            )}
          </TabsContent>

          <TabsContent value="queue" className="mt-4 flex min-h-0 flex-1 gap-6">
            {queue.length === 0 ? (
              /* Empty queue - full-width drop zone */
              <QueueEmptyState
                onDrop={handleQueueDrop}
                onAddClick={() => setAddFilesDialogOpen(true)}
                disabled={!ffmpegInstalled}
              />
            ) : isQueueProcessing ? (
              /* Processing - split layout with queue list and processing panel */
              <>
                <div className="flex w-96 flex-shrink-0 flex-col">
                  <BurnerQueuePanel
                    queue={queue}
                    stats={queueStats}
                    isProcessing={isQueueProcessing}
                    onAddFiles={handleAddFilesToQueue}
                    onRemoveItem={removeItem}
                    onOpenFolder={openItemFolder}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <QueueProcessingPanel
                    currentItem={getCurrentItem()}
                    onPause={pauseQueue}
                  />
                </div>
              </>
            ) : (
              /* Idle with items - split layout with queue list and idle panel */
              <>
                <div className="flex w-96 flex-shrink-0 flex-col">
                  <BurnerQueuePanel
                    queue={queue}
                    stats={queueStats}
                    isProcessing={isQueueProcessing}
                    onAddFiles={handleAddFilesToQueue}
                    onRemoveItem={removeItem}
                    onOpenFolder={openItemFolder}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <QueueIdlePanel
                    stats={queueStats}
                    canStart={queueStats.pending > 0 && !!ffmpegInstalled}
                    isPaused={isQueuePaused}
                    onStart={startQueueWithChecks}
                    onResume={resumeQueueWithChecks}
                    onClear={clearQueue}
                    onAddFiles={() => setAddFilesDialogOpen(true)}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Disk Space Footer Bar */}
      <DiskSpaceBar
        outputPath={currentOutputPath}
        videoPath={currentVideoPath}
        encodingSettings={diskSpaceEncodingSettings}
        queueItems={queue
          .filter((item) => item.status === "pending")
          .map((item) => ({
            videoPath: item.videoPath,
            outputPath: item.outputPath,
          }))}
      />

      {/* FFmpeg Download Dialog */}
      <FfmpegDownloadDialog
        open={showDownloadDialog}
        onClose={handleDownloadDialogClose}
      />

      {/* Disk Space Warning Dialog (Single File) */}
      <DiskSpaceDialog
        open={diskSpaceDialogOpen}
        availableFormatted={diskSpaceCheckResult?.availableFormatted ?? ""}
        requiredFormatted={diskSpaceCheckResult?.requiredFormatted ?? ""}
        driveLetter={diskSpaceCheckResult?.driveLetter ?? ""}
        outputPath={diskSpaceCheckResult?.outputPath ?? ""}
        onProceed={handleDiskSpaceDialogProceed}
        onChangeLocation={handleDiskSpaceDialogChangeLocation}
        onCancel={handleDiskSpaceCancel}
      />

      {/* Queue Disk Space Warning Dialog */}
      <QueueDiskSpaceDialog
        open={queueDiskSpaceDialogOpen}
        issues={queueDiskSpaceIssues}
        onProceed={handleQueueDiskSpaceProceed}
        onCancel={handleQueueDiskSpaceCancel}
      />

      {/* Queue Output Conflict Dialog */}
      <QueueConflictDialog
        open={queueConflictDialogOpen}
        conflicts={queueConflicts}
        onAutoRenameAll={handleConflictAutoRename}
        onOverwriteAll={handleConflictOverwrite}
        onCancel={handleConflictCancel}
      />

      {/* Add Files Dialog (for queue) */}
      <AddFilesDialog
        open={addFilesDialogOpen}
        onOpenChange={setAddFilesDialogOpen}
        onFilesAdded={handleAddFilesToQueue}
      />

      {/* Unpaired Videos Dialog (for queue drop) */}
      <UnpairedFilesDialog
        open={unpairedDialogOpen}
        videos={unpairedVideos}
        onSelectSubtitle={handleUnpairedSubtitleSelected}
        onCancel={() => {
          setUnpairedDialogOpen(false);
          setUnpairedVideos([]);
        }}
      />
    </div>
  );
}
