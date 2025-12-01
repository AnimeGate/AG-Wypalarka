/**
 * Burner Providers
 *
 * Combined provider component that wraps all burner contexts.
 * Use this at the top level of the burner feature to provide all contexts.
 */

import { type ReactNode } from "react";
import { FFmpegProvider } from "./FFmpegContext";
import { EncodingSettingsProvider } from "./EncodingSettingsContext";
import { QueueProvider } from "./QueueContext";
import { DialogProvider } from "./DialogContext";

interface BurnerProvidersProps {
  children: ReactNode;
}

/**
 * Wraps children with all burner-related context providers.
 *
 * Provider order (outer to inner):
 * 1. FFmpegProvider - Manages FFmpeg installation state
 * 2. EncodingSettingsProvider - Uses ffmpegInstalled for GPU detection
 * 3. QueueProvider - Queue state management
 * 4. DialogProvider - Dialog states (uses EncodingSettings for disk space checks)
 */
export function BurnerProviders({ children }: BurnerProvidersProps) {
  return (
    <FFmpegProvider>
      <EncodingSettingsProvider>
        <QueueProvider>
          <DialogProvider>{children}</DialogProvider>
        </QueueProvider>
      </EncodingSettingsProvider>
    </FFmpegProvider>
  );
}
