import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface EncodingSettings {
  qualityPreset: "ultra" | "high" | "medium" | "low" | "custom";
  customBitrate: string;
  useHardwareAccel: boolean;
  // Extended options (optional; configured in Settings Modal)
  profile?:
    | "custom"
    | "1080p"
    | "1080p_downscale"
    | "1080p_cinema"
    | "4k"
    | "4k_cinema";
  codec?: "h264";
  preset?: "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7";
  qualityMode?: "cq" | "vbr" | "vbr_hq" | "cbr";
  cq?: number;
  spatialAQ?: boolean;
  temporalAQ?: boolean;
  rcLookahead?: number;
  // Optional scaling
  scaleWidth?: number;
  scaleHeight?: number;
}

interface BurnerSettingsProps {
  settings: EncodingSettings;
  onSettingsChange: (settings: EncodingSettings) => void;
  disabled?: boolean;
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

export function BurnerSettings({
  settings,
  onSettingsChange,
  disabled,
}: BurnerSettingsProps) {
  const { t } = useTranslation();
  const [localBitrate, setLocalBitrate] = useState(settings.customBitrate);

  const handlePresetChange = (preset: string) => {
    const newSettings = {
      ...settings,
      qualityPreset: preset as EncodingSettings["qualityPreset"],
    };

    // If not custom, update the custom bitrate field to match preset
    if (preset !== "custom") {
      newSettings.customBitrate =
        QUALITY_PRESETS[preset as keyof typeof QUALITY_PRESETS].bitrate;
      setLocalBitrate(newSettings.customBitrate);
    }

    onSettingsChange(newSettings);
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

  const currentPreset = QUALITY_PRESETS[settings.qualityPreset];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          {t("burnerEncodingSettings")}
        </CardTitle>
        <CardDescription>{t("burnerEncodingSettingsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Preset */}
        <div className="space-y-2">
          <Label htmlFor="quality-preset">{t("burnerQualityPreset")}</Label>
          <Select
            value={settings.qualityPreset}
            onValueChange={handlePresetChange}
            disabled={disabled}
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
        </div>

        {/* Custom Bitrate Input */}
        {settings.qualityPreset === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="custom-bitrate">
              {t("burnerCustomBitrate")}
            </Label>
            <Input
              id="custom-bitrate"
              type="text"
              placeholder="e.g., 3000k or 5M"
              value={localBitrate}
              onChange={(e) => handleBitrateChange(e.target.value)}
              disabled={disabled}
            />
            <p className="text-muted-foreground text-xs">
              {t("burnerCustomBitrateDesc")}
            </p>
          </div>
        )}

        {/* Hardware Acceleration */}
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="hardware-accel"
            checked={settings.useHardwareAccel}
            onCheckedChange={handleHardwareAccelChange}
            disabled={disabled}
          />
          <div className="space-y-1 leading-none">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
