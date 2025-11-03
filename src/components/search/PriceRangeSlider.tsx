"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  value?: [number, number];
  onChangeAction?: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 0,
  max = 10000000,
  value = [min, max],
  onChangeAction,
  formatValue = (val) => `${val.toLocaleString('vi-VN')}₫`,
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(rangeValue);
    onChangeAction?.(rangeValue);
  };

  return (
    <div className="space-y-4">
      {/* Slider with value labels */}
      <div className="relative pt-8 pb-2">
        {/* Value labels above thumbs */}
        <div className="relative w-full h-6 mb-2">
          <div
            className="absolute -translate-x-1/2 -top-2"
            style={{
              left: `${((localValue[0] - min) / (max - min)) * 100}%`,
            }}
          >
            <div className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
              {formatValue(localValue[0])}
            </div>
          </div>
          <div
            className="absolute -translate-x-1/2 -top-2"
            style={{
              left: `${((localValue[1] - min) / (max - min)) * 100}%`,
            }}
          >
            <div className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
              {formatValue(localValue[1])}
            </div>
          </div>
        </div>

        {/* Slider component */}
        <Slider
          min={min}
          max={max}
          step={100000}
          value={localValue}
          onValueChange={handleValueChange}
          className="w-full"
        />
      </div>

      {/* Range display below slider */}
      <div className="text-sm text-gray-600 text-center">
        <span className="font-medium">Range: </span>
        <span>
          {formatValue(localValue[0])} - {formatValue(localValue[1])}
        </span>
      </div>
    </div>
  );
};
