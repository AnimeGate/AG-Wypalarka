/**
 * CollapsibleLogs
 *
 * Collapsible FFmpeg log viewer with preview when collapsed.
 */

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";

type LogType = "info" | "success" | "warning" | "error" | "debug" | "metadata";

interface LogEntry {
  log: string;
  type: LogType;
}

interface CollapsibleLogsProps {
  logs: LogEntry[];
  defaultOpen?: boolean;
  className?: string;
}

function getLogColor(type: LogType): string {
  switch (type) {
    case "error":
      return "text-red-500";
    case "warning":
      return "text-yellow-500";
    case "success":
      return "text-green-500";
    case "metadata":
      return "text-purple-400";
    case "debug":
      return "text-gray-500";
    case "info":
    default:
      return "text-blue-400";
  }
}

export function CollapsibleLogs({
  logs,
  defaultOpen = false,
  className,
}: CollapsibleLogsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive and expanded
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs, isOpen]);

  // Get last 2 logs for preview
  const previewLogs = logs.slice(-2);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("min-w-0 overflow-hidden rounded-lg border", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-between gap-2 px-3 py-2",
            isOpen && "rounded-b-none"
          )}
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("progressLogs", { defaultValue: "Logi FFmpeg" })}
            </span>
            {logs.length > 0 && (
              <span className="text-muted-foreground text-xs">
                ({logs.length})
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      {/* Preview when collapsed - show last 2 lines */}
      {!isOpen && previewLogs.length > 0 && (
        <div className="bg-muted/30 min-w-0 overflow-hidden border-t px-3 py-2 font-mono text-xs">
          {previewLogs.map((entry, index) => (
            <div
              key={logs.length - previewLogs.length + index}
              className={cn("truncate", getLogColor(entry.type))}
            >
              {entry.log}
            </div>
          ))}
        </div>
      )}

      <CollapsibleContent>
        <div className="bg-muted/20 overflow-hidden border-t">
          <ScrollArea ref={scrollRef} className="h-48">
            <div className="space-y-0.5 p-3 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground italic">
                  {t("burnerNoLogs", { defaultValue: "Brak logów..." })}
                </p>
              ) : (
                logs.map((entry, index) => (
                  <div
                    key={index}
                    className={cn("break-all", getLogColor(entry.type))}
                  >
                    {entry.log}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
