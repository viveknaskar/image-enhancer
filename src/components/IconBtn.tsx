import React from 'react';

interface IconBtnProps {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}

export function IconBtn({ onClick, active, title, children }: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
