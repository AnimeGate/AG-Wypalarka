# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AG-Wypalarka is a professional video subtitle burning tool built with Electron, React 19, TypeScript, and shadcn-ui. The application allows users to embed ASS subtitle files into video files using FFmpeg, with support for single file and batch queue processing.

**Key Features:**
- Single file and batch queue processing modes
- GPU acceleration (NVIDIA NVENC, Intel QSV, AMD AMF)
- Advanced encoding settings (quality presets, CQ/VBR/CBR modes)
- Real-time FFmpeg progress tracking
- Disk space monitoring with warnings
- FFmpeg auto-download and installation
- Polish and English localization
- Auto-update functionality via GitHub Releases

## Commands

### Development
- `pnpm start` - Start the app in development mode with Vite hot reload
- `pnpm run start:debug` - Start with debug mode (opens debug console window)
- `pnpm run start:debug:win` - Windows-specific debug mode command
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Check formatting with Prettier
- `pnpm run format:write` - Format all code

### Testing
- `pnpm test` - Run Vitest unit tests once
- `pnpm run test:watch` - Run Vitest in watch mode
- `pnpm run test:unit` - Alias for test:watch
- `pnpm run test:e2e` - Run Playwright E2E tests (requires `dist:dir` first)
- `pnpm run test:all` - Run all tests

**IMPORTANT**: E2E tests require the app to be packaged first with `pnpm run dist:dir`.

### Building and Distribution
- `pnpm run build` - Build the app (no packaging)
- `pnpm run dist:dir` - Build and package without installer (fast, for testing)
- `pnpm run dist` - Build and create NSIS installer
- `pnpm run publish` - Build and publish to GitHub Releases (auto-update)

**Note**: Uses **electron-builder** with NSIS (not Electron Forge). Output goes to `release/`.

## Architecture

### Centralized App Configuration

**Location:** `src/config/app.config.ts`

Single source of truth for all app metadata:
- `APP_NAME` - "AG-Wypalarka"
- `APP_ID` - "com.animegate.ag-wypalarka"
- `GITHUB_CONFIG` - { owner: "AnimeGate", repo: "AG-Wypalarka" }

### Electron Process Model

1. **Main Process** (`src/main.ts`)
   - Creates and manages BrowserWindow
   - Registers IPC listeners via `registerListeners()`
   - Initializes auto-updater
   - Handles FFmpeg operations

2. **Preload Script** (`src/preload.ts`)
   - Exposes IPC contexts via `exposeContexts()`
   - Uses `contextBridge` for security

3. **Renderer Process** (`src/renderer.ts`)
   - Renders React app (`App.tsx`)
   - Main component: `SubtitleBurner` at `src/components/burner/SubtitleBurner.tsx`

### Application Structure

**Main Components (src/components/burner/):**
- `SubtitleBurner.tsx` - Root component managing state and processing
- `BurnerFileInput.tsx` - Video/subtitle file selection
- `BurnerProgressPanel.tsx` - Single file progress display
- `BurnerQueuePanel.tsx` - Queue list management
- `BurnerQueueProgressPanel.tsx` - Queue progress display
- `BurnerSettings.tsx` - Encoding settings types
- `BurnerSettingsModal.tsx` - Settings dialog
- `DiskSpaceBar.tsx` - Disk space footer indicator
- `DiskSpaceDialog.tsx` - Disk space warning (single file)
- `QueueDiskSpaceDialog.tsx` - Disk space warning (queue)
- `OutputConflictDialog.tsx` - File overwrite prompt (single)
- `QueueConflictDialog.tsx` - File overwrite prompt (queue)
- `AddFilesDialog.tsx` - Add files to queue dialog
- `BurnerQueueItem.tsx` - Individual queue item component
- `UnpairedFilesDialog.tsx` - Unpaired files warning
- `FfmpegDownloadDialog.tsx` - FFmpeg installation dialog

**Core Libraries (src/lib/):**
- `ffmpeg-processor.ts` - Main FFmpeg executor
- `ffmpeg-downloader.ts` - FFmpeg auto-installer from GitHub
- `queue-processor.ts` - Batch processing manager
- `disk-space.ts` - Cross-platform disk space calculator
- `drop-helpers.ts` - File drag-drop utilities and auto-pairing

