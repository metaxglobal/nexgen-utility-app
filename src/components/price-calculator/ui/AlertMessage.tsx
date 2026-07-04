import React from 'react';
import { Alert01Icon, Tick02Icon, InformationCircleIcon } from 'hugeicons-react';

export interface AlertData {
  type: 'danger' | 'warning' | 'success' | 'info';
  msg: React.ReactNode;
}

export function AlertMessage({ type, msg }: AlertData) {
  let styles = '';
  let Icon = InformationCircleIcon;
  
  if (type === 'danger') {
    styles = 'bg-red-500/10 text-red-400 border-red-500/30';
    Icon = Alert01Icon;
  } else if (type === 'warning') {
    styles = 'bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/30';
    Icon = Alert01Icon;
  } else if (type === 'success') {
    styles = 'bg-[#CCFF33]/10 text-[#CCFF33] border-[#CCFF33]/30';
    Icon = Tick02Icon;
  } else if (type === 'info') {
    styles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    Icon = InformationCircleIcon;
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-base leading-relaxed ${styles}`}>
      <Icon className="w-6 h-6 shrink-0 mt-0.5" />
      <div>{msg}</div>
    </div>
  );
}
