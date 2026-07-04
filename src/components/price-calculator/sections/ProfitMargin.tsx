import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { RangeSlider } from '../ui/RangeSlider';

interface Props {
  marginSlider: number;
  setMarginSlider: (val: number) => void;
}

export function ProfitMargin({ marginSlider, setMarginSlider }: Props) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Profit margin" />
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-8">
        <RangeSlider 
          label="Select margin"
          value={marginSlider}
          min={5} max={100}
          onChange={setMarginSlider}
        />
        
        <div className="flex flex-wrap gap-3">
          {[
            { val: 20, label: '20% - conservative' },
            { val: 35, label: '35% - standard' },
            { val: 50, label: '50% - premium' },
            { val: 75, label: '75% - high-value' }
          ].map(btn => {
            const isActive = marginSlider === btn.val;
            return (
              <button 
                key={btn.val}
                onClick={() => setMarginSlider(btn.val)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#CCFF33] border-[#CCFF33] text-black shadow-[0_0_15px_rgba(204,255,51,0.4)]' 
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
