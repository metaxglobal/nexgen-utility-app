import React, { useState, useEffect } from 'react';
import { Entry, Project, STAFF_NAMES, STAGES } from '../types';
import { api } from '@/lib/api';
import { SectionWrapper } from '../../price-calculator/ui/SectionWrapper';
import { SectionHeader } from '../../price-calculator/ui/SectionHeader';
import { AlertMessage } from '../../price-calculator/ui/AlertMessage';
import { Delete02Icon, Clock01Icon, Edit02Icon } from "hugeicons-react";

function calcHours(start: string, end: string) {
  if (!start || !end) return 0;
  const [sh,sm] = start.split(':').map(Number);
  const [eh,em] = end.split(':').map(Number);
  const diff = (eh*60+em)-(sh*60+sm);
  return diff > 0 ? Math.round(diff/60*4)/4 : 0;
}

export function LogTimePanel({ entries, projects, saveEntries }: { entries: Entry[], projects: Project[], saveEntries: (e: Entry[]) => void }) {
  const [staff, setStaff] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [projectId, setProjectId] = useState('');
  const [stage, setStage] = useState('');
  const [desc, setDesc] = useState('');
  const [hoursInput, setHoursInput] = useState<string>('');
  const [editModalEntry, setEditModalEntry] = useState<Entry | null>(null);
  const [editHoursInput, setEditHoursInput] = useState<string>('');
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{msg: string, type: 'success'|'warning'|'danger'|'info'} | null>(null);

  useEffect(() => {
    const h = calcHours(start, end);
    if(h > 0) setHoursInput(h.toString());
  }, [start, end]);

  useEffect(() => {
    if (editModalEntry) {
      const h = calcHours(editModalEntry.start, editModalEntry.end);
      if(h > 0) setEditHoursInput(h.toString());
    }
  }, [editModalEntry?.start, editModalEntry?.end]);

  useEffect(() => {
    if (editModalEntry || deleteModalId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [editModalEntry, deleteModalId]);

  const showAlert = (msg: string, type: 'success'|'warning'|'danger'|'info') => {
    setAlert({msg, type});
    setTimeout(() => setAlert(null), 4000);
  };

  const getProjectName = (id: string) => {
    const p = projects.find(x => x.id === id);
    return p ? p.name : id;
  };

  const handleSave = () => {
    if (!staff || !date || !projectId || !stage || !desc) {
      showAlert('Please fill in all required fields.', 'warning'); return;
    }
    const hIn = parseFloat(hoursInput);
    const hours = hIn > 0 ? hIn : calcHours(start, end);
    if (hours <= 0 || isNaN(hours)) { showAlert('Please enter a valid time range or hours.', 'warning'); return; }

    const entry: Entry = {
      id: Date.now(),
      staff, date,
      start: start || '', end: end || '',
      hours,
      projectId,
      projectName: getProjectName(projectId),
      stage, desc,
      loggedAt: new Date().toISOString()
    };
    
    saveEntries([entry, ...entries]);
    api.saveEntry(entry);
    showAlert(`Entry saved - ${Math.round(hours * 10) / 10} hr${hours !== 1 ? 's' : ''} logged for ${entry.projectName}.`, 'success');
    clearForm();
  };

  const handleUpdate = () => {
    if (!editModalEntry) return;
    if (!editModalEntry.staff || !editModalEntry.date || !editModalEntry.projectId || !editModalEntry.stage || !editModalEntry.desc) {
      showAlert('Please fill in all required fields.', 'warning'); return;
    }
    const hIn = parseFloat(editHoursInput);
    const hours = hIn > 0 ? hIn : calcHours(editModalEntry.start, editModalEntry.end);
    if (hours <= 0 || isNaN(hours)) { showAlert('Please enter a valid time range or hours.', 'warning'); return; }

    const updatedEntry: Entry = {
      ...editModalEntry,
      hours,
      projectName: getProjectName(editModalEntry.projectId)
    };

    saveEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    api.updateEntry(updatedEntry);
    showAlert(`Entry updated successfully.`, 'success');
    setEditModalEntry(null);
  };

  const editEntry = (e: Entry) => {
    setEditModalEntry({ ...e });
    setEditHoursInput(e.hours.toString());
  };

  const clearForm = () => {
    setStaff('');
    setProjectId('');
    setStage('');
    setStart('');
    setEnd('');
    setDesc('');
    setDate(new Date().toISOString().split('T')[0]);
    setHoursInput('');
  };

  const confirmDelete = () => {
    if (deleteModalId !== null) {
      saveEntries(entries.filter(e => e.id !== deleteModalId));
      api.deleteEntry(deleteModalId.toString());
      setDeleteModalId(null);
      showAlert('Entry successfully deleted.', 'success');
    }
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF33] focus:bg-zinc-800 transition-colors text-sm placeholder:text-zinc-500 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100";
  const labelClass = "block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-8">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 text-blue-400 text-sm">
        <Clock01Icon className="w-5 h-5" />
        <span>Today: {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</span>
      </div>

      <SectionWrapper stepNumber="01">
        <SectionHeader title="Log a time entry" description="Fill in the details to log your hours." />
        
        <div className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Staff member <span className="text-red-500 ml-1">*</span></label>
              <select className={inputClass} value={staff} onChange={e => setStaff(e.target.value)}>
                <option value="">Select staff...</option>
                {STAFF_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date <span className="text-red-500 ml-1">*</span></label>
              <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} onClick={e => (e.target as any).showPicker?.()} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Start time</label>
              <input type="time" className={inputClass} value={start} onChange={e => setStart(e.target.value)} onClick={e => (e.target as any).showPicker?.()} />
            </div>
            <div>
              <label className={labelClass}>End time</label>
              <input type="time" className={inputClass} value={end} onChange={e => setEnd(e.target.value)} onClick={e => (e.target as any).showPicker?.()} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Project <span className="text-red-500 ml-1">*</span></label>
            <select className={inputClass} value={projectId} onChange={e => setProjectId(e.target.value)}>
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.client ? ` - ${p.client}` : ''}</option>
              ))}
              {projects.length === 0 && <option value="__manual">No projects found - enter manually</option>}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Task stage <span className="text-red-500 ml-1">*</span></label>
              <select className={inputClass} value={stage} onChange={e => setStage(e.target.value)}>
                <option value="">Select stage...</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Hours (auto-calculated) <span className="text-red-500 ml-1">*</span></label>
              <input type="number" className={`${inputClass} ${start && end ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="0.0" step="0.25" min="0.25" max="24" value={hoursInput} onChange={e => setHoursInput(e.target.value)} readOnly={!!(start && end)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Task description <span className="text-red-500 ml-1">*</span></label>
            <input type="text" className={inputClass} placeholder="e.g. UI design of Hero section" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={clearForm} className="px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 hover:text-white transition-colors font-medium">Clear</button>
            <button onClick={handleSave} className="px-6 py-3 rounded-xl text-black text-sm font-bold shadow-[0_0_15px_rgba(204,255,51,0.3)] transition-all flex items-center gap-2 bg-[#CCFF33] hover:bg-[#b3e62d]">
              <Clock01Icon className="w-4 h-4" />
              Add entry
            </button>
          </div>

          {alert && <AlertMessage type={alert.type} msg={alert.msg} />}
        </div>
      </SectionWrapper>

      <SectionWrapper stepNumber="02">
        <SectionHeader title="Recent entries" />
        <div className="mt-8">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/50 rounded-2xl border border-zinc-800/50">No entries yet. Log your first time entry above.</div>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 20).map(e => (
                <div key={e.id} className="grid grid-cols-12 gap-4 items-center py-4 px-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-medium text-white">{e.staff}</div>
                    <div className="text-xs text-zinc-500 mt-1">{e.date}{e.start ? ` · ${e.start}–${e.end}` : ''}</div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="text-zinc-300">{e.desc}</div>
                    <div className="text-xs text-[#CCFF33]/80 mt-1">{e.stage}</div>
                  </div>
                  <div className="col-span-12 md:col-span-3 text-sm text-zinc-400">
                    {e.projectName}
                  </div>
                  <div className="col-span-10 md:col-span-1 font-medium text-right text-white">
                    {e.hours.toFixed(1)}h
                  </div>
                  <div className="col-span-2 md:col-span-1 text-right flex justify-end gap-1">
                    <button onClick={() => editEntry(e)} className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                      <Edit02Icon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setDeleteModalId(e.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Delete02Icon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionWrapper>

      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setDeleteModalId(null)}>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-2">Delete Entry?</h3>
            <p className="text-zinc-400 mb-8">Are you sure you want to delete this time entry? This cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setDeleteModalId(null)} className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Delete Entry</button>
            </div>
          </div>
        </div>
      )}

      {editModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditModalEntry(null)}>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-6">Edit Time Entry</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Staff member <span className="text-red-500 ml-1">*</span></label>
                  <select className={inputClass} value={editModalEntry.staff} onChange={e => setEditModalEntry({...editModalEntry, staff: e.target.value})}>
                    <option value="">Select staff...</option>
                    {STAFF_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date <span className="text-red-500 ml-1">*</span></label>
                  <input type="date" className={inputClass} value={editModalEntry.date} onChange={e => setEditModalEntry({...editModalEntry, date: e.target.value})} onClick={e => (e.target as any).showPicker?.()} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Start time</label>
                  <input type="time" className={inputClass} value={editModalEntry.start} onChange={e => setEditModalEntry({...editModalEntry, start: e.target.value})} onClick={e => (e.target as any).showPicker?.()} />
                </div>
                <div>
                  <label className={labelClass}>End time</label>
                  <input type="time" className={inputClass} value={editModalEntry.end} onChange={e => setEditModalEntry({...editModalEntry, end: e.target.value})} onClick={e => (e.target as any).showPicker?.()} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Project <span className="text-red-500 ml-1">*</span></label>
                <select className={inputClass} value={editModalEntry.projectId} onChange={e => setEditModalEntry({...editModalEntry, projectId: e.target.value})}>
                  <option value="">Select project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.client ? ` - ${p.client}` : ''}</option>
                  ))}
                  {projects.length === 0 && <option value="__manual">No projects found - enter manually</option>}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Task stage <span className="text-red-500 ml-1">*</span></label>
                  <select className={inputClass} value={editModalEntry.stage} onChange={e => setEditModalEntry({...editModalEntry, stage: e.target.value})}>
                    <option value="">Select stage...</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Hours (auto-calculated) <span className="text-red-500 ml-1">*</span></label>
                  <input type="number" className={`${inputClass} ${editModalEntry.start && editModalEntry.end ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="0.0" step="0.25" min="0.25" max="24" value={editHoursInput} onChange={e => setEditHoursInput(e.target.value)} readOnly={!!(editModalEntry.start && editModalEntry.end)} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Task description <span className="text-red-500 ml-1">*</span></label>
                <input type="text" className={inputClass} placeholder="e.g. UI design of Hero section" value={editModalEntry.desc} onChange={e => setEditModalEntry({...editModalEntry, desc: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setEditModalEntry(null)} className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={handleUpdate} className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Edit02Icon className="w-4 h-4" />
                Update Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
