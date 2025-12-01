/**
 * ProgressRing
 *
 * Animated SVG circular progress indicator with percentage and ETA display.
 */

import { cn } from "@/utils/tailwind";

interface ProgressRingProps {
  percentage: number;
  eta?: string | null;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  percentage,
  eta,
  size = 180,
  strokeWidth = 8,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-300 ease-out"
          style={{
            filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))",
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">
          {percentage.toFixed(1)}%
        </span>
        {eta && (
          <span className="text-muted-foreground mt-1 text-sm">
            ETA: {eta}
          </span>
        )}
      </div>
    </div>
  );
}
