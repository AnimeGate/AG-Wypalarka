import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommandDialog } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Settings2,
  Zap,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import type { EncodingSettings } from "./BurnerSettings";

interface BurnerSettingsModalProps {
  settings: EncodingSettings;
  onSettingsChange: (settings: EncodingSettings) => void;
  disabled?: boolean;
  gpuAvailable?: boolean;
  gpuInfo?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QUALITY_PRESETS = {
  ultra: {
    bitrate: "6000k",
    label: "Ultra (6000k)",
    description: "Best quality, large file",
  },
  high: {
    bitrate: "4000k",
    label: "High (4000k)",
    description: "Great quality",
  },
  medium: {
    bitrate: "2400k",
    label: "Medium (2400k)",
    description: "Balanced",
  },
  low: {
    bitrate: "1200k",
    label: "Low (1200k)",
    description: "Small file, web",
  },
  custom: {
    bitrate: "custom",
    label: "Custom",
    description: "Set your own bitrate",
  },
};

export function BurnerSettingsModal({
  settings,
  onSettingsChange,
  disabled,
  gpuAvailable,
  gpuInfo,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BurnerSettingsModalProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [localBitrate, setLocalBitrate] = useState(settings.customBitrate);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  // Output defaults (persisted via settingsAPI)
  const [outputLocationMode, setOutputLocationMode] = useState<
    "same_as_input" | "custom_folder"
  >("same_as_input");
  const [outputCustomFolder, setOutputCustomFolder] = useState<string | null>(
    null,
  );
  const [outputPrefix, setOutputPrefix] = useState<string>("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // Load existing output defaults
  useEffect(() => {
    (async () => {
      try {
        const out = await (window as any).settingsAPI?.getOutput?.();
        if (out) {
          setOutputLocationMode(out.locationMode);
          setOutputCustomFolder(out.customFolder);
          setOutputPrefix(out.filenamePrefix || "");
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handlePresetChange = (preset: string) => {
    const newSettings = {
      ...settings,
      qualityPreset: preset as EncodingSettings["qualityPreset"],
    };

    if (preset !== "custom") {
      newSettings.customBitrate =
        QUALITY_PRESETS[preset as keyof typeof QUALITY_PRESETS].bitrate;
      setLocalBitrate(newSettings.customBitrate);
    }

    onSettingsChange(newSettings);
  };

  const applyProfile = (profile: string) => {
    // Map simple profiles to underlying settings
    const s = {
      ...settings,
      profile: profile as EncodingSettings["profile"],
    } as EncodingSettings;
    // Clear any previous scale settings
    s.scaleWidth = undefined;
    s.scaleHeight = undefined;

    switch (profile) {
      case "1080p":
        // Standard 1080p output (no scaling)
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "2400k";
        s.spatialAQ = true;
        s.temporalAQ = true;
        s.rcLookahead = 20;
        break;
      case "1080p_downscale":
        // For 4K sources → 1080p
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "2400k";
        s.spatialAQ = true;
        s.temporalAQ = true;
        s.rcLookahead = 20;
        s.scaleWidth = 1920;
        s.scaleHeight = 1080;
        break;
      case "1080p_cinema":
        // 1920x804 for ~2.39:1 letterbox
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "2400k";
        s.spatialAQ = true;
        s.temporalAQ = true;
        s.rcLookahead = 20;
        s.scaleWidth = 1920;
        s.scaleHeight = 804;
        break;
      case "4k":
        // Standard 4K output (no scaling)
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "6M";
        s.spatialAQ = true;
        s.temporalAQ = true;
        s.rcLookahead = 20;
        break;
      case "4k_cinema":
        // 3840x1608 for ~2.39:1 letterbox in 4K
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "6M";
        s.spatialAQ = true;
        s.temporalAQ = true;
        s.rcLookahead = 20;
        s.scaleWidth = 3840;
        s.scaleHeight = 1608;
        break;
      default:
        s.profile = "custom";
        break;
    }
    onSettingsChange(s);
  };

  const handleBitrateChange = (value: string) => {
    setLocalBitrate(value);
    onSettingsChange({
      ...settings,
      customBitrate: value,
    });
  };

  const handleHardwareAccelChange = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      useHardwareAccel: checked,
    });
  };

  const handleCodecChange = (value: string) => {
    onSettingsChange({
      ...settings,
      codec: value as EncodingSettings["codec"],
    });
  };

  const handlePresetChangeEncoder = (value: string) => {
    onSettingsChange({
      ...settings,
      preset: value as EncodingSettings["preset"],
    });
  };

  const handleRcModeChange = (value: string) => {
    onSettingsChange({
      ...settings,
      qualityMode: value as EncodingSettings["qualityMode"],
    });
  };

  const handleCqChange = (value: string) => {
    const parsed = parseInt(value, 10);
    onSettingsChange({
      ...settings,
      cq: Number.isFinite(parsed) ? parsed : undefined,
    });
  };

  const handleSpatialAQ = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      spatialAQ: checked,
    });
  };

  const handleTemporalAQ = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      temporalAQ: checked,
    });
  };

