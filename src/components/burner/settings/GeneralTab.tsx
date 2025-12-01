/**
 * GeneralTab
 *
 * General settings tab: output defaults and hardware acceleration.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EncodingSettings } from "../BurnerSettings";

interface GeneralTabProps {
  settings: EncodingSettings;
  onSettingsChange: (settings: EncodingSettings) => void;
  disabled?: boolean;
  gpuAvailable?: boolean;
  gpuInfo?: string;
}

export function GeneralTab({
  settings,
  onSettingsChange,
  disabled,
  gpuAvailable,
  gpuInfo,
}: GeneralTabProps) {
  const { t } = useTranslation();

  // Output defaults state
  const [outputLocationMode, setOutputLocationMode] = useState<
    "same_as_input" | "input_subfolder" | "custom_folder"
  >("same_as_input");
  const [outputCustomFolder, setOutputCustomFolder] = useState<string | null>(null);
  const [outputPrefix, setOutputPrefix] = useState<string>("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");

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

  const handleHardwareAccelChange = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      useHardwareAccel: checked,
    });
  };

  const handleSaveDefaults = async () => {
    setSaveState("saving");
    try {
      await (window as any).settingsAPI?.updateOutput?.({
        locationMode: outputLocationMode,
        customFolder: outputLocationMode === "custom_folder" ? outputCustomFolder : null,
        filenamePrefix: outputPrefix,
      });
      (window as any).debugAPI?.success?.("Output defaults saved");
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      (window as any).debugAPI?.error?.(`Failed to save output defaults: ${String(e)}`);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const handleSelectFolder = async () => {
    const folder = await (window as any).settingsAPI?.selectOutputFolder?.();
    if (folder) {
      setOutputCustomFolder(folder);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Output Defaults Section */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t("saveLocation", { defaultValue: "Miejsce zapisu" })}</Label>
          <Select
            value={outputLocationMode}
            onValueChange={(v) => setOutputLocationMode(v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="same_as_input">
                {t("saveSameAsInput", { defaultValue: "Jak plik źródłowy" })}
              </SelectItem>
              <SelectItem value="input_subfolder">
                {t("saveInputSubfolder", { defaultValue: "Folder 'wypalone' obok pliku" })}
              </SelectItem>
              <SelectItem value="custom_folder">
                {t("saveCustomFolder", { defaultValue: "Własny folder" })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {outputLocationMode === "custom_folder" && (
          <div className="space-y-1.5">
            <Label>{t("chooseFolder", { defaultValue: "Folder docelowy" })}</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={outputCustomFolder || ""}
                placeholder={t("noFolderSelected", { defaultValue: "Nie wybrano" }) as string}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleSelectFolder}>
                {t("choose", { defaultValue: "Wybierz" })}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{t("filenamePrefix", { defaultValue: "Prefiks nazwy pliku" })}</Label>
          <Input
            value={outputPrefix}
            onChange={(e) => setOutputPrefix(e.target.value)}
            placeholder="np. subbed_"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={saveState === "saving"}
            onClick={handleSaveDefaults}
          >
            {saveState === "saving"
              ? t("saving", { defaultValue: "Zapisywanie..." })
              : t("saveOutputDefaults", { defaultValue: "Zapisz domyślne" })}
          </Button>
          {saveState === "success" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              {t("saved", { defaultValue: "Zapisano" })}
            </span>
          )}
          {saveState === "error" && (
            <span className="text-destructive flex items-center gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              {t("saveFailed", { defaultValue: "Błąd zapisu" })}
            </span>
          )}
        </div>
      </div>

      {/* Hardware Acceleration Section */}
      <div className="border-t pt-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="hardware-accel"
            checked={settings.useHardwareAccel}
            onCheckedChange={handleHardwareAccelChange}
            disabled={disabled}
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
            <div className="mt-2 space-y-2">
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
                  <div className="bg-muted/50 space-y-1 rounded-md p-2 text-xs">
                    <p className="font-medium">{t("burnerGpuSetupTitle")}</p>
                    <ul className="text-muted-foreground list-inside list-disc space-y-0.5">
                      <li>{t("burnerGpuSetup1")}</li>
                      <li>{t("burnerGpuSetup2")}</li>
                      <li>{t("burnerGpuSetup3")}</li>
                    </ul>
                    <a
                      href="https://developer.nvidia.com/cuda-downloads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-1 inline-flex items-center gap-1 hover:underline"
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
              <p className="text-muted-foreground text-xs">
                <span className="font-medium">{t("burnerGpuInfo")}:</span> {gpuInfo}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
