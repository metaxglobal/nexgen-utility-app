import React, { useState } from 'react';
import { Entry, STAFF_NAMES } from '../types';
import { SectionWrapper } from '../../price-calculator/ui/SectionWrapper';
import { SectionHeader } from '../../price-calculator/ui/SectionHeader';
import { StatCard } from '../../price-calculator/ui/StatCard';

function daysAgo(n: number) { 
  const d = new Date(); d.setDate(d.getDate()-n); 
  return d.toISOString().split('T')[0]; 
}

export function TeamPanel({ entries }: { entries: Entry[] }) {
  const [period, setPeriod] = useState('30');

  const cutoff = period === 'all' ? '2000-01-01' : daysAgo(parseInt(period));
  const filtered = entries.filter(e => e.date >= cutoff);

  const totalHrs = filtered.reduce((a,e) => a+e.hours, 0);
  const activeDays = [...new Set(filtered.map(e => e.date))].length;
  const avgDaily = filtered.length > 0 ? totalHrs / Math.max(1, activeDays) : 0;

  const rows = STAFF_NAMES.map(s => {
    const se = filtered.filter(e => e.staff === s);
    const hrs = se.reduce((a,e) => a+e.hours, 0);
    const projs = [...new Set(se.map(e => e.projectName))];
    const stageMap: Record<string, number> = {};
    se.forEach(e => { stageMap[e.stage] = (stageMap[e.stage] || 0) + e.hours; });
    const topStage = Object.entries(stageMap).sort((a,b) => b[1]-a[1])[0];
    return { s, hrs, count: se.length, projs, topStage };
  }).sort((a,b) => b.hrs - a.hrs);

  const inputClass = "bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#CCFF33] focus:bg-zinc-800 transition-colors text-sm";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
        <select className={inputClass} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total hours logged" value={totalHrs.toFixed(1)} />
        <StatCard label="Total entries" value={filtered.length.toString()} />
        <StatCard label="Avg hours/day" value={avgDaily.toFixed(1)} />
        <StatCard label="Days with logs" value={activeDays.toString()} />
      </div>

      <SectionWrapper stepNumber="04">
        <SectionHeader title="Hours by staff member" />
        <div className="mt-8 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-5 gap-4 bg-zinc-900/80 px-6 py-4 rounded-t-2xl border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <div>Staff member</div>
              <div>Total hours</div>
              <div>Entries</div>
              <div>Projects</div>
              <div>Most time on</div>
            </div>
            {rows.length === 0 || totalHrs === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/50 rounded-b-2xl border border-t-0 border-zinc-800/50">No entries in this period.</div>
            ) : (
              <div className="bg-zinc-900/30 border border-t-0 border-zinc-800 rounded-b-2xl divide-y divide-zinc-800/80">
                {rows.filter(r => r.hrs > 0 || period === 'all').map(r => (
                  <div key={r.s} className="grid grid-cols-5 gap-4 items-center px-6 py-5 text-sm hover:bg-zinc-800/30 transition-colors">
                    <div className="font-bold text-white">{r.s}</div>
                    <div className="text-[#CCFF33] font-medium">{r.hrs.toFixed(1)}h</div>
                    <div className="text-zinc-400">{r.count}</div>
                    <div className="flex flex-wrap gap-1">
                      {r.projs.length > 0 ? r.projs.map(p => (
                        <span key={p} className="text-xs bg-zinc-800/50 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700/50">{p}</span>
                      )) : <span className="text-zinc-500">-</span>}
                    </div>
                    <div className="text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-lg w-fit">
                      {r.topStage ? r.topStage[0] : '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
