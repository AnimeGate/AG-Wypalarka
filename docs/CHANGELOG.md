# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-12-01

### Added

**Core Features**
- Professional video subtitle burning - embed ASS subtitles directly into video files
- Single file mode with intuitive file input panel and encoding preview
- Queue mode for batch processing multiple video/subtitle pairs
- Drag-and-drop support with automatic file pairing by name matching

**Encoding & Processing**
- FFmpeg integration with automatic download and installation
- NVIDIA NVENC GPU acceleration support for faster encoding
- Multiple quality modes: Bitrate-based (VBR) and Constant Quality (CQ)
- Configurable bitrate presets (2-20 Mbps) with custom option
- Real-time progress tracking with ETA, FPS, speed, and bitrate stats
- Collapsible FFmpeg logs for monitoring encoding process

**Queue System**
- Batch processing with queue management
- Auto-pairing of video and subtitle files by filename
- Unpaired files dialog for manual subtitle selection
- Pause/resume queue functionality
- Queue statistics (pending, processing, completed, errors)

**User Interface**
- Progress ring visualization with percentage and ETA
- Stats bar showing real-time encoding metrics
- Disk space monitoring with warning dialogs
- Output file conflict detection with auto-rename option
- Settings modal with encoding configuration
- GPU detection and status display

**System**
- Auto-update system via GitHub Releases
- Polish and English localization
- Light/dark/system theme support
- Debug mode with separate console window
- Comprehensive error handling and recovery

### Technical Details
- Built with Electron, React 19, TypeScript, and Tailwind CSS 4
- Uses shadcn-ui component library
- TanStack Router for navigation
- electron-builder with NSIS installer

---

## GitHub Release Publishing

When publishing a new release on GitHub:

1. Go to your repository's **Releases** page
2. Click **Draft a new release**
3. Create a new tag (e.g., `v1.0.0`)
4. Set the release title (e.g., `v1.0.0 - Initial Release`)
5. Paste your release notes in the description
6. Attach the built installers (from `release/` folder)
7. Click **Publish release**

The auto-updater will automatically detect the new release and show the update dialog to users.
