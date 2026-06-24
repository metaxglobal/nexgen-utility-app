import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';

interface Props {
  totalHrs: number;
  staffCost: number;
  oh: number;
  total: number;
  fmt: (n: number) => string;
}

export function CostSummary({ totalHrs, staffCost, oh, total, fmt }: Props) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Cost summary" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-800/40 rounded-2xl p-6 border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Total hours</div>
          <div className="text-2xl font-medium text-white">{totalHrs} hrs</div>
        </div>
        <div className="bg-zinc-800/40 rounded-2xl p-6 border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Staff cost</div>
          <div className="text-2xl font-medium text-white">{fmt(staffCost)}</div>
        </div>
        <div className="bg-zinc-800/40 rounded-2xl p-6 border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Overhead</div>
          <div className="text-2xl font-medium text-white">{fmt(oh)}</div>
        </div>
        <div className="bg-zinc-800/40 rounded-2xl p-6 border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Total cost</div>
          <div className="text-2xl font-medium text-white">{fmt(total)}</div>
        </div>
      </div>
    </div>
  );
}
