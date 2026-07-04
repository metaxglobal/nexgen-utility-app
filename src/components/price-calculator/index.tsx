"use client";

import React, { useState, useEffect } from 'react';
import { Money01Icon, Search01Icon, ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';

import { UtilisationRate } from './sections/UtilisationRate';
import { StaffAllocation } from './sections/StaffAllocation';
import { CostSummary } from './sections/CostSummary';
import { ProfitMargin } from './sections/ProfitMargin';
import { FinalPrice } from './sections/FinalPrice';
import { AlertMessage, AlertData } from './ui/AlertMessage';
import { SectionHeader } from './ui/SectionHeader';

import { SectionWrapper } from './ui/SectionWrapper';

const BILLABLE_MAX = 23 * 8;
const OH = 175000;
const TOTAL_MAX_CAP = 5 * BILLABLE_MAX;

export interface StaffMember {
  name: string;
  role: string;
  salary: number;
}

const STAFF: StaffMember[] = [
  { name: 'Sanjana', role: 'Tech lead', salary: 148250 },
  { name: 'Senith', role: 'UI & UX designer', salary: 71000 },
  { name: 'Sandun', role: 'Web developer', salary: 76000 },
  { name: 'Dasuni', role: 'BA & QA', salary: 71000 },
  { name: 'Prageeth', role: 'Web developer', salary: 92200 }
];

const PRESETS: Record<string, number[]> = {
  landing: [8, 12, 4, 4, 0],
  brochure: [16, 24, 32, 8, 0],
  ecommerce: [40, 40, 80, 24, 80],
  webapp: [80, 40, 120, 60, 120]
};

const fmt = (n: number) => 'LKR ' + Math.round(n).toLocaleString();
const fmtN = (n: number) => Math.round(n).toLocaleString();

import { api } from '@/lib/api';

export default function PriceCalculator() {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [utilSlider, setUtilSlider] = useState(70);
  const [marginSlider, setMarginSlider] = useState(35);
  const [hours, setHours] = useState<number[]>(Array(STAFF.length).fill(0));
  
  const [exportModal, setExportModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [pastProjects, setPastProjects] = useState<any[]>([]);
  const [pastEntries, setPastEntries] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [p, e] = await Promise.all([
          api.getProjects(),
          api.getEntries()
        ]);
        if (p) setPastProjects(p);
        if (e) setPastEntries(e);
      } catch (err) {}
    }
    load();
  }, []);

  const util = utilSlider / 100;
  const margin = marginSlider;
  const billableHrs = Math.round(BILLABLE_MAX * util);
  const ohRateHr = OH / (TOTAL_MAX_CAP * util);
  
  const totalBillCap = 5 * billableHrs;
  const minRevBreakeven = STAFF.reduce((a, s) => a + s.salary, 0) + OH;

  const pureRate = (s: StaffMember) => s.salary / (BILLABLE_MAX * util);

  let totalHrs = 0;
  let staffCost = 0;

  const staffCosts = STAFF.map((s, i) => {
    const h = hours[i];
    const c = h * pureRate(s);
    staffCost += c;
    totalHrs += h;
    return c;
  });

  const oh = totalHrs * ohRateHr;
  const total = staffCost + oh;
  const price = total > 0 ? total / (1 - margin / 100) : 0;
  const profit = price - total;
  const rate = totalHrs > 0 ? price / totalHrs : 0;

  const handlePreset = (key: keyof typeof PRESETS) => {
    setHours([...PRESETS[key]]);
  };

  const handleReset = () => {
    setHours(Array(STAFF.length).fill(0));
    setProjectName('');
    setClientName('');
  };

  const updateHour = (index: number, val: string) => {
    const newHours = [...hours];
    newHours[index] = parseFloat(val) || 0;
    setHours(newHours);
  };

  const getAlerts = (): AlertData[] => {
    if (totalHrs === 0) return [];
    const alerts: AlertData[] = [];
    const overAllocated = hours.some(h => h > billableHrs);
    
    if (overAllocated) {
      alerts.push({ type: 'danger', msg: `One or more team members are allocated beyond their available billable hours at ${Math.round(util * 100)}% utilisation. Reduce hours or increase utilisation rate.` });
    }
    if (util < 0.6) {
      alerts.push({ type: 'warning', msg: `Utilisation below 60% - your cost per hour is significantly elevated. Each project must contribute more to cover idle time. Consider adjusting the margin upward.` });
    }
    if (util >= 0.6 && util < 0.75) {
      alerts.push({ type: 'info', msg: `Moderate utilisation (${Math.round(util * 100)}%) - realistic for most months. Costs are adjusted accordingly.` });
    }
    if (util >= 0.75) {
      alerts.push({ type: 'success', msg: `Good utilisation rate (${Math.round(util * 100)}%) - costs are well distributed. Strong position for competitive pricing.` });
    }
    if (margin < 20) {
      alerts.push({ type: 'warning', msg: `Margin below 20% - may not cover unexpected costs or business risks.` });
    }
    if (margin >= 35 && margin < 50) {
      alerts.push({ type: 'success', msg: `Standard margin - healthy balance of competitiveness and profitability.` });
    }
    if (margin >= 50) {
      alerts.push({ type: 'info', msg: `Premium margin - justified for complex or specialised projects.` });
    }
    return alerts;
  };

  const handleExportToTimeTracker = () => {
    if (!projectName.trim()) {
      alert("Please enter a Project Name in Section 01 before saving.");
      return;
    }
    if (!clientName.trim()) {
      alert("Please enter a Client Name in Section 01 before saving.");
      return;
    }
    if (totalHrs === 0) {
      alert("Please allocate some hours before saving the project.");
      return;
    }
    setExportModal(true);
  };

  const confirmExport = () => {
    try {
      const projects = [...pastProjects];
      
      const staffRates = STAFF.map(s => pureRate(s) + ohRateHr);

      const newProject = {
        id: 'proj_' + Date.now(),
        name: projectName.trim(),
        client: clientName.trim(),
        status: 'Confirmed',
        hours: [...hours],
        utilization: utilSlider,
        margin: marginSlider,
        finalPrice: price,
        estimatedCost: total,
        staffRates: staffRates
      };

      projects.unshift(newProject);
      setPastProjects(projects);
      api.saveProject(newProject);
      
      setExportModal(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save project.");
    }
  };

  return (
    <div className="w-full mx-auto space-y-16 pb-24 font-sans text-white">
      <div className="flex items-center space-x-4 pb-2">
        <Money01Icon className="w-10 h-10 text-[#CCFF33]" />
        <h2 className="text-3xl md:text-4xl font-black tracking-wide text-white uppercase">Project Pricing Calculator</h2>
      </div>

      <SectionWrapper stepNumber="01">
        <div className="space-y-4">
          <SectionHeader title="Project Details" description="Assign a name and client to your project." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="w-full px-5 py-4 text-lg bg-zinc-900/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#CCFF33] focus:ring-1 focus:ring-[#CCFF33] transition-all"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name…"
            />
            <input 
              className="w-full px-5 py-4 text-lg bg-zinc-900/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#CCFF33] focus:ring-1 focus:ring-[#CCFF33] transition-all"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name…"
            />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper stepNumber="02">
        <UtilisationRate 
          utilSlider={utilSlider}
          setUtilSlider={setUtilSlider}
          billableHrs={billableHrs}
          totalBillCap={totalBillCap}
          ohRateHr={ohRateHr}
          minRevBreakeven={minRevBreakeven}
          fmt={fmt}
          fmtN={fmtN}
        />
      </SectionWrapper>

      <SectionWrapper stepNumber="03">
        <div className="space-y-12">
          <div className="space-y-6">
            <SectionHeader title="Quick-fill Presets" description="Populate hours quickly based on project type." />
            <div className="flex flex-wrap gap-3">
              {Object.entries({
                landing: 'Landing page',
                brochure: 'Brochure site',
                ecommerce: 'E-commerce',
                webapp: 'Web app'
              }).map(([key, label]) => {
                const isActive = JSON.stringify(hours) === JSON.stringify(PRESETS[key as keyof typeof PRESETS]);
                return (
                  <button 
                    key={key}
                    onClick={() => handlePreset(key as keyof typeof PRESETS)} 
                    className={`px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#CCFF33] border-[#CCFF33] text-black shadow-[0_0_15px_rgba(204,255,51,0.4)]'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button onClick={handleReset} className="ml-auto px-6 py-3 rounded-xl border border-red-500/40 bg-red-500/50 text-white text-sm hover:bg-red-500/70 hover:border-red-500/60 transition-all font-medium">Clear all</button>
            </div>
          </div>

          <StaffAllocation 
            staff={STAFF}
            hours={hours}
            staffCosts={staffCosts}
            billableHrs={billableHrs}
            updateHour={updateHour}
            fmt={fmt}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper stepNumber="04">
        <CostSummary 
          totalHrs={totalHrs}
          staffCost={staffCost}
          oh={oh}
          total={total}
          fmt={fmt}
        />
      </SectionWrapper>

      <SectionWrapper stepNumber="05">
        <ProfitMargin 
          marginSlider={marginSlider}
          setMarginSlider={setMarginSlider}
        />
      </SectionWrapper>

      <SectionWrapper stepNumber="06">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SectionHeader title="Historical Reference" description="Review how past projects performed to estimate better." />
          
          {pastProjects.length > 0 && (
            <div className="relative w-full md:w-64 shrink-0">
              <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search past projects..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CCFF33] transition-colors"
                value={historySearch}
                onChange={e => { setHistorySearch(e.target.value); setHistoryPage(0); }}
              />
            </div>
          )}
        </div>

        <div className="mt-8">
          {pastProjects.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/50 rounded-2xl border border-zinc-800/50">No historical projects found. Export a project to the Time Tracker first.</div>
          ) : (() => {
            const filtered = pastProjects.filter(p => p.name.toLowerCase().includes(historySearch.toLowerCase()));
            const totalPages = Math.ceil(filtered.length / 3);
            const current = filtered.slice(historyPage * 3, (historyPage + 1) * 3);

            if (filtered.length === 0) return <div className="text-zinc-500 text-sm py-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">No projects match your search.</div>;

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {current.map(p => {
                    const projEntries = pastEntries.filter(e => e.projectId === p.id);
                    const logged = projEntries.reduce((a,e) => a + e.hours, 0);
                    const est = p.hours ? p.hours.reduce((a:number,b:number)=>a+b, 0) : 0;
                    const diff = logged - est;
                    const pct = est > 0 ? Math.min((logged/est)*100, 100) : 0;

                    let actCost = 0;

                    // Support legacy projects by falling back to dynamic rates
                    const fallbackEstCost = p.hours ? p.hours.reduce((a:number,b:number,i:number)=>a+b*(pureRate(STAFF[i])+ohRateHr), 0) : 0;
                    const estCost = p.estimatedCost ?? fallbackEstCost;
                    const finalPrice = p.finalPrice ?? (fallbackEstCost > 0 ? fallbackEstCost / (1 - (marginSlider/100)) : 0);

                    STAFF.forEach((s, idx) => {
                      const staffLoggedH = projEntries.filter(e => e.staff === s.name).reduce((acc, e) => acc + e.hours, 0);
                      const staffRate = p.staffRates ? p.staffRates[idx] : (pureRate(s) + ohRateHr);
                      actCost += staffLoggedH * staffRate;
                    });

                    const costDiff = actCost - estCost;
                    
                    return (
                      <div key={p.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-colors flex flex-col relative">
                        {(p.utilization !== undefined || p.margin !== undefined) && (
                          <div className="absolute top-4 right-4 flex gap-1">
                            {p.utilization !== undefined && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">Util: {p.utilization}%</span>}
                            {p.margin !== undefined && <span className="text-[10px] bg-zinc-800 text-[#CCFF33]/80 px-2 py-0.5 rounded border border-zinc-700">Margin: {p.margin}%</span>}
                          </div>
                        )}
                        <div className="font-bold text-white mb-1 truncate pr-24">{p.name}</div>
                        <div className="text-xs text-zinc-500 mb-6 truncate">{p.client || 'No client'} <span className="mx-1">·</span> {p.status}</div>
                        
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs text-zinc-400">Total Hours</span>
                          <span className="text-sm font-bold text-white">{logged.toFixed(1)}h / {est.toFixed(1)}h</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: diff > 0 ? '#ef4444' : '#CCFF33' }}></div>
                        </div>
                        
                        <div className="flex-1 mt-4 pt-4 border-t border-zinc-800">
                          <div className="space-y-3">
                            {p.finalPrice !== undefined && (
                              <div className="flex justify-between items-end pb-2 border-b border-zinc-800/50">
                                <span className="text-xs text-zinc-400 font-medium">Quoted Price</span>
                                <span className="text-sm font-bold text-[#CCFF33]">{fmt(finalPrice)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-end">
                              <span className="text-xs text-zinc-500">Estimated Cost</span>
                              <span className="text-sm font-medium text-zinc-300">{fmt(estCost)}</span>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-xs text-zinc-500">Actual Cost</span>
                              <span className={`text-sm font-medium ${costDiff > 0 ? 'text-red-400' : 'text-white'}`}>{fmt(actCost)}</span>
                            </div>
                            
                            {estCost > 0 && (
                              <div className="flex justify-between items-end pt-2 mt-2 border-t border-zinc-800/50">
                                <span className="text-xs text-zinc-500">Financial Variance</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${costDiff > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                  {costDiff > 0 ? `Over by ${fmt(costDiff)}` : `Saved ${fmt(Math.abs(costDiff))}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                    <div className="text-sm text-zinc-500">
                      Showing {historyPage * 3 + 1}-{Math.min((historyPage + 1) * 3, filtered.length)} of {filtered.length} projects
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                        disabled={historyPage === 0}
                        className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowLeft01Icon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setHistoryPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={historyPage === totalPages - 1}
                        className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowRight01Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </SectionWrapper>

      <SectionWrapper stepNumber="07">
        <FinalPrice 
          price={price}
          total={total}
          profit={profit}
          margin={margin}
          rate={rate}
          fmt={fmt}
        />
      </SectionWrapper>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleExportToTimeTracker}
          className="flex items-center gap-3 px-8 py-4 bg-[#CCFF33] text-black font-bold text-lg rounded-2xl hover:bg-[#b3e62d] transition-all shadow-[0_0_20px_rgba(204,255,51,0.3)] shrink-0"
        >
          Export to Time Tracker
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {exportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Save Project?</h3>
            <p className="text-zinc-400 mb-8">Are you sure you want to export <strong>"{projectName}"</strong> to the Time Tracker?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setExportModal(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={confirmExport} className="px-6 py-3 rounded-xl bg-[#CCFF33] text-black font-bold shadow-[0_0_15px_rgba(204,255,51,0.3)] hover:bg-[#b3e62d] transition-colors">Save Project</button>
            </div>
          </div>
        </div>
      )}

      {exportSuccess && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/20 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Successfully added to Time Tracker!</span>
        </div>
      )}

      <div className="space-y-4">
        {getAlerts().map((alert, i) => (
          <AlertMessage key={i} type={alert.type} msg={alert.msg} />
        ))}
      </div>
    </div>
  );
}
