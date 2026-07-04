import React from 'react';
import { Entry, STAFF_NAMES } from '../types';
import { SectionWrapper } from '../../price-calculator/ui/SectionWrapper';
import { SectionHeader } from '../../price-calculator/ui/SectionHeader';
import { StatCard } from '../../price-calculator/ui/StatCard';

export function TodayPanel({ entries }: { entries: Entry[] }) {
  const [dateVal, setDateVal] = React.useState(new Date().toISOString().split('T')[0]);
  const [staffVal, setStaffVal] = React.useState('');

  let filtered = entries.filter(e => e.date === dateVal);
  if (staffVal) filtered = filtered.filter(e => e.staff === staffVal);

  const totalHrs = filtered.reduce((a,e) => a + e.hours, 0);
  const staffSet = [...new Set(filtered.map(e => e.staff))];
  const projSet = [...new Set(filtered.map(e => e.projectName))];

  const byStaff: Record<string, Entry[]> = {};
  filtered.forEach(e => {
    if (!byStaff[e.staff]) byStaff[e.staff] = [];
    byStaff[e.staff].push(e);
  });

  const inputClass = "bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#CCFF33] focus:bg-zinc-800 transition-colors text-sm w-full md:w-auto";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
        <select className={inputClass} value={staffVal} onChange={e => setStaffVal(e.target.value)}>
          <option value="">All staff</option>
          {STAFF_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" className={inputClass} value={dateVal} onChange={e => setDateVal(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total hours" value={totalHrs.toFixed(1)} />
        <StatCard label="Entries" value={filtered.length.toString()} />
        <StatCard label="Staff active" value={staffSet.length.toString()} />
        <StatCard label="Projects touched" value={projSet.length.toString()} />
      </div>

      <SectionWrapper stepNumber="03">
        <SectionHeader title="Entries for selected day" />
        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/50 rounded-2xl border border-zinc-800/50">No entries for this date.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byStaff).map(([staff, ents]) => {
                const total = ents.reduce((a,e) => a + e.hours, 0);
                return (
                  <div key={staff} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="flex justify-between items-center bg-zinc-800/50 px-5 py-3 border-b border-zinc-800/80">
                      <span className="font-bold text-white">{staff}</span>
                      <span className="text-xs font-medium text-[#CCFF33] bg-[#CCFF33]/10 px-3 py-1 rounded-full">{total.toFixed(1)}h total</span>
                    </div>
                    <div className="divide-y divide-zinc-800/80">
                      {ents.sort((a,b) => a.start.localeCompare(b.start)).map(e => (
                        <div key={e.id} className="flex flex-col md:flex-row gap-2 md:gap-6 px-5 py-4 items-start md:items-center text-sm">
                          <div className="text-zinc-500 font-medium min-w-[120px] text-xs">
                            {e.start && e.end ? `${e.start}–${e.end}` : `${e.hours.toFixed(1)}h`}
                          </div>
                          <div className="flex-1">
                            <div className="text-zinc-200">{e.desc}</div>
                            <div className="text-xs text-zinc-500 mt-1">{e.stage} <span className="mx-1">·</span> <span className="text-[#CCFF33]/80">{e.projectName}</span></div>
                          </div>
                          <div className="font-bold text-white mt-2 md:mt-0">
                            {e.hours.toFixed(1)}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}