### IPC Communication Pattern

IPC is centralized in `src/helpers/ipc/`:

**Pattern for adding new IPC features:**
1. Create folder: `src/helpers/ipc/feature/`
2. Add `feature-channels.ts` with channel constants
3. Add `feature-context.ts` with contextBridge exposure
4. Add `feature-listeners.ts` with ipcMain handlers
5. Update `context-exposer.ts` and `listeners-register.ts`
6. Add TypeScript types to `src/types.d.ts`

**FFmpeg IPC Channels (src/helpers/ipc/ffmpeg/):**

Single File Processing:
- `ffmpeg:start` - Start encoding
- `ffmpeg:cancel` - Cancel encoding
- `ffmpeg:progress` - Progress event
- `ffmpeg:log` - Log output event
- `ffmpeg:complete` - Completion event
- `ffmpeg:error` - Error event

File Selection:
- `ffmpeg:selectVideo` - Open video file dialog
- `ffmpeg:selectSubtitle` - Open subtitle file dialog
- `ffmpeg:selectOutput` - Save output dialog
- `ffmpeg:getDefaultOutputPath` - Resolve output path with settings

FFmpeg Management:
- `ffmpeg:checkInstalled` - Check if FFmpeg exists
- `ffmpeg:startDownload` - Download FFmpeg
- `ffmpeg:downloadProgress` - Download progress event
- `ffmpeg:downloadComplete` - Download done event
- `ffmpeg:downloadError` - Download error event
- `ffmpeg:checkGpu` - GPU availability check

Disk Space:
- `ffmpeg:checkDiskSpace` - Check available space
- `ffmpeg:getDiskSpace` - Get raw disk info
- `ffmpeg:getVideoDuration` - Get video length for estimation

Output Conflict:
- `ffmpeg:checkOutputExists` - File exists check
- `ffmpeg:resolveOutputConflict` - Auto-rename with _1, _2, etc.

Queue Management:
- `ffmpeg:queue:addItem` - Add single item
- `ffmpeg:queue:addItems` - Add multiple items
- `ffmpeg:queue:removeItem` - Remove item
- `ffmpeg:queue:clear` - Clear entire queue
- `ffmpeg:queue:reorder` - Reorder items
- `ffmpeg:queue:start` - Start processing
- `ffmpeg:queue:pause` - Pause processing
- `ffmpeg:queue:resume` - Resume processing
- `ffmpeg:queue:getAll` - Get full queue
- `ffmpeg:queue:getStats` - Get statistics
- `ffmpeg:queue:updateSettings` - Update encoding settings
- `ffmpeg:queue:selectFiles` - Multi-select dialog
- `ffmpeg:queue:updateItemOutput` - Update output path
- `ffmpeg:queue:update` - Queue changed event
- `ffmpeg:queue:itemUpdate` - Item changed event
- `ffmpeg:queue:itemProgress` - Item progress event
- `ffmpeg:queue:itemLog` - Item log event
- `ffmpeg:queue:itemComplete` - Item complete event
- `ffmpeg:queue:itemError` - Item error event
- `ffmpeg:queue:complete` - Queue complete event

### FFmpeg Configuration

**Installation Location:** `%APPDATA%\ag-wypalarka\WYPALANIE\`

**Download URL:** `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip`

**Encoding Settings Structure:**
```typescript
{
  profile: "1080p" | "720p" | "2160p"
  qualityPreset: "medium" | "high" | "very_high" | "custom"
  customBitrate: "1000k" | "2400k" | "4000k"
  useHardwareAccel: boolean
  codec: "h264"
  preset: "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7"
  qualityMode: "cq" | "vbr" | "vbr_hq" | "cbr"
  cq: number (19 default)
  spatialAQ: boolean
  temporalAQ: boolean
  rcLookahead: number (20 default)
}
```

### Debug Mode System

Comprehensive debug mode with separate console window:

**Log Categories:**
- `info` - General information
- `success` - Successful operations
- `warn` - Warnings
- `error` - Errors
- `debug` - Debug information
- `route` - Navigation events
- `ipc` - IPC communication
- `updater` - Auto-updater events
- `ffmpeg` - FFmpeg output (unfiltered)
- `queue` - Queue operations
- `file` - File operations
- `legal` - Legal/copyright info

**Enable:**
- Development: `pnpm run start:debug`
- Production: `AG-Wypalarka.exe --debug`

**Usage (Main Process):**
```typescript
import { debugLog } from "@/helpers/debug-mode";

