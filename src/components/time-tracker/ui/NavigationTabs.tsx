import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (val: string) => void;
}

export function NavigationTabs({ activeTab, setActiveTab }: Props) {
  const tabs = [
    { id: 'log', label: 'Log time' },
    { id: 'today', label: 'Today' },
    { id: 'projects', label: 'Projects' },
    { id: 'team', label: 'Team' },
    { id: 'tasks', label: 'Task analysis' }
  ];

  return (
    <div className="flex overflow-x-auto border-b border-zinc-800 scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-[120px] pb-4 px-6 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
            activeTab === tab.id 
              ? 'text-[#CCFF33] border-[#CCFF33]' 
              : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
