import React, { useEffect } from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";
import { useBackground } from "@/helpers/background_helpers";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { background } = useBackground();

  const showBackground = background.enabled && background.imageData;

  // Toggle class on html element for glassmorphism card styling
  useEffect(() => {
    if (showBackground) {
      document.documentElement.classList.add("has-custom-bg");
    } else {
      document.documentElement.classList.remove("has-custom-bg");
    }
    return () => {
      document.documentElement.classList.remove("has-custom-bg");
    };
  }, [showBackground]);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Background image layer */}
      {showBackground && (
        <>
          {/* Background image */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${background.imageData}")`,
            }}
          />
          {/* Dark overlay for readability */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-background"
            style={{
              opacity: background.opacity,
            }}
          />
        </>
      )}

      {/* Content layer */}
      <div className="relative z-10 flex h-full flex-col overflow-hidden">
        {/* Window drag region (title bar) */}
        <div className="flex-shrink-0">
          <DragWindowRegion title={t("appName")} />
        </div>

        {/* Navigation bar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