debugLog.ffmpeg("Starting encoding with settings...");
debugLog.queue("Processing item: video.mkv (ID: 12345)");
debugLog.file("Loading subtitle file: example.ass (1024 bytes)");
```

**Usage (Renderer):**
```typescript
import { debugLog } from "@/helpers/debug-logger";

debugLog.ffmpeg("FFmpeg output line received");
debugLog.queue("Adding items to queue");
```

### Theme System

- Light/dark/system modes
- localStorage persistence via IPC
- oklch color space (Tailwind CSS 4)
- `syncThemeWithLocal()` helper

### Internationalization

i18next with Polish and English:
- Primary: Polish (`pl`)
- Fallback: English (`en`)
- Configuration: `src/localization/i18n.ts`
- Translation namespace: `burner.*` for feature-specific keys

### Routing

TanStack Router with memory-based history:
- Single route: `/` renders `SubtitleBurner`
- This is a single-feature app (no navigation menu)

### Auto-Update System

electron-updater + NSIS:
- Configuration: `src/helpers/updater/auto-updater.ts`
- Checks 3 seconds after start, then hourly
- Downloads in background
- Logs to: `%APPDATA%\ag-wypalarka\logs\main.log`

### UI Components

- **shadcn-ui**: `src/components/ui/`
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Icon library
- **Geist Font**: Default sans-serif

### Path Aliases

TypeScript and Vite configured with `@/` alias pointing to `src/`:
```typescript
import { debugLog } from "@/helpers/debug-mode";
import { Button } from "@/components/ui/button";
```

## Development Notes

### Build System

- Single config: `vite.config.mts`
- Uses `vite-plugin-electron/simple`
- Main entry: `src/main.ts` → `dist-electron/main.js`
- Preload: `src/preload.ts` → `dist-electron/preload.js`

### Context Isolation

- Context isolation enabled (`contextIsolation: true`)
- Always use `contextBridge.exposeInMainWorld()`
- Never expose Node.js modules directly to renderer

### React Compiler

- Enabled via `babel-plugin-react-compiler`
- Automatic optimization of components

### Working with FFmpeg

**Process Flow:**
1. User selects video + subtitle files
2. App checks FFmpeg installation (auto-downloads if missing)
3. App checks disk space and output conflicts
4. FFmpeg process spawned with progress parsing
5. Real-time updates sent to renderer via IPC
6. Completion notification with output folder shortcut

**GPU Acceleration:**
- Detects NVIDIA, Intel, AMD GPUs
- Falls back to software encoding (libx264) on failure
- Preset mapping for different hardware encoders

### Common Issues

**File Locking During Builds:**
If build fails with "process cannot access the file":
1. Close all AG-Wypalarka instances
2. Run: `taskkill /F /IM AG-Wypalarka.exe /T`
3. Wait 2 seconds, rebuild

**FFmpeg Not Found:**
- Check `%APPDATA%\ag-wypalarka\WYPALANIE\` for ffmpeg.exe
- Use debug mode to see download progress/errors
- Check internet connection for auto-download

**Encoding Fails:**
- Check GPU compatibility if hardware accel enabled
- Try disabling GPU acceleration
- Check debug console for FFmpeg output

## Adding New Features

### Add FFmpeg Preset
1. Update `BurnerSettings.tsx` types
2. Add UI controls in `BurnerSettingsModal.tsx`
3. Update `ffmpeg-processor.ts` to handle new preset
4. Add translation keys in `i18n.ts`

### Add New Queue Feature
1. Update `queue-processor.ts` logic
2. Add IPC channel in `ffmpeg-channels.ts`
3. Add handler in `ffmpeg-listeners.ts`
4. Expose in `ffmpeg-context.ts`
5. Update `types.d.ts`
6. Update UI components
