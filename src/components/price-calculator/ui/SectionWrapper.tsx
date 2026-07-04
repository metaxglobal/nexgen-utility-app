import React from 'react';

interface Props {
  stepNumber?: string;
  children: React.ReactNode;
}

export function SectionWrapper({ stepNumber, children }: Props) {
  return (
    <div className="relative bg-zinc-900/60 border border-white/20 rounded-[2rem] p-6 sm:p-8 lg:p-12 overflow-hidden shadow-2xl shadow-black/50">
      {stepNumber && (
        <div className="absolute -top-10 -right-6 text-[12rem] md:text-[16rem] font-black text-white/[0.1] pointer-events-none select-none leading-none z-0">
          {stepNumber}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
