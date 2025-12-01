/**
 * AdvancedTab
 *
 * Advanced encoder settings: codec, preset, rate control, CQ, AQ options, lookahead.
 */

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SliderWithValue } from "./SliderWithValue";
import type { EncodingSettings } from "../BurnerSettings";

interface AdvancedTabProps {
  settings: EncodingSettings;
  onSettingsChange: (settings: EncodingSettings) => void;
  disabled?: boolean;
}

const PRESET_LABELS: Record<number, string> = {
  1: "p1 (najszybszy)",
  2: "p2",
  3: "p3",
  4: "p4 (zbalansowany)",
  5: "p5",
  6: "p6",
  7: "p7 (najwolniejszy)",
};

export function AdvancedTab({
  settings,
  onSettingsChange,
  disabled,
}: AdvancedTabProps) {
  const { t } = useTranslation();

  const handleCodecChange = (value: string) => {
    onSettingsChange({
      ...settings,
      codec: value as EncodingSettings["codec"],
    });
  };

  const handlePresetChange = (value: number) => {
    onSettingsChange({
      ...settings,
      preset: `p${value}` as EncodingSettings["preset"],
    });
  };

  const handleRcModeChange = (value: string) => {
    onSettingsChange({
      ...settings,
      qualityMode: value as EncodingSettings["qualityMode"],
    });
  };

  const handleCqChange = (value: number) => {
    onSettingsChange({
      ...settings,
      cq: value,
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

  const handleRcLookahead = (value: number) => {
    onSettingsChange({
      ...settings,
      rcLookahead: value,
    });
  };

  // Get current preset as number (1-7)
  const currentPreset = parseInt((settings.preset ?? "p4").replace("p", ""), 10);
  const showCqSlider =
    settings.qualityMode === "cq" ||
    settings.qualityMode === "vbr_hq" ||
    settings.qualityMode === undefined;

  return (
    <div className="space-y-5 py-2">
      {/* Codec */}
      <div className="space-y-1.5">
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
        <p className="text-muted-foreground text-xs">{t("burnerEncoderCodecDesc")}</p>
      </div>

      {/* Encoder Preset Slider */}
      <SliderWithValue
        label={t("burnerEncoderPreset")}
        value={currentPreset}
        onChange={handlePresetChange}
        min={1}
        max={7}
        step={1}
        formatValue={(v) => PRESET_LABELS[v] || `p${v}`}
        description={t("burnerEncoderPresetDesc")}
        disabled={disabled}
      />

      {/* Rate Control Mode */}
      <div className="space-y-1.5">
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
            <SelectItem value="cq">{t("burnerRateControlCQ")}</SelectItem>
            <SelectItem value="vbr">{t("burnerRateControlVBR")}</SelectItem>
            <SelectItem value="vbr_hq">{t("burnerRateControlVBRHQ")}</SelectItem>
            <SelectItem value="cbr">{t("burnerRateControlCBR")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">{t("burnerRateControlDesc")}</p>
      </div>

      {/* CQ Value Slider (only for CQ/VBR_HQ modes) */}
      {showCqSlider && (
        <SliderWithValue
          label={t("burnerCQ")}
          value={settings.cq ?? 19}
          onChange={handleCqChange}
          min={1}
          max={51}
          step={1}
          formatValue={(v) => `${v} (${v <= 15 ? t("settingsCqBest", { defaultValue: "najlepsza" }) : v >= 35 ? t("settingsCqWorst", { defaultValue: "najgorsza" }) : t("settingsCqGood", { defaultValue: "dobra" })})`}
          description={t("burnerCQDesc")}
          disabled={disabled}
        />
      )}

      {/* AQ Options (side by side) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t("settingsAqOptions", { defaultValue: "Adaptacyjna kwantyzacja" })}
        </Label>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="spatial-aq"
              checked={settings.spatialAQ ?? true}
              onCheckedChange={handleSpatialAQ}
              disabled={disabled}
            />
            <Label htmlFor="spatial-aq" className="cursor-pointer text-sm font-normal">
              {t("burnerSpatialAQ")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="temporal-aq"
              checked={settings.temporalAQ ?? true}
              onCheckedChange={handleTemporalAQ}
              disabled={disabled}
            />
            <Label htmlFor="temporal-aq" className="cursor-pointer text-sm font-normal">
              {t("burnerTemporalAQ")}
            </Label>
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          {t("burnerSpatialAQDesc")}
        </p>
      </div>

      {/* RC Lookahead Slider */}
      <SliderWithValue
        label={t("burnerRcLookahead")}
        value={settings.rcLookahead ?? 20}
        onChange={handleRcLookahead}
        min={0}
        max={64}
        step={1}
        formatValue={(v) => `${v} ${t("settingsFrames", { defaultValue: "klatek" })}`}
        description={t("burnerRcLookaheadDesc")}
        disabled={disabled}
      />
    </div>
  );
}
