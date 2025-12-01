/**
 * Dialog Context
 *
 * Manages all dialog states for the burner component.
 * Centralizes disk space checks, conflict detection, and settings dialogs.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useEncodingSettings } from "./EncodingSettingsContext";
import { useQueue, type QueueItem } from "./QueueContext";
import { debugLog } from "@/helpers/debug-logger";

export interface DiskSpaceCheckResult {
  availableFormatted: string;
  requiredFormatted: string;
  driveLetter: string;
  outputPath: string;
  pendingProcess: {
    videoPath: string;
    subtitlePath: string;
    outputPath: string;
  } | null;
}

export interface QueueDiskSpaceIssue {
  videoName: string;
  driveLetter: string;
  availableFormatted: string;
  requiredFormatted: string;
}

export interface QueueConflict {
  itemId: string;
  videoName: string;
  outputPath: string;
}

interface DialogContextType {
  // Settings dialog
  settingsDialogOpen: boolean;
  setSettingsDialogOpen: (open: boolean) => void;

  // Single file disk space dialog
  diskSpaceDialogOpen: boolean;
  diskSpaceCheckResult: DiskSpaceCheckResult | null;
  checkDiskSpaceForSingle: (
    videoPath: string,
    subtitlePath: string,
    outputPath: string
  ) => Promise<boolean>;
  handleDiskSpaceProceed: () => Promise<{
    videoPath: string;
    subtitlePath: string;
    outputPath: string;
  } | null>;
  handleDiskSpaceChangeLocation: () => Promise<string | null>;
  handleDiskSpaceCancel: () => void;

  // Queue disk space dialog
  queueDiskSpaceDialogOpen: boolean;
  queueDiskSpaceIssues: QueueDiskSpaceIssue[];
  checkDiskSpaceForQueue: (pendingItems: QueueItem[]) => Promise<boolean>;
  handleQueueDiskSpaceProceed: () => void;
  handleQueueDiskSpaceCancel: () => void;

  // Queue conflict dialog
  queueConflictDialogOpen: boolean;
  queueConflicts: QueueConflict[];
  checkQueueConflicts: (pendingItems: QueueItem[]) => Promise<QueueConflict[]>;
  handleQueueConflictAutoRename: () => Promise<void>;
  handleQueueConflictOverwrite: () => void;
  handleQueueConflictCancel: () => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

interface DialogProviderProps {
  children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const { settings } = useEncodingSettings();

  // Settings dialog
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Single file disk space dialog
  const [diskSpaceDialogOpen, setDiskSpaceDialogOpen] = useState(false);
  const [diskSpaceCheckResult, setDiskSpaceCheckResult] =
    useState<DiskSpaceCheckResult | null>(null);

  // Queue disk space dialog
  const [queueDiskSpaceDialogOpen, setQueueDiskSpaceDialogOpen] = useState(false);
  const [queueDiskSpaceIssues, setQueueDiskSpaceIssues] = useState<QueueDiskSpaceIssue[]>([]);

  // Queue conflict dialog
  const [queueConflictDialogOpen, setQueueConflictDialogOpen] = useState(false);
  const [queueConflicts, setQueueConflicts] = useState<QueueConflict[]>([]);

  const getCheckSettings = useCallback(() => {
    const bitrate =
      settings.qualityPreset === "custom" ? settings.customBitrate : settings.customBitrate;
    return {
      bitrate,
      qualityMode: settings.qualityMode,
      cqValue: settings.cq,
    };
  }, [settings]);

  // Check disk space for single file - returns true if sufficient or user doesn't need to be prompted
  const checkDiskSpaceForSingle = useCallback(
    async (
      videoPath: string,
      subtitlePath: string,
      outputPath: string
    ): Promise<boolean> => {
      try {
        const diskCheck = await window.ffmpegAPI.checkDiskSpace(
          outputPath,
          videoPath,
          getCheckSettings()
        );

        if (!diskCheck.sufficient) {
          debugLog.warn(
            `Insufficient disk space: ${diskCheck.availableFormatted} available, ${diskCheck.requiredFormatted} required`
          );
          setDiskSpaceCheckResult({
            availableFormatted: diskCheck.availableFormatted,
            requiredFormatted: diskCheck.requiredFormatted,
            driveLetter: diskCheck.driveLetter,
            outputPath,
            pendingProcess: { videoPath, subtitlePath, outputPath },
          });
          setDiskSpaceDialogOpen(true);
          return false;
        }

        return true;
      } catch (error) {
        // If disk space check fails, proceed anyway
        debugLog.warn(`Disk space check failed, proceeding anyway: ${error}`);
        return true;
      }
    },
    [getCheckSettings]
  );

  const handleDiskSpaceProceed = useCallback(async () => {
    setDiskSpaceDialogOpen(false);
    const result = diskSpaceCheckResult?.pendingProcess || null;
    if (result) {
      debugLog.warn(`User proceeding despite low disk space`);
    }
    setDiskSpaceCheckResult(null);
    return result;
  }, [diskSpaceCheckResult]);

  const handleDiskSpaceChangeLocation = useCallback(async () => {
    setDiskSpaceDialogOpen(false);
    if (diskSpaceCheckResult?.outputPath) {
      const result = await window.ffmpegAPI.selectOutputPath(diskSpaceCheckResult.outputPath);
      setDiskSpaceCheckResult(null);
      if (result) {
        debugLog.file(`User changed output to: ${result}`);
        return result;
      }
    }
    setDiskSpaceCheckResult(null);
    return null;
  }, [diskSpaceCheckResult]);

  const handleDiskSpaceCancel = useCallback(() => {
    setDiskSpaceDialogOpen(false);
    setDiskSpaceCheckResult(null);
    debugLog.info(`User cancelled due to low disk space`);
  }, []);

  // Check disk space for queue items - returns true if all pass
  const checkDiskSpaceForQueue = useCallback(
    async (pendingItems: QueueItem[]): Promise<boolean> => {
      const checkSettings = getCheckSettings();
      const issues: QueueDiskSpaceIssue[] = [];

      for (const item of pendingItems) {
        try {
          const diskCheck = await window.ffmpegAPI.checkDiskSpace(
            item.outputPath,
            item.videoPath,
            checkSettings
          );

          if (!diskCheck.sufficient) {
            issues.push({
              videoName: item.videoName,
              driveLetter: diskCheck.driveLetter,
              availableFormatted: diskCheck.availableFormatted,
              requiredFormatted: diskCheck.requiredFormatted,
            });
          }
        } catch (error) {
          debugLog.warn(`Disk space check failed for ${item.videoName}: ${error}`);
        }
      }

      if (issues.length > 0) {
        debugLog.warn(`${issues.length} queue items have insufficient disk space`);
        setQueueDiskSpaceIssues(issues);
        setQueueDiskSpaceDialogOpen(true);
        return false;
      }

      return true;
    },
    [getCheckSettings]
  );

  const handleQueueDiskSpaceProceed = useCallback(() => {
    setQueueDiskSpaceDialogOpen(false);
    setQueueDiskSpaceIssues([]);
    debugLog.warn(`User proceeding with queue despite low disk space warnings`);
  }, []);

  const handleQueueDiskSpaceCancel = useCallback(() => {
    setQueueDiskSpaceDialogOpen(false);
    setQueueDiskSpaceIssues([]);
    debugLog.info(`User cancelled queue start due to low disk space`);
  }, []);

  // Check for output file conflicts
  const checkQueueConflicts = useCallback(
    async (pendingItems: QueueItem[]): Promise<QueueConflict[]> => {
      const conflicts: QueueConflict[] = [];

      for (const item of pendingItems) {
        try {
          const exists = await window.ffmpegAPI.checkOutputExists(item.outputPath);
          if (exists) {
            conflicts.push({
              itemId: item.id,
              videoName: item.videoName,
              outputPath: item.outputPath,
            });
          }
        } catch (error) {
          debugLog.warn(`Output check failed for ${item.videoName}: ${error}`);
        }
      }

      if (conflicts.length > 0) {
        debugLog.warn(`${conflicts.length} queue items have output file conflicts`);
        setQueueConflicts(conflicts);
        setQueueConflictDialogOpen(true);
      }

      return conflicts;
    },
    []
  );

  const handleQueueConflictAutoRename = useCallback(async () => {
    setQueueConflictDialogOpen(false);

    // Rename all conflicting output paths
    for (const conflict of queueConflicts) {
      try {
        const newPath = await window.ffmpegAPI.resolveOutputConflict(conflict.outputPath);
        await window.ffmpegAPI.queueUpdateItemOutput(conflict.itemId, newPath);
        debugLog.file(`Auto-renamed output for ${conflict.videoName}: ${newPath}`);
      } catch (error) {
        debugLog.error(`Failed to auto-rename ${conflict.outputPath}: ${error}`);
      }
    }

    setQueueConflicts([]);
  }, [queueConflicts]);

  const handleQueueConflictOverwrite = useCallback(() => {
    setQueueConflictDialogOpen(false);
    setQueueConflicts([]);
    debugLog.warn("User chose to overwrite all conflicting output files");
  }, []);

  const handleQueueConflictCancel = useCallback(() => {
    setQueueConflictDialogOpen(false);
    setQueueConflicts([]);
    debugLog.info("User cancelled queue start due to output conflicts");
  }, []);

  const value: DialogContextType = {
    settingsDialogOpen,
    setSettingsDialogOpen,
    diskSpaceDialogOpen,
    diskSpaceCheckResult,
    checkDiskSpaceForSingle,
    handleDiskSpaceProceed,
    handleDiskSpaceChangeLocation,
    handleDiskSpaceCancel,
    queueDiskSpaceDialogOpen,
    queueDiskSpaceIssues,
    checkDiskSpaceForQueue,
    handleQueueDiskSpaceProceed,
    handleQueueDiskSpaceCancel,
    queueConflictDialogOpen,
    queueConflicts,
    checkQueueConflicts,
    handleQueueConflictAutoRename,
    handleQueueConflictOverwrite,
    handleQueueConflictCancel,
  };

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function useDialogs(): DialogContextType {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogs must be used within DialogProvider");
  }
  return context;
}
