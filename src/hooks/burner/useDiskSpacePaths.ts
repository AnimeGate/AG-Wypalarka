/**
 * Disk Space Paths Hook
 *
 * Tracks current video and output paths for disk space bar display.
 * Updates based on queue items when in queue mode.
 */

import { useState, useEffect } from "react";
import { useQueue } from "@/contexts/burner";

interface DiskSpacePaths {
  videoPath: string | null;
  outputPath: string | null;
  setVideoPath: (path: string | null) => void;
  setOutputPath: (path: string | null) => void;
}

export function useDiskSpacePaths(): DiskSpacePaths {
  const { queue } = useQueue();
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);

  // Update paths based on queue items (for queue mode)
  useEffect(() => {
    const pendingItems = queue.filter((item) => item.status === "pending");

    if (pendingItems.length > 0) {
      // Use the first pending item for disk space display
      setVideoPath(pendingItems[0].videoPath);
      setOutputPath(pendingItems[0].outputPath);
    } else if (queue.length === 0) {
      // Queue is empty - clear the paths (only if not set by single file mode)
      // Note: In single file mode, paths are set directly via setters
    }
  }, [queue]);

  return {
    videoPath,
    outputPath,
    setVideoPath,
    setOutputPath,
  };
}
