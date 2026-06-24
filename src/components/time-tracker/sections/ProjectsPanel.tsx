import React from 'react';
import { Entry, Project, STAFF_NAMES } from '../types';
import { SectionWrapper } from '../../price-calculator/ui/SectionWrapper';
import { SectionHeader } from '../../price-calculator/ui/SectionHeader';
import { AlertMessage } from '../../price-calculator/ui/AlertMessage';

function getProjectEstHours(p: Project, staff?: string) {
  if (!p || !p.hours) return 0;
  if (staff) {
    const idx = STAFF_NAMES.indexOf(staff);
    return idx >= 0 ? (p.hours[idx] || 0) : 0;
  }
  return p.hours.reduce((a,b) => a+b, 0);
}

export function ProjectsPanel({ entries, projects }: { entries: Entry[], projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="space-y-8">
        <AlertMessage type="info" msg="No projects found in the project planner. Add projects in the Project Planner tool first, then time entries will link automatically." />
      </div>
    );
  }

  const activeProjects = projects.filter(p => ['Confirmed','In Progress'].includes(p.status || ''));
  const toShow = activeProjects.length ? activeProjects : projects.slice(0, 10);

  return (
    <div className="space-y-8">
      {toShow.map((p, i) => {
        const projEntries = entries.filter(e => e.projectId === p.id);
        const totalLogged = projEntries.reduce((a,e) => a+e.hours, 0);
        const totalEst = getProjectEstHours(p);
        const pct = totalEst > 0 ? Math.min(Math.round((totalLogged/totalEst)*100), 100) : 0;
        const over = totalEst > 0 && totalLogged > totalEst;
        const barColor = over ? '#ef4444' : pct > 80 ? '#eab308' : '#22c55e'; // danger, warning, success
        const variance = totalLogged - totalEst;

        const byStage: Record<string, number> = {};
        projEntries.forEach(e => { byStage[e.stage] = (byStage[e.stage]||0) + e.hours; });
        const topStages = Object.entries(byStage).sort((a,b)=>b[1]-a[1]).slice(0,4);

        const byStaff: Record<string, number> = {};
        projEntries.forEach(e => { byStaff[e.staff] = (byStaff[e.staff]||0) + e.hours; });

        let StatusTag = () => <span className="text-xs font-medium bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700">No logs yet</span>;
        if (projEntries.length > 0) {
          if (over) StatusTag = () => <span className="text-xs font-medium bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20">Over estimate</span>;
          else if (pct > 80) StatusTag = () => <span className="text-xs font-medium bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20">Near limit</span>;
          else StatusTag = () => <span className="text-xs font-medium bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">On track</span>;
        }

        return (
          <SectionWrapper key={p.id} stepNumber={`P${i+1}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <div className="text-sm text-zinc-400 mt-1">{p.client||'No client'} <span className="mx-2">·</span> {p.status||'Unknown status'}</div>
              </div>
              <StatusTag />
            </div>

            {totalEst > 0 ? (
              <div className="mb-6">
                <div className="flex justify-between items-end mb-3 text-sm">
                  <span className="font-medium text-white">Hours: <span style={{color: barColor}}>{totalLogged.toFixed(1)}</span> logged / {totalEst.toFixed(1)} estimated</span>
                  <span className={`text-xs ${over ? 'text-red-400' : 'text-zinc-400'}`}>
                    {over?'+':variance===0?'':''} {variance !== 0 ? (over?'+':'-') + Math.abs(variance).toFixed(1) + 'h variance' : 'exact'}
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden relative border border-zinc-700/50">
                  <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%`, backgroundColor: barColor }}></div>
                  {totalEst > 0 && <div className="absolute top-0 w-[2px] bg-white/50 h-full z-10" style={{ left: `${Math.min(100, Math.round((totalEst/Math.max(totalLogged, totalEst))*100))}%` }}></div>}
                </div>
                <div className="text-xs text-zinc-500 mt-2">{pct}% of estimate used</div>
              </div>
            ) : (
              <div className="text-sm text-zinc-400 mb-6">{totalLogged.toFixed(1)} hours logged · No estimate in planner</div>
            )}

            {(topStages.length > 0 || Object.keys(byStaff).length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-800">
                {topStages.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Time by stage</div>
                    <div className="space-y-3">
                      {topStages.map(([stage, hrs]) => (
                        <div key={stage} className="flex justify-between text-sm">
                          <span className="text-zinc-400">{stage}</span>
                          <span className="font-bold text-white">{hrs.toFixed(1)}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(byStaff).length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Staff hours</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(byStaff).map(([s,h]) => (
                        <span key={s} className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium">
                          {s}: <span className="text-white ml-1">{h.toFixed(1)}h</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionWrapper>
        );
      })}
    </div>
  );
}
