import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';

interface StaffMember {
  name: string;
  role: string;
  salary: number;
}
interface Props {
  staff: StaffMember[];
  hours: number[];
  staffCosts: number[];
  billableHrs: number;
  updateHour: (index: number, val: string) => void;
  fmt: (n: number) => string;
}

export function StaffAllocation({ staff, hours, staffCosts, billableHrs, updateHour, fmt }: Props) {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Staff hours allocation"
        description="Available billable hours per person are adjusted by the utilisation rate above."
      />

      <div className="grid gap-4">
        {staff.map((s, i) => {
          const h = hours[i];
          const isOver = h > billableHrs;

          return (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1.1fr] gap-6 md:gap-8 items-center">
              <div>
                <div className="text-lg font-medium text-white">{s.name}</div>
                <div className="text-sm text-zinc-400 mt-1">{s.role}</div>
                <div className={`text-sm mt-2 font-medium ${isOver ? 'text-red-400' : 'text-[#CCFF33]'}`}>
                  {isOver ? `Over by ${Math.round(h - billableHrs)} hrs (max ${billableHrs} hrs)` : `${billableHrs} hrs available this month`}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-2">Hours allocated</div>
                <input 
                  type="number" min="0" max="999" step="0.5"
                  value={h.toString()}
                  onChange={(e) => updateHour(i, e.target.value)}
                  className={`w-full px-5 py-3 bg-zinc-800/50 border rounded-xl text-lg outline-none transition-colors ${isOver ? 'border-red-500/50 text-white focus:border-red-400 focus:ring-1 focus:ring-red-400' : 'border-zinc-700 text-white focus:border-[#CCFF33] focus:ring-1 focus:ring-[#CCFF33]'}`}
                />
              </div>
              <div className="md:text-right">
                <div className="text-sm text-zinc-400 mb-2">Cost for project</div>
                <div className="text-lg font-medium text-white">{fmt(staffCosts[i])}</div>
                <div className="text-sm text-zinc-500 mt-1 min-h-[20px]">{h > 0 ? `${h} hrs` : ''}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
