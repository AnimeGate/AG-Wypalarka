/**
 * Queue With Checks Hook
 *
 * Wraps queue start/resume with conflict detection and disk space validation.
 * Shows appropriate dialogs when issues are found.
 */

import { useCallback } from "react";
import { useQueue, useDialogs, type QueueItem } from "@/contexts/burner";
import { debugLog } from "@/helpers/debug-logger";

interface UseQueueWithChecksReturn {
  // Start queue with all checks
  startQueueWithChecks: () => Promise<void>;
  resumeQueueWithChecks: () => Promise<void>;

  // Conflict dialog handlers
  handleConflictAutoRename: () => Promise<void>;
  handleConflictOverwrite: () => Promise<void>;
  handleConflictCancel: () => void;

  // Disk space dialog handlers
  handleQueueDiskSpaceProceed: () => Promise<void>;
  handleQueueDiskSpaceCancel: () => void;
}

export function useQueueWithChecks(): UseQueueWithChecksReturn {
  const { queue, startQueue, getPendingItems } = useQueue();
  const {
    checkQueueConflicts,
    checkDiskSpaceForQueue,
    handleQueueConflictAutoRename,
    handleQueueConflictOverwrite,
    handleQueueConflictCancel,
    handleQueueDiskSpaceProceed: dialogDiskSpaceProceed,
    handleQueueDiskSpaceCancel: dialogDiskSpaceCancel,
  } = useDialogs();

  // Internal function to check disk space and start
  const checkDiskSpaceAndStart = useCallback(
    async (pendingItems: QueueItem[]) => {
      const spaceOk = await checkDiskSpaceForQueue(pendingItems);
      if (spaceOk) {
        await startQueue();
      }
      // If not OK, dialog is shown
    },
    [checkDiskSpaceForQueue, startQueue]
  );

  const startQueueWithChecks = useCallback(async () => {
    const pendingItems = getPendingItems();

    if (pendingItems.length === 0) {
      debugLog.queue("No pending items to process");
      return;
    }

    // Check for output file conflicts first
    const conflicts = await checkQueueConflicts(pendingItems);
    if (conflicts.length > 0) {
      // Dialog is shown, user will handle via dialog callbacks
      return;
    }

    // No conflicts, check disk space
    await checkDiskSpaceAndStart(pendingItems);
  }, [getPendingItems, checkQueueConflicts, checkDiskSpaceAndStart]);

  const resumeQueueWithChecks = useCallback(async () => {
    const pendingItems = getPendingItems();

    if (pendingItems.length === 0) {
      debugLog.queue("No pending items to resume");
      return;
    }

    // Check for output file conflicts
    const conflicts = await checkQueueConflicts(pendingItems);
    if (conflicts.length > 0) {
      return;
    }

    // Check disk space
    await checkDiskSpaceAndStart(pendingItems);
  }, [getPendingItems, checkQueueConflicts, checkDiskSpaceAndStart]);

  const handleConflictAutoRename = useCallback(async () => {
    await handleQueueConflictAutoRename();

    // After renaming, fetch fresh queue and continue with disk space check
    const { queue: freshQueue } = await window.ffmpegAPI.queueGetAll();
    const pendingItems = freshQueue.filter(
      (item: QueueItem) => item.status === "pending"
    );
    await checkDiskSpaceAndStart(pendingItems);
  }, [handleQueueConflictAutoRename, checkDiskSpaceAndStart]);

  const handleConflictOverwrite = useCallback(async () => {
    handleQueueConflictOverwrite();

    // Continue with disk space check
    const pendingItems = getPendingItems();
    await checkDiskSpaceAndStart(pendingItems);
  }, [handleQueueConflictOverwrite, getPendingItems, checkDiskSpaceAndStart]);

  const handleConflictCancel = useCallback(() => {
    handleQueueConflictCancel();
  }, [handleQueueConflictCancel]);

  const handleQueueDiskSpaceProceed = useCallback(async () => {
    dialogDiskSpaceProceed();
    await startQueue();
  }, [dialogDiskSpaceProceed, startQueue]);

  const handleQueueDiskSpaceCancel = useCallback(() => {
    dialogDiskSpaceCancel();
  }, [dialogDiskSpaceCancel]);

  return {
    startQueueWithChecks,
    resumeQueueWithChecks,
    handleConflictAutoRename,
    handleConflictOverwrite,
    handleConflictCancel,
    handleQueueDiskSpaceProceed,
    handleQueueDiskSpaceCancel,
  };
}