  const handleRcLookahead = (value: string) => {
    const parsed = parseInt(value, 10);
    onSettingsChange({
      ...settings,
      rcLookahead: Number.isFinite(parsed) ? parsed : undefined,
    });
  };

  const currentPreset = QUALITY_PRESETS[settings.qualityPreset];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          title={t("burnerEncodingSettings")}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-[min(92vw,720px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {t("burnerEncodingSettings")}
          </DialogTitle>
          <DialogDescription>
            {t("burnerEncodingSettingsDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Output Defaults */}
          <div className="space-y-3">
            <Label>
              {t("outputDefaults", {
                defaultValue: "Domyślne wyjście / Output defaults",
              })}
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label>
                  {t("saveLocation", {
                    defaultValue: "Miejsce zapisu / Save location",
                  })}
                </Label>
                <Select
                  value={outputLocationMode}
                  onValueChange={(v) => setOutputLocationMode(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same_as_input">
                      {t("saveSameAsInput", {
                        defaultValue: "Jak plik źródłowy / Same as input",
                      })}
                    </SelectItem>
                    <SelectItem value="input_subfolder">
                      {t("saveInputSubfolder", {
                        defaultValue:
                          "Folder 'wypalone' obok pliku / 'wypalone' subfolder",
                      })}
                    </SelectItem>
                    <SelectItem value="custom_folder">
                      {t("saveCustomFolder", {
                        defaultValue: "Własny folder / Custom folder",
                      })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {outputLocationMode === "custom_folder" && (
                <div className="space-y-1">
                  <Label>
                    {t("chooseFolder", {
                      defaultValue: "Wybierz folder / Choose folder",
                    })}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={outputCustomFolder || ""}
                      placeholder={
                        t("noFolderSelected", {
                          defaultValue: "Nie wybrano / Not selected",
                        }) as string
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const folder = await (
                          window as any
                        ).settingsAPI?.selectOutputFolder?.();
                        if (folder) {
                          setOutputCustomFolder(folder);
                        }
                      }}
                    >
                      {t("choose", { defaultValue: "Wybierz / Choose" })}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label>
                  {t("filenamePrefix", {
                    defaultValue: "Prefiks nazwy pliku / Filename prefix",
                  })}
                </Label>
                <Input
                  value={outputPrefix}
                  onChange={(e) => setOutputPrefix(e.target.value)}
                  placeholder="e.g. subbed_"
                />
              </div>

              <div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saveState === "saving"}
                  onClick={async () => {
                    setSaveState("saving");
                    try {
                      await (window as any).settingsAPI?.updateOutput?.({
                        locationMode: outputLocationMode,
                        customFolder:
                          outputLocationMode === "custom_folder"
                            ? outputCustomFolder
                            : null,
                        filenamePrefix: outputPrefix,
                      });
                      (window as any).debugAPI?.success?.(
                        "Output defaults saved",
                      );
                      setSaveState("success");
                      setTimeout(() => setSaveState("idle"), 2000);
                    } catch (e) {
                      (window as any).debugAPI?.error?.(
                        `Failed to save output defaults: ${String(e)}`,
                      );
                      setSaveState("error");
                      setTimeout(() => setSaveState("idle"), 3000);
                    }
                  }}
                >
                  {saveState === "saving"
                    ? t("saving", {
                        defaultValue: "Zapisywanie... / Saving...",
                      })
                    : t("saveOutputDefaults", {
                        defaultValue: "Zapisz domyślne / Save defaults",
                      })}
                </Button>
                {saveState === "success" && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("saved", { defaultValue: "Zapisano domyślne / Saved" })}
                  </div>
                )}
                {saveState === "error" && (
                  <div className="text-destructive mt-2 flex items-center gap-2 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {t("saveFailed", {
                      defaultValue: "Nie udało się zapisać / Save failed",
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Profiles (Command dialog only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>{t("burnerProfile")}</Label>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3">
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">
                        {t("burnerProfileHelpTitle")}
                      </p>
                      <ul className="text-muted-foreground space-y-1.5">
                        <li>
                          <span className="text-foreground font-medium">
                            1080p
                          </span>{" "}
                          – {t("burnerProfileHelp1080p")}
                        </li>
                        <li>
                          <span className="text-foreground font-medium">
                            1080p (downscale)
                          </span>{" "}
                          – {t("burnerProfileHelp1080pDownscale")}
                        </li>
                        <li>
                          <span className="text-foreground font-medium">
                            1080p Cinema
                          </span>{" "}
                          – {t("burnerProfileHelp1080pCinema")}
                        </li>
                        <li>
                          <span className="text-foreground font-medium">
                            4K
                          </span>{" "}
                          – {t("burnerProfileHelp4k")}
                        </li>
                        <li>
                          <span className="text-foreground font-medium">
                            4K Cinema
                          </span>{" "}
                          – {t("burnerProfileHelp4kCinema")}
                        </li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="outline"
              type="button"
              className="w-full justify-start"
              onClick={() => setProfileDialogOpen(true)}
            >
              {(() => {
                const p = settings.profile ?? "custom";
                switch (p) {
                  case "1080p":
                    return t("burnerProfile1080p");
                  case "1080p_downscale":
                    return t("burnerProfile1080pDownscale");
                  case "1080p_cinema":
                    return t("burnerProfile1080pCinema");
                  case "4k":
                    return t("burnerProfile4k");
                  case "4k_cinema":
                    return t("burnerProfile4kCinema");
                  default:
                    return t("burnerProfileCustom");
                }
              })()}
            </Button>
            <p className="text-muted-foreground text-xs">
              {t("burnerProfileDesc")}
            </p>
            <CommandDialog
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
              onSelect={(value) => applyProfile(value)}
              groups={[
                {
                  title: "1080p",
                  items: [
                    {
                      value: "1080p",
                      label: t("burnerProfile1080p") as string,
                    },
                    {
                      value: "1080p_downscale",
                      label: t("burnerProfile1080pDownscale") as string,
                    },
                    {
                      value: "1080p_cinema",
                      label: t("burnerProfile1080pCinema") as string,
                    },
                  ],
                },
                {
                  title: "4K",
                  items: [
                    { value: "4k", label: t("burnerProfile4k") as string },
                    {
                      value: "4k_cinema",
                      label: t("burnerProfile4kCinema") as string,
                    },
                  ],
                },
                {
                  title: t("burnerProfileCustom") as string,
                  items: [
                    {
                      value: "custom",
                      label: t("burnerProfileCustom") as string,
                    },
                  ],
                },
              ]}
            />
          </div>
          {/* Quality Preset (bitrate presets) - only enabled when profile is "custom" */}
          <div className="space-y-3">
            <Label htmlFor="quality-preset">
              {t("burnerQualityPreset")}
            </Label>
            <Select
              value={settings.qualityPreset}
              onValueChange={handlePresetChange}
              disabled={
                (settings.profile !== "custom" &&
                  settings.profile !== undefined) ||
                settings.qualityMode === "cq" ||
                settings.qualityMode === "vbr_hq"
              }
            >
              <SelectTrigger id="quality-preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ultra">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("burnerQualityUltra")}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("burnerQualityHigh")}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("burnerQualityMedium")}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("burnerQualityLow")}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("burnerQualityCustom")}
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {currentPreset.description}
            </p>
            {settings.profile !== "custom" &&
              settings.profile !== undefined && (
                <p className="text-muted-foreground text-xs">
                  {t("burnerQualityPresetLockedByProfile")}
                </p>
              )}
            {(settings.qualityMode === "cq" ||
              settings.qualityMode === "vbr_hq") && (
              <p className="text-muted-foreground text-xs">
                {t("bitrateNotUsedCQVBRHQ")}
              </p>
            )}
          </div>

          {/* Custom Bitrate Input - only shown when profile is "custom" or undefined, and qualityPreset is "custom" */}
          {(settings.profile === "custom" || settings.profile === undefined) &&
            settings.qualityPreset === "custom" && (
              <div className="space-y-3">
                <Label htmlFor="custom-bitrate">
                  {t("burnerCustomBitrate")}
                </Label>
                <Input
                  id="custom-bitrate"
                  type="text"
                  placeholder="e.g., 3000k or 5M"
                  value={localBitrate}
                  onChange={(e) => handleBitrateChange(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  {t("burnerCustomBitrateDesc")}
                </p>
              </div>
            )}

          {/* Hardware Acceleration & Advanced */}
          <div className="space-y-3 border-t pt-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="hardware-accel"
                checked={settings.useHardwareAccel}
                onCheckedChange={handleHardwareAccelChange}
              />
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="hardware-accel"
                  className="flex cursor-pointer items-center gap-2 font-medium"
                >
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {t("burnerHardwareAccel")}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t("burnerHardwareAccelDesc")}
                </p>

                {/* GPU Status */}
                <div className="mt-2">
                  {gpuAvailable === true && (
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("burnerGpuAvailable")}
                    </Badge>
                  )}
                  {gpuAvailable === false && (
                    <div className="space-y-2">
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {t("burnerGpuNotAvailable")}
                      </Badge>
                      <div className="bg-muted/50 space-y-1 rounded-md p-3 text-xs">
                        <p className="font-medium">
                          {t("burnerGpuSetupTitle")}
                        </p>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                          <li>{t("burnerGpuSetup1")}</li>
                          <li>{t("burnerGpuSetup2")}</li>
                          <li>{t("burnerGpuSetup3")}</li>
                        </ul>
                        <a
                          href="https://developer.nvidia.com/cuda-downloads"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary mt-2 inline-flex items-center gap-1 hover:underline"
                        >
                          {t("burnerGpuDownload")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  {gpuAvailable === undefined && (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t("burnerGpuDetecting")}
                    </Badge>
                  )}
                </div>

                {gpuInfo && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    <span className="font-medium">
                      {t("burnerGpuInfo")}:
                    </span>{" "}
                    {gpuInfo}
                  </p>
                )}
              </div>
            </div>

            {/* Advanced section (collapsible) */}
            <details className="pt-2">
              <summary className="cursor-pointer text-sm font-medium select-none">
                {t("burnerAdvancedSettings", {
                  defaultValue: "Zaawansowane / Advanced",
                })}
              </summary>
              <div className="mt-3 space-y-4">
                {/* Advanced encoder controls */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label>{t("burnerEncoderCodec")}</Label>
                    <Select
                      value={settings.codec ?? "h264"}
                      onValueChange={handleCodecChange}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h264">H.264</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      {t("burnerEncoderCodecDesc")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label>{t("burnerEncoderPreset")}</Label>
                    <Select
                      value={settings.preset ?? "p4"}
                      onValueChange={handlePresetChangeEncoder}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">
                          {t("burnerEncoderPresetP1")}
                        </SelectItem>
                        <SelectItem value="p2">
                          {t("burnerEncoderPresetP2")}
                        </SelectItem>
                        <SelectItem value="p3">
                          {t("burnerEncoderPresetP3")}
                        </SelectItem>
                        <SelectItem value="p4">
                          {t("burnerEncoderPresetP4")}
                        </SelectItem>
                        <SelectItem value="p5">
                          {t("burnerEncoderPresetP5")}
                        </SelectItem>
                        <SelectItem value="p6">
                          {t("burnerEncoderPresetP6")}
                        </SelectItem>
                        <SelectItem value="p7">
                          {t("burnerEncoderPresetP7")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      {t("burnerEncoderPresetDesc")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label>{t("burnerRateControl")}</Label>
                    <Select
                      value={settings.qualityMode ?? "vbr_hq"}
                      onValueChange={handleRcModeChange}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cq">
                          {t("burnerRateControlCQ")}
                        </SelectItem>
                        <SelectItem value="vbr">
                          {t("burnerRateControlVBR")}
                        </SelectItem>
                        <SelectItem value="vbr_hq">
                          {t("burnerRateControlVBRHQ")}
                        </SelectItem>
                        <SelectItem value="cbr">
                          {t("burnerRateControlCBR")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      {t("burnerRateControlDesc")}
                    </p>
                  </div>
                  {(settings.qualityMode === "cq" ||
                    settings.qualityMode === "vbr_hq" ||
                    settings.qualityMode === undefined) && (
                    <div className="space-y-1">
                      <Label>{t("burnerCQ")}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={51}
                        step={1}
                        value={settings.cq ?? 19}
                        onChange={(e) => handleCqChange(e.target.value)}
                      />
                      <p className="text-muted-foreground text-xs">
                        {t("burnerCQDesc")}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="spatial-aq"
                        checked={settings.spatialAQ ?? true}
                        onCheckedChange={handleSpatialAQ}
                      />
                      <Label htmlFor="spatial-aq">
                        {t("burnerSpatialAQ")}
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="temporal-aq"
                        checked={settings.temporalAQ ?? true}
                        onCheckedChange={handleTemporalAQ}
                      />
                      <Label htmlFor="temporal-aq">
                        {t("burnerTemporalAQ")}
                      </Label>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t("burnerSpatialAQDesc")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("burnerTemporalAQDesc")}
                  </p>
                  <div className="space-y-1">
                    <Label>{t("burnerRcLookahead")}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={64}
                      step={1}
                      value={settings.rcLookahead ?? 20}
                      onChange={(e) => handleRcLookahead(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      {t("burnerRcLookaheadDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
