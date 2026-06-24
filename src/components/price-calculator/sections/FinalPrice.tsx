import React from 'react';
import { Money01Icon } from 'hugeicons-react';

interface Props {
  price: number;
  total: number;
  profit: number;
  margin: number;
  rate: number;
  fmt: (n: number) => string;
}

export function FinalPrice({ price, total, profit, margin, rate, fmt }: Props) {
  return (
    <div className="bg-[#CCFF33]/5 border-2 border-[#CCFF33]/30 rounded-3xl p-8 md:p-10 relative overflow-hidden">
      <div className="absolute -bottom-40 -left-20 p-8 opacity-5 pointer-events-none">
        <Money01Icon size={400} />
      </div>
      
      <div className="relative z-10">
        <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Final client price</div>
        <div className="text-5xl md:text-7xl font-bold text-[#CCFF33] mb-10">{fmt(price)}</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
            <div className="text-sm text-zinc-400 mb-2">Total cost</div>
            <div className="text-xl font-medium text-white">{fmt(total)}</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
            <div className="text-sm text-zinc-400 mb-2">Profit</div>
            <div className="text-xl font-medium text-[#CCFF33]">{fmt(profit)}</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
            <div className="text-sm text-zinc-400 mb-2">Margin</div>
            <div className="text-xl font-medium text-[#CCFF33]">{margin}%</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
            <div className="text-sm text-zinc-400 mb-2">Rate per hour</div>
            <div className="text-xl font-medium text-white">{fmt(rate)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
