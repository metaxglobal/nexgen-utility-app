import React, { useState, useEffect } from 'react';
import { Project, Entry, STAFF_NAMES } from '../types';
import { api } from '@/lib/api';
import { SectionWrapper } from '../../price-calculator/ui/SectionWrapper';
import { SectionHeader } from '../../price-calculator/ui/SectionHeader';
import { AlertMessage } from '../../price-calculator/ui/AlertMessage';
import { Edit02Icon, Delete02Icon, Calculator01Icon } from "hugeicons-react";

function getProjectEstHours(p: Project, staff?: string) {
  if (!p || !p.hours) return 0;
  if (staff) {
    const idx = STAFF_NAMES.indexOf(staff);
    return idx >= 0 ? (p.hours[idx] || 0) : 0;
  }
  return p.hours.reduce((a,b) => a+b, 0);
}

export function ProjectsPanel({ entries, projects, saveProjects }: { entries: Entry[], projects: Project[], saveProjects: (p: Project[]) => void }) {
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [editModalProject, setEditModalProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editActualPrice, setEditActualPrice] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showInhouse, setShowInhouse] = useState(false);

  useEffect(() => {
    if (editModalProject || deleteModalId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [editModalProject, deleteModalId]);

  if (projects.length === 0) {
    return (
      <div className="space-y-8">
        <AlertMessage type="info" msg="No projects found in the project planner. Add projects in the Project Planner tool first, then time entries will link automatically." />
      </div>
    );
  }

  const targetType = showInhouse ? 'inhouse' : 'client';
  const filteredByType = projects.filter(p => (p.type || 'client') === targetType);
  const activeProjects = filteredByType.filter(p => ['Confirmed','In Progress'].includes(p.status || ''));
  const inactiveProjects = filteredByType.filter(p => !['Confirmed','In Progress'].includes(p.status || ''));
  const toShow = showInactive ? inactiveProjects : activeProjects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full xl:w-auto">
          <button 
            onClick={() => setShowInhouse(false)}
            className={`flex-1 xl:flex-none px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${!showInhouse ? 'bg-[#CCFF33] text-black shadow-lg shadow-[#CCFF33]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            Client Projects
          </button>
          <button 
            onClick={() => setShowInhouse(true)}
            className={`flex-1 xl:flex-none px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${showInhouse ? 'bg-[#CCFF33] text-black shadow-lg shadow-[#CCFF33]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            Inhouse Projects
          </button>
        </div>
        <div className="flex items-center justify-between xl:justify-end gap-4 w-full xl:w-auto bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
          <div className="text-sm text-zinc-400 font-medium px-2">
            Showing {toShow.length} {showInactive ? 'inactive' : 'active'} projects
          </div>
          <button 
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${showInactive ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            {showInactive ? 'View Active' : 'View Inactive'}
          </button>
        </div>
      </div>

      {toShow.length === 0 && (
        <AlertMessage type="info" msg={`No ${showInactive ? 'inactive' : 'active'} ${targetType} projects found.`} />
      )}

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
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  {p.name}
                  {p.type !== 'inhouse' && (
                    <button onClick={() => {
                      localStorage.setItem('ngl_edit_project_id', p.id);
                      window.dispatchEvent(new CustomEvent('ngl_navigate', { detail: 'price' }));
                    }} className="text-zinc-500 hover:text-[#CCFF33] transition-colors p-1" title="Calculate Estimate">
                      <Calculator01Icon className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => {
                    setEditModalProject(p);
                    setEditName(p.name);
                    setEditClient(p.client || '');
                    setEditStatus(p.status || 'Confirmed');
                    setEditActualPrice(p.actualPrice ? p.actualPrice.toString() : '');
                  }} className="text-zinc-500 hover:text-blue-400 transition-colors p-1">
                    <Edit02Icon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteModalId(p.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                    <Delete02Icon className="w-4 h-4" />
                  </button>
                </h3>
                <div className="text-sm text-zinc-400 mt-1 mb-2">{p.client||'No client'} <span className="mx-2">·</span> {p.status||'Unknown status'}</div>
                {p.type !== 'inhouse' && (p.finalPrice !== undefined || (p.actualPrice !== undefined && !isNaN(Number(p.actualPrice)))) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {p.finalPrice !== undefined && !isNaN(Number(p.finalPrice)) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                        <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">System Quote</span>
                        <span className={`font-bold ${p.actualPrice && !isNaN(Number(p.actualPrice)) && Math.round(Number(p.actualPrice)) !== Math.round(Number(p.finalPrice)) ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          LKR {Math.round(Number(p.finalPrice)).toLocaleString('en-US')}
                        </span>
                      </div>
                    )}

                    {p.actualPrice !== undefined && !isNaN(Number(p.actualPrice)) && Number(p.actualPrice) > 0 && Math.round(Number(p.actualPrice)) !== Math.round(Number(p.finalPrice || 0)) && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#CCFF33]/10 border border-[#CCFF33]/30 text-xs">
                        <span className="text-[#CCFF33]/80 font-semibold uppercase tracking-wider text-[10px]">Actual Given</span>
                        <span className="font-bold text-[#CCFF33]">
                          LKR {Math.round(Number(p.actualPrice)).toLocaleString('en-US')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
              <div className="mb-6">
                <div className="flex justify-between items-end mb-3 text-sm">
                  <span className="font-medium text-white">Hours: <span style={{color: '#CCFF33'}}>{totalLogged.toFixed(1)}</span> logged</span>
                  <span className="text-xs text-zinc-400">Inhouse Project (No limit)</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-[#CCFF33] transition-all" style={{ width: '100%' }}></div>
                </div>
              </div>
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

                {STAFF_NAMES.some((s, idx) => (byStaff[s] || 0) > 0 || (p.hours && p.hours[idx] > 0)) && (
                  <div>
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Staff Analysis</div>
                    <div className="grid grid-cols-1 gap-3">
                      {STAFF_NAMES.map((s, idx) => {
                        const est = p.hours ? p.hours[idx] || 0 : 0;
                        const logged = byStaff[s] || 0;
                        if (est === 0 && logged === 0) return null;
                        
                        const over = est > 0 && logged > est;
                        const pct = est > 0 ? Math.min(Math.round((logged / est) * 100), 100) : 0;
                        const barColor = over ? '#ef4444' : pct > 80 ? '#eab308' : '#22c55e';
                        
                        return (
                          <div key={s} className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl text-sm">
                            <div className="flex justify-between items-end mb-2">
                              <span className="font-bold text-white">{s}</span>
                              <span className="text-xs text-zinc-400">
                                <span className={over ? 'text-red-400 font-bold' : 'text-white'}>{logged.toFixed(1)}h</span> / {est > 0 ? `${est.toFixed(1)}h` : '0h'}
                              </span>
                            </div>
                            {est > 0 ? (
                              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }}></div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider">Unplanned</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionWrapper>
        );
      })}

      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setDeleteModalId(null)}>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-zinc-400 mb-8">Are you sure you want to delete this project? This cannot be undone, though existing time entries will still keep the project name text.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setDeleteModalId(null)} className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={() => {
                saveProjects(projects.filter(x => x.id !== deleteModalId));
                api.deleteProject(deleteModalId);
                setDeleteModalId(null);
              }} className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Delete Project</button>
            </div>
          </div>
        </div>
      )}

      {editModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditModalProject(null)}>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-6">Edit Project</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Project Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF33] transition-colors text-sm" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Client Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF33] transition-colors text-sm" value={editClient} onChange={e => setEditClient(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Status</label>
                <select className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF33] transition-colors text-sm" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Actual Given Price (LKR)</label>
                <input type="number" placeholder="e.g. 280000" className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF33] transition-colors text-sm" value={editActualPrice} onChange={e => setEditActualPrice(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setEditModalProject(null)} className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={() => {
                if (!editName.trim() || !editClient.trim()) return alert('Name and Client are required.');
                const parsedPrice = parseFloat(editActualPrice);
                const updatedProj = { ...editModalProject, name: editName, client: editClient, status: editStatus, actualPrice: isNaN(parsedPrice) ? undefined : parsedPrice };
                saveProjects(projects.map(p => p.id === editModalProject.id ? updatedProj : p));
                api.updateProject(updatedProj);
                setEditModalProject(null);
              }} className="px-6 py-3 rounded-xl bg-[#CCFF33] text-black font-bold hover:bg-[#b3e62d] transition-colors shadow-[0_0_15px_rgba(204,255,51,0.3)]">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
