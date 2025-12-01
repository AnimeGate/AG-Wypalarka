/**
 * Burner Contexts
 *
 * Barrel export for all burner-related contexts.
 */

export {
  EncodingSettingsProvider,
  useEncodingSettings,
} from "./EncodingSettingsContext";

export {
  FFmpegProvider,
  useFFmpeg,
  type ProcessStatus,
  type LogType,
  type LogEntry,
  type FFmpegProgress,
  type FFmpegEncodingParams,
  type CompletionStats,
} from "./FFmpegContext";

export {
  QueueProvider,
  useQueue,
  type QueueItem,
  type QueueStats,
} from "./QueueContext";

export {
  DialogProvider,
  useDialogs,
  type DiskSpaceCheckResult,
  type QueueDiskSpaceIssue,
  type QueueConflict,
} from "./DialogContext";

export { BurnerProviders } from "./BurnerProviders";
