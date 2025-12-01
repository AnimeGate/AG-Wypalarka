import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FolderOpen, HardDrive } from "lucide-react";

interface DiskSpaceDialogProps {
  open: boolean;
  availableFormatted: string;
  requiredFormatted: string;
  driveLetter: string;
  outputPath: string;
  onProceed: () => void;
  onChangeLocation: () => void;
  onCancel: () => void;
}

export function DiskSpaceDialog({
  open,
  availableFormatted,
  requiredFormatted,
  driveLetter,
  outputPath,
  onProceed,
  onChangeLocation,
  onCancel,
}: DiskSpaceDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("burnerDiskSpaceTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("burnerDiskSpaceDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted grid grid-cols-2 gap-4 rounded-lg p-4">
            <div>
              <p className="text-muted-foreground text-sm">
                {t("burnerDiskSpaceRequired")}
              </p>
              <p className="text-lg font-semibold">{requiredFormatted}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                {t("burnerDiskSpaceAvailable")}
              </p>
              <p className="text-lg font-semibold text-destructive">
                {availableFormatted}
              </p>
            </div>
          </div>

          <div className="text-sm">
            <div className="text-muted-foreground mb-1 flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {t("burnerDiskSpaceOutputLocation")}
            </div>
            <p className="truncate font-mono text-xs" title={outputPath}>
              {driveLetter} - {outputPath}
            </p>
          </div>

          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
            <p className="text-destructive text-sm">
              <AlertTriangle className="mr-1 inline h-4 w-4" />
              {t("burnerDiskSpaceWarning")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={onChangeLocation}
            className="justify-start"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            {t("burnerDiskSpaceChangeLocation")}
          </Button>

          <Button
            variant="destructive"
            onClick={onProceed}
            className="justify-start"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t("burnerDiskSpaceProceedAnyway")}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {t("burnerCancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
