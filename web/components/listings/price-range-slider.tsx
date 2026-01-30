"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface PriceRangeSliderProps {
  min: string;
  max: string;
  onChange: (min: string, max: string) => void;
}

const SLIDER_MIN = 0;
const SLIDER_MAX = 2000;

function snapToStep(value: number): number {
  if (value <= 200) {
    return Math.round(value / 10) * 10;
  }
  return Math.round(value / 50) * 50;
}

function clamp(value: number): number {
  return Math.max(SLIDER_MIN, Math.min(value, SLIDER_MAX));
}

export function PriceRangeSlider({ min, max, onChange }: PriceRangeSliderProps) {
  const propsValue = useMemo<[number, number]>(() => {
    const parsedMin = min ? parseInt(min, 10) : SLIDER_MIN;
    const parsedMax = max ? parseInt(max, 10) : SLIDER_MAX;
    return [
      clamp(Number.isNaN(parsedMin) ? SLIDER_MIN : parsedMin),
      clamp(Number.isNaN(parsedMax) ? SLIDER_MAX : parsedMax),
    ];
  }, [min, max]);

  // Track whether the user is currently dragging
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState<[number, number]>(propsValue);
  const isDragging = useRef(false);

  const displayValue = dragging ? dragValue : propsValue;

  const handleSliderChange = useCallback((values: number[]) => {
    if (!isDragging.current) {
      isDragging.current = true;
      setDragging(true);
    }
    const snappedMin = snapToStep(values[0]);
    const snappedMax = snapToStep(values[1]);
    setDragValue([snappedMin, snappedMax]);
  }, []);

  const handleSliderCommit = useCallback(
    (values: number[]) => {
      isDragging.current = false;
      setDragging(false);
      const snappedMin = snapToStep(values[0]);
      const snappedMax = snapToStep(values[1]);
      onChange(
        snappedMin === SLIDER_MIN ? "" : String(snappedMin),
        snappedMax >= SLIDER_MAX ? "" : String(snappedMax)
      );
    },
    [onChange]
  );

  const isMaxCapped = displayValue[1] >= SLIDER_MAX;

  return (
    <div className="space-y-3">
      <Slider
        value={displayValue}
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        step={1}
        minStepsBetweenThumbs={1}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        className="py-2"
      />
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>€{displayValue[0].toLocaleString()}</span>
        <span>
          {isMaxCapped
            ? `€${displayValue[1].toLocaleString()}+`
            : `€${displayValue[1].toLocaleString()}`}
        </span>
      </div>
    </div>
  );
}
