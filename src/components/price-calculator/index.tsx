"use client";

import React, { useState } from 'react';
import { Money01Icon } from 'hugeicons-react';

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
  { name: 'Dasuni', role: 'BA & QA', salary: 71000 },
  { name: 'Senith', role: 'UI & UX designer', salary: 71000 },
  { name: 'Sandun', role: 'Web developer', salary: 76000 },
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

export default function PriceCalculator() {
  const [projectName, setProjectName] = useState('');
  const [utilSlider, setUtilSlider] = useState(70);
  const [marginSlider, setMarginSlider] = useState(35);
  const [hours, setHours] = useState<number[]>(Array(STAFF.length).fill(0));

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

  return (
    <div className="w-full mx-auto space-y-16 pb-24 font-sans text-white">
      <div className="flex items-center space-x-4 pb-2">
        <Money01Icon className="w-10 h-10 text-[#CCFF33]" />
        <h2 className="text-3xl md:text-4xl font-black tracking-wide text-white uppercase">Project Pricing Calculator</h2>
      </div>

      <SectionWrapper stepNumber="01">
        <div className="space-y-4">
          <SectionHeader title="Project Details" description="Assign a name to your project." />
          <input 
            className="w-full px-5 py-4 text-lg bg-zinc-900/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#CCFF33] focus:ring-1 focus:ring-[#CCFF33] transition-all"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name…"
          />
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
        <FinalPrice 
          price={price}
          total={total}
          profit={profit}
          margin={margin}
          rate={rate}
          fmt={fmt}
        />
      </SectionWrapper>

      <div className="space-y-4">
        {getAlerts().map((alert, i) => (
          <AlertMessage key={i} type={alert.type} msg={alert.msg} />
        ))}
      </div>
    </div>
  );
}
