import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 md:mb-3">{title}</h3>
      {description && (
        <div className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-4xl">{description}</div>
      )}
    </div>
  );
}
