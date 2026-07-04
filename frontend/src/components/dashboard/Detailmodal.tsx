"use client";

import { ReactNode } from "react";
import { HiXMark } from "react-icons/hi2";

interface DetailModalProps {
  icon: ReactNode;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function DetailModal({
  icon,
  title,
  onClose,
  children,
  footer,
}: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-stone-950/10 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-stone-200 bg-white text-right shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3">
          <div className="flex items-center gap-2 text-stone-800">
            <span className="text-stone-500">{icon}</span>
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <HiXMark className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-2 overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 flex-col items-stretch justify-end gap-2 border-t border-stone-100 bg-stone-50/70 px-4 py-3 sm:flex-row">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}