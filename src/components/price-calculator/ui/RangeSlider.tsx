import React from 'react';

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export function RangeSlider({ label, value, min, max, step = 1, onChange, formatValue = v => `${v}%` }: RangeSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="text-base text-zinc-400 sm:min-w-[140px]">{label}</span>
      <input 
        type="range" min={min} max={max} step={step} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer w-full 
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:w-6 
          [&::-webkit-slider-thumb]:h-6 
          [&::-webkit-slider-thumb]:bg-[#CCFF33] 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:border-[3px] 
          [&::-webkit-slider-thumb]:border-zinc-900
          [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(204,255,51,0.5)]
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:w-6 
          [&::-moz-range-thumb]:h-6 
          [&::-moz-range-thumb]:bg-[#CCFF33] 
          [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:border-[3px] 
          [&::-moz-range-thumb]:border-zinc-900
          [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(204,255,51,0.5)]"
        style={{
          background: `linear-gradient(to right, #CCFF33 ${percentage}%, #27272a ${percentage}%)`
        }}
      />
      <span className="text-lg font-medium text-white sm:min-w-[50px] sm:text-right">{formatValue(value)}</span>
    </div>
  );
}
