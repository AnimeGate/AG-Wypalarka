/**
 * ProfileTab
 *
 * Profile settings tab: resolution profiles, quality presets, and bitrate.
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "react-i18next";
import { SliderWithValue } from "./SliderWithValue";
import type { EncodingSettings } from "../BurnerSettings";

interface ProfileTabProps {
  settings: EncodingSettings;
  onSettingsChange: (settings: EncodingSettings) => void;
  disabled?: boolean;
}

const PROFILES = [
  { value: "1080p", labelKey: "burnerProfile1080p" },
  { value: "1080p_downscale", labelKey: "burnerProfile1080pDownscale" },
  { value: "1080p_cinema", labelKey: "burnerProfile1080pCinema" },
  { value: "4k", labelKey: "burnerProfile4k" },
  { value: "4k_cinema", labelKey: "burnerProfile4kCinema" },
  { value: "custom", labelKey: "burnerProfileCustom" },
] as const;

const QUALITY_PRESETS = {
  ultra: { bitrate: 6000, label: "Ultra (6000k)" },
  high: { bitrate: 4000, label: "High (4000k)" },
  medium: { bitrate: 2400, label: "Medium (2400k)" },
  low: { bitrate: 1200, label: "Low (1200k)" },
  custom: { bitrate: 0, label: "Custom" },
};

export function ProfileTab({
  settings,
  onSettingsChange,
  disabled,
}: ProfileTabProps) {
  const { t } = useTranslation();

  const applyProfile = (profile: string) => {
    const s = {
      ...settings,
      profile: profile as EncodingSettings["profile"],
      scaleWidth: undefined,
      scaleHeight: undefined,
    } as EncodingSettings;

    switch (profile) {
      case "1080p":
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
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "6000k";
        s.spatialAQ = true;
        s.temporalAQ = true;
        s.rcLookahead = 20;
        break;
      case "4k_cinema":
        s.useHardwareAccel = true;
        s.codec = "h264";
        s.preset = "p4";
        s.qualityMode = "vbr";
        s.customBitrate = "6000k";
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

  const handlePresetChange = (preset: string) => {
    const presetConfig = QUALITY_PRESETS[preset as keyof typeof QUALITY_PRESETS];
    onSettingsChange({
      ...settings,
      qualityPreset: preset as EncodingSettings["qualityPreset"],
      customBitrate: preset !== "custom" ? `${presetConfig.bitrate}k` : settings.customBitrate,
    });
  };

  // Parse bitrate value (handles "2400k" or "6M" formats)
  const parseBitrate = (bitrate: string): number => {
    const clean = bitrate.toLowerCase().trim();
    if (clean.endsWith("m")) {
      return parseFloat(clean) * 1000;
    }
    if (clean.endsWith("k")) {
      return parseFloat(clean);
    }
    return parseFloat(clean);
  };

  const handleBitrateSliderChange = (value: number) => {
    onSettingsChange({
      ...settings,
      customBitrate: `${value}k`,
      qualityPreset: "custom",
    });
  };

  const currentBitrate = parseBitrate(settings.customBitrate);
  const isCustomProfile = settings.profile === "custom" || !settings.profile;
  const showBitrateSlider =
    settings.qualityMode !== "cq" && settings.qualityMode !== "vbr_hq";

  return (
    <div className="space-y-6 py-2">
      {/* Profile Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t("burnerProfile")}
        </Label>
        <RadioGroup
          value={settings.profile || "custom"}
          onValueChange={applyProfile}
          className="grid grid-cols-2 gap-2"
          disabled={disabled}
        >
          {PROFILES.map((profile) => (
            <div key={profile.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={profile.value}
                id={`profile-${profile.value}`}
              />
              <Label
                htmlFor={`profile-${profile.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {t(profile.labelKey)}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-muted-foreground text-xs">
          {t("burnerProfileDesc")}
        </p>
      </div>

      {/* Quality Preset (only when profile is custom) */}
      {isCustomProfile && (
        <div className="space-y-2">
          <Label>{t("burnerQualityPreset")}</Label>
          <Select
            value={settings.qualityPreset}
            onValueChange={handlePresetChange}
            disabled={disabled || !isCustomProfile}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ultra">{t("burnerQualityUltra")}</SelectItem>
              <SelectItem value="high">{t("burnerQualityHigh")}</SelectItem>
              <SelectItem value="medium">{t("burnerQualityMedium")}</SelectItem>
              <SelectItem value="low">{t("burnerQualityLow")}</SelectItem>
              <SelectItem value="custom">{t("burnerQualityCustom")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Bitrate Slider - only show for custom profile */}
      {showBitrateSlider && isCustomProfile && (
        <SliderWithValue
          label={t("burnerCustomBitrate", { defaultValue: "Bitrate" })}
          value={Math.round(currentBitrate)}
          onChange={handleBitrateSliderChange}
          min={1000}
          max={8000}
          step={100}
          formatValue={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}M` : `${v}k`)}
          disabled={disabled}
        />
      )}

      {/* Info when bitrate is not used */}
      {!showBitrateSlider && (
        <p className="text-muted-foreground text-xs">
          {t("bitrateNotUsedCQVBRHQ", {
            defaultValue: "Bitrate nie jest używany w trybie CQ/VBR_HQ",
          })}
        </p>
      )}
    </div>
  );
}
