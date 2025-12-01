/**
 * SettingsModal
 *
 * Main encoding settings modal with tabbed interface.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EncodingSettings } from "../BurnerSettings";
import { GeneralTab } from "./GeneralTab";
import { ProfileTab } from "./ProfileTab";
import { AdvancedTab } from "./AdvancedTab";

interface SettingsModalProps {
  settings: EncodingSettings;
  onSettingsChange: (settings: EncodingSettings) => void;
  disabled?: boolean;
  gpuAvailable?: boolean;
  gpuInfo?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsModal({
  settings,
  onSettingsChange,
  disabled,
  gpuAvailable,
  gpuInfo,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

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
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {t("burnerEncodingSettings")}
          </DialogTitle>
          <DialogDescription>
            {t("burnerEncodingSettingsDesc")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              {t("settingsTabGeneral", { defaultValue: "Ogólne" })}
            </TabsTrigger>
            <TabsTrigger value="profile">
              {t("settingsTabProfile", { defaultValue: "Profile" })}
            </TabsTrigger>
            <TabsTrigger value="advanced">
              {t("settingsTabAdvanced", { defaultValue: "Zaawansowane" })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <GeneralTab
              settings={settings}
              onSettingsChange={onSettingsChange}
              disabled={disabled}
              gpuAvailable={gpuAvailable}
              gpuInfo={gpuInfo}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <ProfileTab
              settings={settings}
              onSettingsChange={onSettingsChange}
              disabled={disabled}
            />
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <AdvancedTab
              settings={settings}
              onSettingsChange={onSettingsChange}
              disabled={disabled}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
