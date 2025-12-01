/**
 * SliderWithValue
 *
 * Reusable slider component with label and value display.
 */

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SliderWithValueProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function SliderWithValue({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  description,
  disabled = false,
  id,
}: SliderWithValueProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span className="text-muted-foreground text-sm font-medium tabular-nums">
          {displayValue}
        </span>
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
    </div>
  );
}
