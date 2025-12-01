import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { APP_NAME } from "../config/app.config";

i18n.use(initReactI18next).init({
  fallbackLng: "pl",
  resources: {
    pl: {
      translation: {
        appName: APP_NAME,
        // Navbar
        navHome: "Strona główna",
        settings: "Ustawienia",
        // Settings Modal
        settingsTitle: "Ustawienia aplikacji",
        settingsDescription: "Dostosuj język, motyw i inne preferencje",
        languageSection: "Język",
        languageDescription: "Wybierz język interfejsu",
        themeSection: "Motyw",
        themeDescription: "Wybierz motyw kolorystyczny aplikacji",
        themeLight: "Jasny",
        themeDark: "Ciemny",
        themeSystem: "Systemowy",
        versionSection: "Wersja",
        versionDescription: "Informacje o wersji aplikacji",
        currentVersion: "Aktualna wersja",
        closeSettings: "Zamknij",
        // Legal Section
        legalSection: "Informacje prawne",
        copyrightHolder: "Shironex / AnimeGATE",
        allRightsReserved:
          "Wszystkie prawa zastrzeżone. Nieautoryzowane kopiowanie, modyfikowanie lub dystrybucja tego oprogramowania jest zabroniona.",
        // Update Dialog
        updateAvailableTitle: "Dostępna aktualizacja",
        updateReadyTitle: "Aktualizacja gotowa",
        updateNewVersion: "Wersja {{version}} jest dostępna do pobrania.",
        updateChangelog: "Co nowego",
        updateDownloading: "Pobieranie aktualizacji...",
        updateDownload: "Pobierz",
        updateInstallNow: "Zainstaluj teraz",
        updateLater: "Później",
        updateHide: "Ukryj",
        updateClose: "Zamknij",
        // Changelog History
        changelogHistory: "Historia zmian",
        changelogHistoryTitle: "Historia wersji",
        changelogHistoryDesc: "Wszystkie wydania z GitHub",
        changelogLatest: "Najnowsza",
        changelogNoReleases: "Brak wydań do wyświetlenia",
        changelogNoNotes: "Brak notatek dla tego wydania",
        changelogRetry: "Spróbuj ponownie",
        changelogNoConfig: "Brak konfiguracji GitHub",
        // Network Status
        offlineTitle: "Jesteś offline",
        offlineDescription: "Sprawdź połączenie internetowe",
        onlineTitle: "Ponownie online",
        onlineDescription: "Połączenie internetowe przywrócone",

        // ===== BURNER TRANSLATIONS =====
        // Header
        burnerTitle: "Wypalanie napisów",
        burnerSubtitle: "Osadź napisy ASS bezpośrednio w pliku wideo",

        // Modes
        burnerSingleMode: "Pojedynczy plik",
        burnerQueueMode: "Kolejka",
        burnerQueueDesc: "Zarządzaj kolejką przetwarzania plików",

        // Queue Management
        burnerQueueTitle: "Kolejka przetwarzania",
        burnerQueueAddFiles: "Dodaj pliki",
        burnerQueueAddFilesDesc: "Dodaj pary video + napisy do kolejki",
        burnerQueueAddFilesEmpty: "Kliknij poniżej, aby dodać parę plików",
        burnerQueueAddPair: "Dodaj parę",
        burnerQueuePair: "Para {{number}}",
        burnerQueueAddToQueue: "Dodaj do kolejki",
        burnerQueueClear: "Wyczyść kolejkę",
        burnerQueueStart: "Rozpocznij kolejkę",
        burnerQueuePause: "Zatrzymaj kolejkę",
        burnerQueueResume: "Wznów kolejkę",
        burnerQueueEmpty: "Kolejka jest pusta",
        burnerQueueRemoveItem: "Usuń z kolejki",
        burnerQueueTotal: "Razem",
        burnerQueueCompleted: "Ukończono",
        burnerQueueFailed: "Błędów",
        burnerQueueItemPending: "Oczekuje",
        burnerQueueItemProcessing: "Przetwarzanie",
        burnerQueueItemCompleted: "Ukończono",
        burnerQueueItemError: "Błąd",
        burnerQueueItemCancelled: "Anulowano",
        burnerQueueCurrentlyProcessing: "Obecnie przetwarzane",
        burnerQueueOverallProgress: "Postęp kolejki",
        burnerQueueProgressDesc: "Logi procesu FFmpeg dla aktualnego elementu",
        burnerQueueDropFilesHere: "Upuść pliki tutaj",
        burnerQueueDropHint:
          "Przeciągnij pliki wideo i napisy - zostaną automatycznie sparowane",

        // File Input
        burnerVideoFile: "Plik wideo",
        burnerVideoFileDesc: "Wybierz plik MKV, MP4 lub inny format wideo",
        burnerSelectVideo: "Wybierz plik wideo",
        burnerSubtitleFile: "Plik napisów",
        burnerSubtitleFileDesc: "Wybierz plik napisów ASS",
        burnerSelectSubtitle: "Wybierz plik napisów",
        burnerDropHint: "Lub przeciągnij i upuść plik tutaj",

        // Unpaired Videos Dialog
        burnerUnpairedTitle: "Brak pasujących napisów",
        burnerUnpairedDescription:
          "Nie znaleziono napisów dla {{count}} plików wideo. Wybierz plik napisów do zastosowania dla wszystkich.",
        burnerUnpairedSelectSubtitle: "Wybierz napisy",
        burnerUnpairedCancel: "Anuluj",

        // Output
        burnerOutputFile: "Plik wyjściowy",
        burnerOutputFileDesc: "Wybierz lokalizację zapisu filmu z napisami",
        burnerSelectOutput: "Wybierz lokalizację zapisu",
        burnerStartProcess: "Rozpocznij wypalanie",

        // Progress Panel
        burnerProgressTitle: "Postęp przetwarzania",
        burnerProgressDesc: "Logi procesu FFmpeg",
        burnerProgress: "Postęp",
        burnerFrames: "klatek",
        burnerNoLogs: "Brak logów - oczekiwanie na rozpoczęcie procesu...",

        // Status
        burnerStatusIdle: "Bezczynny",
        burnerStatusProcessing: "Przetwarzanie",
        burnerStatusCompleted: "Ukończono",
        burnerStatusError: "Błąd",

        // Controls
        burnerCancel: "Anuluj",
        burnerReset: "Resetuj",
        burnerShowInFolder: "Pokaż w folderze",

        // Settings
        burnerEncodingSettings: "Ustawienia kodowania",
        burnerEncodingSettingsDesc: "Dostosuj jakość i wydajność",
        burnerAdvancedSettings: "Zaawansowane ustawienia",

        // Simple Profiles
        burnerProfile: "Profil",
        burnerProfileCustom: "Własny",
        burnerProfile1080p: "1080p",
        burnerProfile1080pDownscale: "1080p (downscale z 4K)",
        burnerProfile1080pCinema: "1080p Cinema (2.39:1)",
        burnerProfile4k: "4K",
        burnerProfile4kCinema: "4K Cinema (2.39:1)",
        burnerProfileDesc:
          "Wybierz gotowy profil aby uniknąć złożonych ustawień. Zawsze możesz przełączyć na Własny.",
        burnerProfileHelpTitle: "Dostępne profile:",
        burnerProfileHelp1080p:
          "Dla materiałów źródłowych w 1080p (2400k bitrate)",
        burnerProfileHelp1080pDownscale:
          "Skaluje wideo z 4K do 1080p (2400k bitrate)",
        burnerProfileHelp1080pCinema:
          "Format kinowy 2.39:1 w 1080p dla filmów z czarnymi pasami",
        burnerProfileHelp4k: "Zachowuje rozdzielczość 4K (6M bitrate)",
        burnerProfileHelp4kCinema:
          "Format kinowy 2.39:1 w 4K dla filmów z czarnymi pasami",
        burnerQualityPresetLockedByProfile:
          'Bitrate jest zdefiniowany przez wybrany profil. Wybierz "Własny" profil, aby zmienić.',

        // Quality Presets
        burnerQualityPreset: "Preset jakości",
        burnerQualityUltra: "Ultra (6000k) - Najlepsza jakość",
        burnerQualityHigh: "High (4000k) - Świetna jakość",
        burnerQualityMedium: "Medium (2400k) - Zbalansowane",
        burnerQualityLow: "Low (1200k) - Mały plik",
        burnerQualityCustom: "Własny - Ustaw bitrate",
        burnerCustomBitrate: "Własny bitrate",
        burnerCustomBitrateDesc: "np. 3000k lub 5M",
        burnerBitrateNotUsedCQVBRHQ:
          "Bitrate nie jest używany w trybach CQ/VBR HQ.",

        // Hardware Acceleration
        burnerHardwareAccel: "Akceleracja sprzętowa",
        burnerHardwareAccelDesc:
          "Użyj GPU do szybszego kodowania (NVIDIA/Intel/AMD)",
        burnerGpuAvailable: "GPU dostępne",
        burnerGpuNotAvailable: "GPU niedostępne",
        burnerGpuDetecting: "Wykrywanie GPU...",
        burnerGpuInfo: "GPU",
        burnerGpuSetupTitle: "Jak włączyć akcelerację GPU:",
        burnerGpuSetup1: "Zainstaluj najnowsze sterowniki karty graficznej",
        burnerGpuSetup2: "Dla NVIDIA: Zainstaluj CUDA Toolkit",
        burnerGpuSetup3: "Uruchom ponownie aplikację po instalacji",
        burnerGpuDownload: "Pobierz CUDA Toolkit",

        // Advanced Encoder Settings
        burnerEncoderCodec: "Kodek",
        burnerEncoderCodecDesc:
          "H.264: najlepsza kompatybilność z wszystkimi urządzeniami i platformami (w tym Google Drive).",
        burnerEncoderPreset: "Preset",
        burnerEncoderPresetP1: "p1 (najszybszy)",
        burnerEncoderPresetP2: "p2",
        burnerEncoderPresetP3: "p3",
        burnerEncoderPresetP4: "p4 (zbalansowany)",
        burnerEncoderPresetP5: "p5",
        burnerEncoderPresetP6: "p6",
        burnerEncoderPresetP7: "p7 (najwyższa jakość)",
        burnerEncoderPresetDesc:
          "p1 = najszybszy, p7 = najwyższa jakość. p4 to dobry balans prędkości i jakości.",

        // Rate Control
        burnerRateControl: "Kontrola bitrate",
        burnerRateControlCQ: "CQ",
        burnerRateControlVBR: "VBR",
        burnerRateControlVBRHQ: "VBR HQ",
        burnerRateControlCBR: "CBR",
        burnerRateControlDesc:
          "VBR HQ + CQ polecane dla najlepszej jakości/rozmiaru. CBR tylko gdy wymagany stały bitrate.",
        burnerCQ: "CQ",
        burnerCQDesc:
          "Niższe CQ = wyższa jakość (większy bitrate). Typowe wartości 15–25. Używane głównie z CQ/VBR HQ.",
        burnerSpatialAQ: "Spatial AQ",
        burnerSpatialAQDesc:
          "Poprawia jakość w obszarach z dużą ilością detali i tekstur.",
        burnerTemporalAQ: "Temporal AQ",
        burnerTemporalAQDesc:
          "Poprawia jakość w ruchu; lepszy rozdział bitów między klatkami.",
        burnerRcLookahead: "RC Lookahead",
        burnerRcLookaheadDesc:
          "Ilość przyszłych klatek analizowanych przez RC. Więcej = lepsze decyzje kosztem opóźnienia. Typowo 0–32.",

        // Output Conflict Dialog
        burnerConflictTitle: "Plik już istnieje",
        burnerConflictDescription:
          'Plik wyjściowy "{{fileName}}" już istnieje. Co chcesz zrobić?',
        burnerConflictOverwrite: "Nadpisz istniejący plik",
        burnerConflictAutoRename: "Użyj nowej nazwy automatycznie",
        burnerConflictChooseNew: "Wybierz inną lokalizację",

        // Disk Space Check
        burnerDiskSpaceTitle: "Niewystarczająca ilość miejsca na dysku",
        burnerDiskSpaceDescription:
          "Na dysku docelowym może nie być wystarczającej ilości miejsca dla pliku wyjściowego.",
        burnerDiskSpaceRequired: "Wymagane (szacunkowo)",
        burnerDiskSpaceAvailable: "Dostępne",
        burnerDiskSpaceOutputLocation: "Lokalizacja wyjściowa",
        burnerDiskSpaceWarning:
          "Kontynuowanie może spowodować uszkodzenie pliku wyjściowego, jeśli zabraknie miejsca podczas kodowania.",
        burnerDiskSpaceChangeLocation: "Zmień lokalizację",
        burnerDiskSpaceProceedAnyway: "Kontynuuj mimo to",
        burnerDiskSpaceSelectOutput: "Wybierz lokalizację wyjściową...",
        burnerDiskSpaceEstimated: "Szacowany rozmiar",
        burnerDiskSpaceLowWarning: "Mało miejsca!",

        // Queue Disk Space
        burnerQueueDiskSpaceTitle: "Wykryto problemy z miejscem na dysku",
        burnerQueueDiskSpaceDescription:
          "{{count}} plików w kolejce może mieć niewystarczającą ilość miejsca na dysku docelowym.",
        burnerQueueDiskSpaceWarning:
          "Kontynuowanie może spowodować niepowodzenie kodowania lub uszkodzenie plików wyjściowych.",

        // Queue Conflict Dialog
        burnerQueueConflictTitle: "Wykryto konflikty plików wyjściowych",
        burnerQueueConflictDescription:
          "{{count}} plików w kolejce zostanie nadpisanych, ponieważ pliki wyjściowe już istnieją.",
        burnerQueueConflictAutoRename:
          "Zmień nazwy automatycznie (dodaj _1, _2, itp.)",
        burnerQueueConflictOverwrite: "Nadpisz wszystkie istniejące pliki",

        // FFmpeg Download
        burnerFfmpegRequired: "FFmpeg jest wymagany",
        burnerFfmpegNotInstalled:
          "FFmpeg nie jest zainstalowany. Pobierz i zainstaluj aby korzystać z funkcji wypalania napisów.",
        burnerFfmpegDownload: "Pobierz FFmpeg",
        burnerFfmpegDownloading: "Pobieranie FFmpeg...",
        burnerFfmpegExtracting: "Rozpakowywanie FFmpeg...",
        burnerFfmpegInstalled: "FFmpeg zainstalowany pomyślnie!",
        burnerFfmpegError: "Błąd pobierania FFmpeg",
        burnerFfmpegDownloadProgress: "Postęp pobierania",
        burnerFfmpegClose: "Zamknij",
        burnerFfmpegRetry: "Spróbuj ponownie",
        burnerFfmpegDescription:
          "FFmpeg to potężna platforma multimedialna wymagana do wypalania napisów do filmów. Pobieranie zajmuje około ~200MB i zostanie zainstalowane automatycznie.",
        burnerFfmpegSuccessDesc:
          "FFmpeg został pomyślnie zainstalowany. Możesz teraz korzystać z funkcji wypalania napisów.",
        burnerFfmpegErrorUnknown:
          "Wystąpił nieznany błąd podczas pobierania.",
        burnerFfmpegDownloadingStatus: "Pobieranie",
        burnerFfmpegStartingDownload: "Rozpoczynanie pobierania...",

        // Output Settings
        burnerOutputDefaultsTitle: "Domyślne ustawienia wyjścia",
        burnerOutputDefaultsDesc: "Konfiguruj domyślne zachowanie plików wyjściowych",
        burnerOutputPrefix: "Prefiks nazwy pliku",
        burnerOutputPrefixDesc: "Dodaj prefiks do nazwy pliku wyjściowego",
        burnerOutputPrefixPlaceholder: "np. sub_",
        burnerOutputDirectory: "Katalog wyjściowy",
        burnerOutputDirectoryDesc: "Zapisuj pliki w określonym katalogu",
        burnerOutputDirectorySameAsSource: "Ten sam co źródłowy",
        burnerOutputDirectoryCustom: "Własny katalog",
        burnerOutputDirectorySelect: "Wybierz katalog",
      },
    },
    en: {
      translation: {
        appName: APP_NAME,
        // Navbar
        navHome: "Home",
        settings: "Settings",
        // Settings Modal
        settingsTitle: "Application Settings",
        settingsDescription: "Customize language, theme and other preferences",
        languageSection: "Language",
        languageDescription: "Select interface language",
        themeSection: "Theme",
        themeDescription: "Select application color theme",
        themeLight: "Light",
        themeDark: "Dark",
        themeSystem: "System",
        versionSection: "Version",
        versionDescription: "Application version information",
        currentVersion: "Current version",
        closeSettings: "Close",
        // Legal Section
        legalSection: "Legal Information",
        copyrightHolder: "Shironex / AnimeGATE",
        allRightsReserved:
          "All rights reserved. Unauthorized copying, modification, or distribution of this software is prohibited.",
        // Update Dialog
        updateAvailableTitle: "Update Available",
        updateReadyTitle: "Update Ready",
        updateNewVersion: "Version {{version}} is available for download.",
        updateChangelog: "What's New",
        updateDownloading: "Downloading update...",
        updateDownload: "Download",
        updateInstallNow: "Install now",
        updateLater: "Later",
        updateHide: "Hide",
        updateClose: "Close",
        // Changelog History
        changelogHistory: "Changelog",
        changelogHistoryTitle: "Version History",
        changelogHistoryDesc: "All releases from GitHub",
        changelogLatest: "Latest",
        changelogNoReleases: "No releases to display",
        changelogNoNotes: "No release notes available",
        changelogRetry: "Retry",
        changelogNoConfig: "GitHub configuration missing",
        // Network Status
        offlineTitle: "You are offline",
        offlineDescription: "Check your internet connection",
        onlineTitle: "Back online",
        onlineDescription: "Internet connection restored",

        // ===== BURNER TRANSLATIONS =====
        // Header
        burnerTitle: "Subtitle Burning",
        burnerSubtitle: "Embed ASS subtitles directly into video files",

        // Modes
        burnerSingleMode: "Single File",
        burnerQueueMode: "Queue",
        burnerQueueDesc: "Manage batch file processing queue",

        // Queue Management
        burnerQueueTitle: "Processing Queue",
        burnerQueueAddFiles: "Add Files",
        burnerQueueAddFilesDesc: "Add video + subtitle pairs to queue",
        burnerQueueAddFilesEmpty: "Click below to add a file pair",
        burnerQueueAddPair: "Add Pair",
        burnerQueuePair: "Pair {{number}}",
        burnerQueueAddToQueue: "Add to Queue",
        burnerQueueClear: "Clear Queue",
        burnerQueueStart: "Start Queue",
        burnerQueuePause: "Pause Queue",
        burnerQueueResume: "Resume Queue",
        burnerQueueEmpty: "Queue is empty",
        burnerQueueRemoveItem: "Remove from queue",
        burnerQueueTotal: "Total",
        burnerQueueCompleted: "Completed",
        burnerQueueFailed: "Failed",
        burnerQueueItemPending: "Pending",
        burnerQueueItemProcessing: "Processing",
        burnerQueueItemCompleted: "Completed",
        burnerQueueItemError: "Error",
        burnerQueueItemCancelled: "Cancelled",
        burnerQueueCurrentlyProcessing: "Currently Processing",
        burnerQueueOverallProgress: "Queue Progress",
        burnerQueueProgressDesc: "FFmpeg process logs for current item",
        burnerQueueDropFilesHere: "Drop files here",
        burnerQueueDropHint:
          "Drag video and subtitle files - they will be auto-paired",

        // File Input
        burnerVideoFile: "Video File",
        burnerVideoFileDesc: "Select MKV, MP4 or other video format",
        burnerSelectVideo: "Select video file",
        burnerSubtitleFile: "Subtitle File",
        burnerSubtitleFileDesc: "Select ASS subtitle file",
        burnerSelectSubtitle: "Select subtitle file",
        burnerDropHint: "Or drag and drop file here",

        // Unpaired Videos Dialog
        burnerUnpairedTitle: "No matching subtitles",
        burnerUnpairedDescription:
          "No subtitles found for {{count}} video files. Select a subtitle file to apply to all.",
        burnerUnpairedSelectSubtitle: "Select subtitle",
        burnerUnpairedCancel: "Cancel",

        // Output
        burnerOutputFile: "Output File",
        burnerOutputFileDesc: "Choose location to save video with subtitles",
        burnerSelectOutput: "Choose save location",
        burnerStartProcess: "Start Burning",

        // Progress Panel
        burnerProgressTitle: "Processing Progress",
        burnerProgressDesc: "FFmpeg process logs",
        burnerProgress: "Progress",
        burnerFrames: "frames",
        burnerNoLogs: "No logs - waiting for process to start...",

        // Status
        burnerStatusIdle: "Idle",
        burnerStatusProcessing: "Processing",
        burnerStatusCompleted: "Completed",
        burnerStatusError: "Error",

        // Controls
        burnerCancel: "Cancel",
        burnerReset: "Reset",
        burnerShowInFolder: "Show in Folder",

        // Settings
        burnerEncodingSettings: "Encoding Settings",
        burnerEncodingSettingsDesc: "Adjust quality and performance",
        burnerAdvancedSettings: "Advanced Settings",

        // Simple Profiles
        burnerProfile: "Profile",
        burnerProfileCustom: "Custom",
        burnerProfile1080p: "1080p",
        burnerProfile1080pDownscale: "1080p (downscale from 4K)",
        burnerProfile1080pCinema: "1080p Cinema (2.39:1)",
        burnerProfile4k: "4K",
        burnerProfile4kCinema: "4K Cinema (2.39:1)",
        burnerProfileDesc:
          "Choose a ready profile to avoid advanced tuning. You can always switch to Custom.",
        burnerProfileHelpTitle: "Available profiles:",
        burnerProfileHelp1080p:
          "For native 1080p source files (2400k bitrate)",
        burnerProfileHelp1080pDownscale:
          "Scales 4K video down to 1080p (2400k bitrate)",
        burnerProfileHelp1080pCinema:
          "Cinematic 2.39:1 aspect ratio in 1080p for letterboxed content",
        burnerProfileHelp4k: "Keeps native 4K resolution (6M bitrate)",
        burnerProfileHelp4kCinema:
          "Cinematic 2.39:1 aspect ratio in 4K for letterboxed content",
        burnerQualityPresetLockedByProfile:
          'Bitrate is defined by selected profile. Choose "Custom" profile to change.',

        // Quality Presets
        burnerQualityPreset: "Quality Preset",
        burnerQualityUltra: "Ultra (6000k) - Best quality",
        burnerQualityHigh: "High (4000k) - Great quality",
        burnerQualityMedium: "Medium (2400k) - Balanced",
        burnerQualityLow: "Low (1200k) - Small file",
        burnerQualityCustom: "Custom - Set bitrate",
        burnerCustomBitrate: "Custom Bitrate",
        burnerCustomBitrateDesc: "e.g. 3000k or 5M",
        burnerBitrateNotUsedCQVBRHQ:
          "Bitrate is not used in CQ/VBR HQ modes.",

        // Hardware Acceleration
        burnerHardwareAccel: "Hardware Acceleration",
        burnerHardwareAccelDesc:
          "Use GPU for faster encoding (NVIDIA/Intel/AMD)",
        burnerGpuAvailable: "GPU available",
        burnerGpuNotAvailable: "GPU not available",
        burnerGpuDetecting: "Detecting GPU...",
        burnerGpuInfo: "GPU",
        burnerGpuSetupTitle: "How to enable GPU acceleration:",
        burnerGpuSetup1: "Install the latest graphics card drivers",
        burnerGpuSetup2: "For NVIDIA: Install CUDA Toolkit",
        burnerGpuSetup3: "Restart the application after installation",
        burnerGpuDownload: "Download CUDA Toolkit",

        // Advanced Encoder Settings
        burnerEncoderCodec: "Codec",
        burnerEncoderCodecDesc:
          "H.264: best compatibility with all devices and platforms (including Google Drive).",
        burnerEncoderPreset: "Preset",
        burnerEncoderPresetP1: "p1 (fastest)",
        burnerEncoderPresetP2: "p2",
        burnerEncoderPresetP3: "p3",
        burnerEncoderPresetP4: "p4 (balanced)",
        burnerEncoderPresetP5: "p5",
        burnerEncoderPresetP6: "p6",
        burnerEncoderPresetP7: "p7 (highest quality)",
        burnerEncoderPresetDesc:
          "p1 = fastest, p7 = highest quality. p4 is a good balance of speed and quality.",

        // Rate Control
        burnerRateControl: "Rate Control",
        burnerRateControlCQ: "CQ",
        burnerRateControlVBR: "VBR",
        burnerRateControlVBRHQ: "VBR HQ",
        burnerRateControlCBR: "CBR",
        burnerRateControlDesc:
          "VBR HQ + CQ recommended for best quality/size. CBR only when constant bitrate required.",
        burnerCQ: "CQ",
        burnerCQDesc:
          "Lower CQ = higher quality (higher bitrate). Typical values 15–25. Used mainly with CQ/VBR HQ.",
        burnerSpatialAQ: "Spatial AQ",
        burnerSpatialAQDesc:
          "Improves quality in areas with high detail and textures.",
        burnerTemporalAQ: "Temporal AQ",
        burnerTemporalAQDesc:
          "Improves motion quality; better bit allocation between frames.",
        burnerRcLookahead: "RC Lookahead",
        burnerRcLookaheadDesc:
          "Number of future frames analyzed by RC. More = better decisions at cost of delay. Typically 0–32.",

        // Output Conflict Dialog
        burnerConflictTitle: "File already exists",
        burnerConflictDescription:
          'Output file "{{fileName}}" already exists. What do you want to do?',
        burnerConflictOverwrite: "Overwrite existing file",
        burnerConflictAutoRename: "Use new name automatically",
        burnerConflictChooseNew: "Choose different location",

        // Disk Space Check
        burnerDiskSpaceTitle: "Insufficient disk space",
        burnerDiskSpaceDescription:
          "Target drive may not have enough space for the output file.",
        burnerDiskSpaceRequired: "Required (estimated)",
        burnerDiskSpaceAvailable: "Available",
        burnerDiskSpaceOutputLocation: "Output location",
        burnerDiskSpaceWarning:
          "Proceeding may corrupt the output file if disk runs out of space during encoding.",
        burnerDiskSpaceChangeLocation: "Change location",
        burnerDiskSpaceProceedAnyway: "Proceed anyway",
        burnerDiskSpaceSelectOutput: "Select output location...",
        burnerDiskSpaceEstimated: "Estimated size",
        burnerDiskSpaceLowWarning: "Low space!",

        // Queue Disk Space
        burnerQueueDiskSpaceTitle: "Disk space issues detected",
        burnerQueueDiskSpaceDescription:
          "{{count}} files in queue may have insufficient disk space on target drive.",
        burnerQueueDiskSpaceWarning:
          "Proceeding may cause encoding failures or corrupt output files.",

        // Queue Conflict Dialog
        burnerQueueConflictTitle: "Output file conflicts detected",
        burnerQueueConflictDescription:
          "{{count}} files in queue will be overwritten because output files already exist.",
        burnerQueueConflictAutoRename:
          "Rename automatically (add _1, _2, etc.)",
        burnerQueueConflictOverwrite: "Overwrite all existing files",

        // FFmpeg Download
        burnerFfmpegRequired: "FFmpeg is required",
        burnerFfmpegNotInstalled:
          "FFmpeg is not installed. Download and install to use subtitle burning feature.",
        burnerFfmpegDownload: "Download FFmpeg",
        burnerFfmpegDownloading: "Downloading FFmpeg...",
        burnerFfmpegExtracting: "Extracting FFmpeg...",
        burnerFfmpegInstalled: "FFmpeg installed successfully!",
        burnerFfmpegError: "FFmpeg download error",
        burnerFfmpegDownloadProgress: "Download progress",
        burnerFfmpegClose: "Close",
        burnerFfmpegRetry: "Retry",
        burnerFfmpegDescription:
          "FFmpeg is a powerful multimedia framework required for burning subtitles into videos. Download is about ~200MB and will be installed automatically.",
        burnerFfmpegSuccessDesc:
          "FFmpeg has been successfully installed. You can now use the subtitle burning feature.",
        burnerFfmpegErrorUnknown: "An unknown error occurred during download.",
        burnerFfmpegDownloadingStatus: "Downloading",
        burnerFfmpegStartingDownload: "Starting download...",

        // Output Settings
        burnerOutputDefaultsTitle: "Output Defaults",
        burnerOutputDefaultsDesc: "Configure default output file behavior",
        burnerOutputPrefix: "File name prefix",
        burnerOutputPrefixDesc: "Add prefix to output file name",
        burnerOutputPrefixPlaceholder: "e.g. sub_",
        burnerOutputDirectory: "Output directory",
        burnerOutputDirectoryDesc: "Save files to specified directory",
        burnerOutputDirectorySameAsSource: "Same as source",
        burnerOutputDirectoryCustom: "Custom directory",
        burnerOutputDirectorySelect: "Select directory",
      },
    },
  },
});
