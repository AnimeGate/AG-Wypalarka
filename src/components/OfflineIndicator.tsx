import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { toast } from "sonner";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Offline Indicator Component
 *
 * Shows a toast notification when the app goes offline/online
 * Uses i18next for internationalized messages
 */
export function OfflineIndicator() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const isInitialMount = useRef(true);
  const wasOffline = useRef(false);

  useEffect(() => {
    // Skip showing "back online" toast on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      wasOffline.current = !isOnline;
      return;
    }

    if (!isOnline) {
      wasOffline.current = true;
      toast.error(t("offlineTitle"), {
        description: t("offlineDescription"),
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
        id: "offline-status",
      });
    } else if (wasOffline.current) {
      // Only show "back online" if we were previously offline
      wasOffline.current = false;
      toast.dismiss("offline-status");

      toast.success(t("onlineTitle"), {
        description: t("onlineDescription"),
        icon: <Wifi className="h-4 w-4" />,
        duration: 3000,
        id: "online-status",
      });
    }
  }, [isOnline, t]);

  return null;
}
