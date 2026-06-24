import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { RangeSlider } from '../ui/RangeSlider';
import { StatCard } from '../ui/StatCard';

interface Props {
  utilSlider: number;
  setUtilSlider: (val: number) => void;
  billableHrs: number;
  totalBillCap: number;
  ohRateHr: number;
  minRevBreakeven: number;
  fmt: (n: number) => string;
  fmtN: (n: number) => string;
}

export function UtilisationRate({ utilSlider, setUtilSlider, billableHrs, totalBillCap, ohRateHr, minRevBreakeven, fmt, fmtN }: Props) {
  const util = utilSlider / 100;
  const uClass = util >= 0.7 ? 'text-[#CCFF33]' : 'text-[#FFCC00]';

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Utilisation rate" 
        description="Set the realistic percentage of each person's monthly hours that will be billed to projects. Lower utilisation = higher cost per hour, because salaries and overhead are still paid on idle hours."
      />
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-8">
        <RangeSlider 
          label="Utilisation rate"
          value={utilSlider}
          min={30} max={100}
          onChange={setUtilSlider}
        />
        
        <div className="flex flex-wrap gap-3">
          {[
            { val: 50, label: '50% - low season' },
            { val: 70, label: '70% - typical' },
            { val: 85, label: '85% - busy' },
            { val: 100, label: '100% - fully booked' }
          ].map(btn => {
            const isActive = utilSlider === btn.val;
            return (
              <button 
                key={btn.val}
                onClick={() => setUtilSlider(btn.val)}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard label="Billable hrs / person" value={`${billableHrs} hrs`} valueClass={uClass} />
          <StatCard label="Total billable capacity" value={`${fmtN(totalBillCap)} hrs`} />
          <StatCard label="Overhead per billed hr" value={fmt(ohRateHr)} valueClass={uClass} />
          <StatCard label="Break-even revenue/mo" value={fmt(minRevBreakeven)} />
        </div>
      </div>
    </div>
  );
}
