/**
 * Subtitle Burner
 *
 * Main component for burning subtitles into video files.
 * Uses contexts for state management to avoid prop drilling.
 */

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BurnerFileInput, type BurnerFileInputHandle } from "./BurnerFileInput";
import { BurnerProgressPanel } from "./BurnerProgressPanel";
import { EncodingView } from "./progress";
import { BurnerQueuePanel } from "./BurnerQueuePanel";
import { BurnerQueueProgressPanel } from "./BurnerQueueProgressPanel";
import { SettingsModal } from "./settings";
import { FfmpegDownloadDialog } from "./FfmpegDownloadDialog";
import { DiskSpaceBar } from "./DiskSpaceBar";
import { DiskSpaceDialog } from "./DiskSpaceDialog";
import { QueueDiskSpaceDialog } from "./QueueDiskSpaceDialog";
import { QueueConflictDialog } from "./QueueConflictDialog";
import { useTranslation } from "react-i18next";
import { Flame, Download } from "lucide-react";
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
  const fileInputRef = useRef<BurnerFileInputHandle>(null);

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
                  />
                </div>

                {/* Right Panel - Progress */}
                <div className="min-w-0 flex-1">
                  <BurnerProgressPanel
                    logs={logs}
                    progress={progress}
                    status={status}
                    errorMessage={errorMessage}
                    canStart={singleFileReady && !!ffmpegInstalled}
                    onStart={handleSingleFileStart}
                    onCancel={cancelProcess}
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
            {/* Left Panel - Queue List */}
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

            {/* Right Panel - Progress */}
            <div className="min-w-0 flex-1">
              <BurnerQueueProgressPanel
                currentItem={getCurrentItem()}
                stats={queueStats}
                queue={queue}
                isProcessing={isQueueProcessing}
                onAddFiles={handleAddFilesToQueue}
                onStart={startQueueWithChecks}
                onPause={pauseQueue}
                onResume={resumeQueueWithChecks}
                onClearQueue={clearQueue}
              />
            </div>
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
    </div>
  );
}
