/**
 * Queue Context
 *
 * Manages the encoding queue state and operations.
 * Handles batch processing of multiple files.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { debugLog } from "@/helpers/debug-logger";

export interface QueueItem {
  id: string;
  videoPath: string;
  videoName: string;
  subtitlePath: string;
  subtitleName: string;
  outputPath: string;
  status: "pending" | "processing" | "completed" | "error" | "cancelled";
  progress: {
    frame: number;
    fps: number;
    time: string;
    bitrate: string;
    speed: string;
    percentage: number;
    eta: string | null;
  } | null;
  error?: string;
  logs: Array<{
    log: string;
    type: "info" | "success" | "warning" | "error" | "debug" | "metadata";
  }>;
}

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  error: number;
  cancelled: number;
}

interface QueueContextType {
  // State
  queue: QueueItem[];
  stats: QueueStats;
  isProcessing: boolean;

  // Item actions
  addItems: (items: Array<Omit<QueueItem, "id" | "status" | "progress" | "logs">>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  openItemFolder: (outputPath: string) => Promise<void>;

  // Queue control
  startQueue: () => Promise<void>;
  pauseQueue: () => Promise<void>;
  resumeQueue: () => Promise<void>;

  // Helpers
  getPendingItems: () => QueueItem[];
  getCurrentItem: () => QueueItem | null;
}

const QueueContext = createContext<QueueContextType | null>(null);

interface QueueProviderProps {
  children: ReactNode;
}

export function QueueProvider({ children }: QueueProviderProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    error: 0,
    cancelled: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Set up queue event listeners
  useEffect(() => {
    const unsubQueueUpdate = window.ffmpegAPI.onQueueUpdate((updatedQueue) => {
      setQueue(updatedQueue as QueueItem[]);
    });

    const unsubQueueItemUpdate = window.ffmpegAPI.onQueueItemUpdate((item) => {
      setQueue((prev) => prev.map((i) => (i.id === item.id ? (item as QueueItem) : i)));
    });

    const unsubQueueComplete = window.ffmpegAPI.onQueueComplete(() => {
      setIsProcessing(false);
    });

    return () => {
      unsubQueueUpdate();
      unsubQueueItemUpdate();
      unsubQueueComplete();
    };
  }, []);

  // Update queue stats when queue changes
  useEffect(() => {
    const updateStats = async () => {
      const newStats = await window.ffmpegAPI.queueGetStats();
      setStats(newStats);
      setIsProcessing(newStats.processing > 0);
    };
    updateStats();
  }, [queue]);

  const addItems = useCallback(
    async (items: Array<Omit<QueueItem, "id" | "status" | "progress" | "logs">>) => {
      try {
        debugLog.queue(`Adding ${items.length} items to queue`);
        await window.ffmpegAPI.queueAddItems(items);
      } catch (error) {
        console.error("Failed to add files to queue:", error);
        debugLog.error(`Failed to add files to queue: ${error}`);
      }
    },
    []
  );

  const removeItem = useCallback(async (id: string) => {
    try {
      await window.ffmpegAPI.queueRemoveItem(id);
    } catch (error) {
      console.error("Failed to remove item from queue:", error);
    }
  }, []);

  const clearQueue = useCallback(async () => {
    try {
      await window.ffmpegAPI.queueClear();
    } catch (error) {
      console.error("Failed to clear queue:", error);
    }
  }, []);

  const openItemFolder = useCallback(async (outputPath: string) => {
    try {
      await window.ffmpegAPI.openOutputFolder(outputPath);
    } catch (error) {
      console.error("Failed to open output folder:", error);
    }
  }, []);

  const startQueue = useCallback(async () => {
    try {
      debugLog.queue("Starting queue processing");
      setIsProcessing(true);
      await window.ffmpegAPI.queueStart();
    } catch (error) {
      setIsProcessing(false);
      console.error("Failed to start queue:", error);
      debugLog.error(`Failed to start queue: ${error}`);
    }
  }, []);

  const pauseQueue = useCallback(async () => {
    try {
      debugLog.queue("Pausing queue processing");
      await window.ffmpegAPI.queuePause();
      setIsProcessing(false);
    } catch (error) {
      console.error("Failed to pause queue:", error);
      debugLog.error(`Failed to pause queue: ${error}`);
    }
  }, []);

  const resumeQueue = useCallback(async () => {
    try {
      debugLog.queue("Resuming queue processing");
      setIsProcessing(true);
      await window.ffmpegAPI.queueResume();
    } catch (error) {
      setIsProcessing(false);
      console.error("Failed to resume queue:", error);
      debugLog.error(`Failed to resume queue: ${error}`);
    }
  }, []);

  const getPendingItems = useCallback(() => {
    return queue.filter((item) => item.status === "pending");
  }, [queue]);

  const getCurrentItem = useCallback(() => {
    return queue.find((item) => item.status === "processing") || null;
  }, [queue]);

  const value: QueueContextType = {
    queue,
    stats,
    isProcessing,
    addItems,
    removeItem,
    clearQueue,
    openItemFolder,
    startQueue,
    pauseQueue,
    resumeQueue,
    getPendingItems,
    getCurrentItem,
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue(): QueueContextType {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within QueueProvider");
  }
  return context;
}
