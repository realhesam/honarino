"use client";

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  pendingLabel?: string;
}

export default function StatusBadge({
  active,
  activeLabel = "فعال",
  pendingLabel = "در انتظار تایید",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {active ? activeLabel : pendingLabel}
    </span>
  );
}