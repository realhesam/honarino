"use client";

import { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  ltr?: boolean;
}

export function InfoRow({ icon, label, value, ltr }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center text-xs gap-3">
      <span className="text-stone-400 font-bold flex items-center gap-1 shrink-0">
        {icon} {label}:
      </span>
      <span
        className={`text-stone-800 font-bold truncate ${ltr ? "font-mono" : ""}`}
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </span>
    </div>
  );
}

interface InfoBlockProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export function InfoBlock({ icon, label, value }: InfoBlockProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
        {icon} {label}:
      </span>
      <p className="text-xs bg-stone-50 border border-stone-200/50 p-3 rounded-xl text-stone-700 leading-relaxed">
        {value}
      </p>
    </div>
  );
}