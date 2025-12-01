/**
 * Process With Disk Check Hook
 *
 * Wraps the FFmpeg process start with disk space validation.
 * Shows warning dialog if space is insufficient.
 */

import { useCallback } from "react";
import { useFFmpeg, useEncodingSettings, useDialogs } from "@/contexts/burner";

interface ProcessParams {
  videoPath: string;
  subtitlePath: string;
  outputPath: string;
}

interface UseProcessWithDiskCheckReturn {
  startProcessWithCheck: (params: ProcessParams) => Promise<void>;
  handleDiskSpaceDialogProceed: () => Promise<void>;
  handleDiskSpaceDialogChangeLocation: () => Promise<void>;
  handleDiskSpaceDialogCancel: () => void;
}

export function useProcessWithDiskCheck(): UseProcessWithDiskCheckReturn {
  const { startProcess } = useFFmpeg();
  const { getSettingsForFFmpeg } = useEncodingSettings();
  const {
    checkDiskSpaceForSingle,
    handleDiskSpaceProceed,
    handleDiskSpaceChangeLocation,
    handleDiskSpaceCancel,
  } = useDialogs();

  const startProcessWithCheck = useCallback(
    async (params: ProcessParams) => {
      const { videoPath, subtitlePath, outputPath } = params;

      // Check disk space - returns true if sufficient or check failed
      const spaceOk = await checkDiskSpaceForSingle(videoPath, subtitlePath, outputPath);

      if (spaceOk) {
        // Space is sufficient, start processing
        const settings = getSettingsForFFmpeg();
        await startProcess(videoPath, subtitlePath, outputPath, settings);
      }
      // If not OK, the dialog is shown and user will handle via dialog callbacks
    },
    [checkDiskSpaceForSingle, startProcess, getSettingsForFFmpeg]
  );

  const handleDiskSpaceDialogProceed = useCallback(async () => {
    const pendingProcess = await handleDiskSpaceProceed();
    if (pendingProcess) {
      const settings = getSettingsForFFmpeg();
      await startProcess(
        pendingProcess.videoPath,
        pendingProcess.subtitlePath,
        pendingProcess.outputPath,
        settings
      );
    }
  }, [handleDiskSpaceProceed, startProcess, getSettingsForFFmpeg]);

  const handleDiskSpaceDialogChangeLocation = useCallback(async () => {
    const newPath = await handleDiskSpaceChangeLocation();
    // User needs to re-select files with new output path
    // This is handled at the component level
    if (newPath) {
      // Return control to component to re-trigger with new path
    }
  }, [handleDiskSpaceChangeLocation]);

  const handleDiskSpaceDialogCancel = useCallback(() => {
    handleDiskSpaceCancel();
  }, [handleDiskSpaceCancel]);

  return {
    startProcessWithCheck,
    handleDiskSpaceDialogProceed,
    handleDiskSpaceDialogChangeLocation,
    handleDiskSpaceDialogCancel,
  };
}
