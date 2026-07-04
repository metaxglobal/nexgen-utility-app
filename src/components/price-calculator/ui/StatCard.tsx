import React from 'react';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  valueClass?: string;
}

export function StatCard({ label, value, valueClass = "text-white" }: StatCardProps) {
  return (
    <div className="bg-zinc-800/40 rounded-xl p-4">
      <div className="text-sm text-zinc-400 mb-2">{label}</div>
      <div className={`text-lg font-medium ${valueClass}`}>{value}</div>
    </div>
  );
}
