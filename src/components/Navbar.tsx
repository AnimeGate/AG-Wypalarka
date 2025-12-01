import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import SettingsModal from "./SettingsModal";
import { ChangelogHistoryDialog } from "./ChangelogHistoryDialog";
import { debugLog } from "@/helpers/debug-logger";

export default function Navbar() {
  const { t } = useTranslation();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Log route changes
  useEffect(() => {
    debugLog.route(`Navigated to: ${currentPath}`);
  }, [currentPath]);

  return (
    <nav className="bg-card/50 border-b backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary text-xl font-bold">
              {t("appName")}
            </span>
          </Link>
        </div>

        {/* Right: Changelog & Settings */}
        <div className="flex items-center gap-1">
          <ChangelogHistoryDialog />
          <SettingsModal />
        </div>
      </div>
    </nav>
  );
}
