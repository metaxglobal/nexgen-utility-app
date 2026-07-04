import React, { useState } from 'react';
import { Entry, STAFF_NAMES, STAGE_COLORS } from '../types';
import { SectionWrapper } from '../../price-calculator/ui/SectionWrapper';
import { SectionHeader } from '../../price-calculator/ui/SectionHeader';
import { AlertMessage } from '../../price-calculator/ui/AlertMessage';

function daysAgo(n: number) { 
  const d = new Date(); d.setDate(d.getDate()-n); 
  return d.toISOString().split('T')[0]; 
}

export function TaskAnalysisPanel({ entries }: { entries: Entry[] }) {
  const [period, setPeriod] = useState('30');
  const [staffFilter, setStaffFilter] = useState('');

  const cutoff = period === 'all' ? '2000-01-01' : daysAgo(parseInt(period));
  let filtered = entries.filter(e => e.date >= cutoff);
  if (staffFilter) filtered = filtered.filter(e => e.staff === staffFilter);

  const totalHrs = filtered.reduce((a,e) => a+e.hours, 0);
  const stageMap: Record<string, number> = {};
  filtered.forEach(e => { stageMap[e.stage] = (stageMap[e.stage] || 0) + e.hours; });
  const sorted = Object.entries(stageMap).sort((a,b) => b[1]-a[1]);

  const insightList: {type: 'success'|'warning'|'info'|'danger', title: string, body: string}[] = [];

  const revisions = filtered.filter(e=>e.stage==='Client Review & Revisions');
  const revHrs = revisions.reduce((a,e)=>a+e.hours,0);
  const revPct = totalHrs > 0 ? Math.round((revHrs/totalHrs)*100) : 0;
  if (revPct > 15) insightList.push({ type:'warning', title:'High revision time', body:`${revPct}% of hours (${revHrs.toFixed(1)}h) spent on client reviews and revisions. Above 15% suggests scope clarity or expectation-setting can be improved at the discovery stage.` });

  const bugs = filtered.filter(e=>e.stage==='Bug Fixing');
  const bugHrs = bugs.reduce((a,e)=>a+e.hours,0);
  const bugPct = totalHrs > 0 ? Math.round((bugHrs/totalHrs)*100) : 0;
  if (bugPct > 10) insightList.push({ type:'warning', title:'Elevated bug-fixing time', body:`${bugPct}% of hours (${bugHrs.toFixed(1)}h) on bug fixing. Above 10% suggests more testing time is needed earlier in the process, or that QA handoffs need tightening.` });

  const comms = filtered.filter(e=>e.stage==='Client Communication'||e.stage==='Project Management');
  const commHrs = comms.reduce((a,e)=>a+e.hours,0);
  const commPct = totalHrs > 0 ? Math.round((commHrs/totalHrs)*100) : 0;
  if (commPct > 20) insightList.push({ type:'warning', title:'High overhead time', body:`${commPct}% of hours on communication and project management. Above 20% is a signal to standardise client update schedules and use templates to reduce ad-hoc communication overhead.` });

  const design = filtered.filter(e=>e.stage==='UI/UX Design');
  const devFront = filtered.filter(e=>e.stage==='Frontend Development');
  const designHrs = design.reduce((a,e)=>a+e.hours,0);
  const devHrs = devFront.reduce((a,e)=>a+e.hours,0);
  if (designHrs > 0 && devHrs > 0) {
    const ratio = Math.round((devHrs/designHrs)*10)/10;
    if (ratio < 1.5) insightList.push({ type:'info', title:'Design-to-development ratio', body:`Current ratio: ${ratio}x development per design hour. Industry benchmark is 2–3x. A lower ratio may indicate design is taking longer than expected, or development is moving fast. Monitor across projects.` });
  }

  const qa = filtered.filter(e=>e.stage==='Testing & QA');
  const qaHrs = qa.reduce((a,e)=>a+e.hours,0);
  const qaPct = totalHrs > 0 ? Math.round((qaHrs/totalHrs)*100) : 0;
  if (qaPct < 5 && totalHrs > 20) insightList.push({ type:'info', title:'Low QA time', body:`Only ${qaPct}% of hours (${qaHrs.toFixed(1)}h) on Testing & QA. Industry recommendation is 15–20%. Under-investing in QA early typically increases bug-fixing time later.` });

  if (insightList.length === 0) {
    insightList.push({ type:'success', title:'Looking good', body:'No significant efficiency issues detected in this period. Keep logging consistently for more detailed insights as more data accumulates.' });
  }

  const inputClass = "bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#CCFF33] focus:bg-zinc-800 transition-colors text-sm";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
        <select className={inputClass} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
        <select className={inputClass} value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
          <option value="">All staff</option>
          {STAFF_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <SectionWrapper stepNumber="05">
        <SectionHeader title="Time distribution by task stage" />
        <div className="mt-8">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/50 rounded-2xl border border-zinc-800/50">No entries in this period.</div>
          ) : (
            <div className="bg-zinc-900/50 p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
              {sorted.map(([stage, hrs]) => {
                const pct = totalHrs > 0 ? Math.round((hrs/totalHrs)*100) : 0;
                const color = STAGE_COLORS[stage] || '#a1a1aa';
                return (
                  <div key={stage}>
                    <div className="flex justify-between items-end mb-2 text-sm">
                      <span className="font-bold text-white">{stage}</span>
                      <span className="text-zinc-400 font-medium">{hrs.toFixed(1)}h <span className="mx-2 text-zinc-600">·</span> {pct}%</span>
                    </div>
                    <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper stepNumber="06">
        <SectionHeader title="Work study insights" description="Automated analysis of time distribution patterns." />
        <div className="mt-8 space-y-4">
          {insightList.map((i, idx) => (
            <AlertMessage key={idx} type={i.type} msg={
              <span><strong className="font-bold text-white block mb-1">{i.title}</strong> {i.body}</span>
            } />
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
