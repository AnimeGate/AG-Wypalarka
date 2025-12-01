# AG-Wypalarka

Professional video subtitle burning tool for fansub groups. Embed ASS subtitle files into video files using FFmpeg with ease.

## License

**ALL RIGHTS RESERVED** - No license is granted.

This repository is temporarily public solely for technical requirements (GitHub Releases API for auto-update functionality). Public visibility does NOT constitute a grant of any license or permission to use this code.

See [LICENSE](./LICENSE) for full terms.

## Copyright

Copyright (c) 2025 [Shironex](https://github.com/Shironex) / AnimeGATE

Built by [Shironex](https://github.com/Shironex) for [AnimeGate](https://github.com/AnimeGate)

## Features

- **Single File Mode** - Select video and subtitle file, burn with real-time progress tracking
- **Queue Mode** - Process multiple video-subtitle pairs in batch
- **GPU Acceleration** - NVIDIA NVENC, Intel QSV, AMD AMF with automatic fallback to software encoding
- **Advanced Encoding Settings** - Quality presets, custom bitrates, CQ/VBR/CBR modes
- **Disk Space Monitoring** - Real-time disk space checking with warnings
- **FFmpeg Auto-Download** - Automatic FFmpeg installation from GitHub
- **Bilingual** - Polish and English interface
- **Auto-Update** - Automatic updates via GitHub Releases

## Tech Stack

- **Electron 38+** - Cross-platform desktop application
- **React 19** - With React Compiler for automatic optimization
- **TypeScript** - Full type safety
- **Vite** - Fast development and builds
- **shadcn-ui** - Beautiful, accessible UI components
- **Tailwind CSS 4** - Utility-first styling
- **FFmpeg** - Video encoding with subtitle burning via libass filter
- **i18next** - Internationalization

## Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- pnpm 9+ (`npm install -g pnpm` or `corepack enable`)

### Installation

```bash
# Clone the repository
git clone https://github.com/AnimeGate/AG-Wypalarka.git
cd AG-Wypalarka

# Install dependencies
pnpm install

# Start development server
pnpm start
```

### Development

```bash
# Start with hot reload
pnpm start

# Start with debug console
pnpm run dev

# Run tests
pnpm test

# Lint code
pnpm run lint

# Format code
pnpm run format:write
```

### Building

```bash
# Build for development (no installer)
pnpm run dist:dir

# Build with NSIS installer
pnpm run dist

# Build and publish to GitHub Releases
pnpm run publish
```

## Usage

### Single File Mode

1. **Select Video** - Choose the video file to burn subtitles into
2. **Select Subtitle** - Choose the ASS subtitle file
3. **Configure Settings** - Adjust quality, codec, and encoding options
4. **Select Output** - Choose output location (same folder, custom folder, or subfolder)
5. **Start Burning** - Click Start and monitor progress in real-time

### Queue Mode

1. **Add Files** - Add multiple video-subtitle pairs to the queue
2. **Configure Settings** - Set global encoding settings for all items
3. **Start Queue** - Process all items sequentially
4. **Monitor Progress** - Track per-item and overall progress

## Project Structure

```
AG-Wypalarka/
├── src/
│   ├── components/
│   │   ├── burner/               # Main application components
│   │   │   ├── SubtitleBurner.tsx        # Main component (uses contexts)
│   │   │   ├── BurnerFileInput.tsx       # File selection
│   │   │   ├── IdlePanel.tsx             # Single file idle/error state
│   │   │   ├── progress/                 # Progress display components
│   │   │   │   ├── ProgressRing.tsx      # Circular progress visualization
│   │   │   │   ├── StatsBar.tsx          # Real-time encoding stats
│   │   │   │   ├── CollapsibleLogs.tsx   # Expandable FFmpeg logs
│   │   │   │   └── EncodingView.tsx      # Combined progress view
│   │   │   ├── BurnerQueuePanel.tsx      # Queue list management
│   │   │   ├── QueueEmptyState.tsx       # Empty queue drop zone
│   │   │   ├── QueueIdlePanel.tsx        # Queue idle state with stats
│   │   │   ├── QueueProcessingPanel.tsx  # Queue processing view
│   │   │   ├── settings/                 # Settings modal components
│   │   │   ├── DiskSpaceBar.tsx          # Disk space footer
│   │   │   └── ...                       # Other dialogs and components
│   │   └── ui/                   # shadcn-ui components
│   │
│   ├── contexts/
│   │   └── burner/               # React Contexts for state management
│   │       ├── FFmpegContext.tsx         # FFmpeg state, logs, progress
│   │       ├── EncodingSettingsContext.tsx   # Settings and GPU info
│   │       ├── QueueContext.tsx          # Queue state and operations
│   │       ├── DialogContext.tsx         # All dialog states
│   │       ├── BurnerProviders.tsx       # Combined provider wrapper
│   │       └── index.ts                  # Barrel export
│   │
│   ├── hooks/
│   │   └── burner/               # Custom React hooks
│   │       ├── useDiskSpacePaths.ts      # Track paths for disk bar
│   │       ├── useProcessWithDiskCheck.ts    # Process with disk validation
│   │       ├── useQueueWithChecks.ts     # Queue with conflict checks
│   │       └── index.ts                  # Barrel export
│   │
│   ├── lib/
│   │   ├── ffmpeg/               # FFmpeg library (modular)
│   │   │   ├── ffmpeg-processor.ts       # Main FFmpeg executor
│   │   │   ├── ffmpeg-path-utils.ts      # Path escaping utilities
│   │   │   ├── ffmpeg-output-parser.ts   # Output parsing utilities
│   │   │   ├── ffmpeg-settings.ts        # Settings normalization
│   │   │   └── index.ts                  # Barrel export
│   │   ├── ffmpeg-downloader.ts  # FFmpeg auto-installer
│   │   ├── queue-processor.ts    # Batch processing manager
│   │   ├── disk-space.ts         # Disk space utilities
│   │   └── drop-helpers.ts       # File drag-drop utilities
│   │
│   ├── helpers/
│   │   └── ipc/
│   │       └── ffmpeg/
│   │           ├── handlers/     # Modular IPC handlers
│   │           │   ├── file-handlers.ts      # File selection dialogs
│   │           │   ├── process-handlers.ts   # FFmpeg process control
│   │           │   ├── download-handlers.ts  # FFmpeg download
│   │           │   ├── disk-space-handlers.ts    # Disk space checks
│   │           │   ├── queue-handlers.ts     # Queue management
│   │           │   └── index.ts              # Barrel export
│   │           ├── ffmpeg-channels.ts    # Channel constants
│   │           ├── ffmpeg-context.ts     # Context exposure
│   │           └── ffmpeg-listeners.ts   # Handler registration
│   │
│   ├── config/
│   │   └── app.config.ts         # App configuration
│   │
│   ├── localization/
│   │   └── i18n.ts               # Translations (PL/EN)
│   │
│   └── routes/
│       └── index.tsx             # Main route
│
├── package.json
└── README.md
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm start` | Start development server |
| `pnpm run dev` | Start with debug console |
| `pnpm run build` | Build for production |
| `pnpm run dist:dir` | Build and package (no installer) |
| `pnpm run dist` | Build with installer |
| `pnpm run publish` | Build and publish to GitHub |
| `pnpm test` | Run unit tests |
| `pnpm run lint` | Lint code |
| `pnpm run format:write` | Format code |

## Technologies

- [Electron](https://electronjs.org)
- [React](https://react.dev)
- [FFmpeg](https://ffmpeg.org)
- [shadcn-ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
