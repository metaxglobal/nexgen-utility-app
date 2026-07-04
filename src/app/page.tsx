"use client";

import { useState } from "react";
import PriceCalculator from "@/components/price-calculator";
import { TimeTracker } from "@/components/time-tracker";

export default function Home() {
  const [activeApp, setActiveApp] = useState<'price' | 'time'>('price');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-50 pb-16">
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-start min-h-[80vh]">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center">
          NexGen <span className="text-[#CCFF33]">Utility Hub</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-8 text-center max-w-2xl">
          Unified pricing calculation and time tracking.
        </p>

        <div className="flex gap-4 mb-12 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800">
          <button 
            onClick={() => setActiveApp('price')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeApp === 'price' ? 'bg-[#CCFF33] text-black shadow-[0_0_15px_rgba(204,255,51,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Price Calculator
          </button>
          <button 
            onClick={() => setActiveApp('time')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeApp === 'time' ? 'bg-[#CCFF33] text-black shadow-[0_0_15px_rgba(204,255,51,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Time Tracker
          </button>
        </div>

        <div className="w-full max-w-6xl">
          {activeApp === 'price' ? <PriceCalculator /> : <TimeTracker />}
        </div>
      </main>
    </div>
  );
}
