import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
}

export function SectionHeader({ icon, label }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-violet-400">{icon}</div>
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}
