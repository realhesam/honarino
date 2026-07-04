"use client";

import { useRouter } from "next/navigation";
import { HiLockClosed, HiArrowSmLeft } from "react-icons/hi";

interface AccessDeniedStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: "admin" | "vendor";
}

export default function AccessDeniedState({
  title = "شما به این بخش دسترسی ندارید",
  message = "این مسیر برای حساب فعلی شما در دسترس نیست.",
  actionLabel = "بازگشت",
  actionHref = "/dashboard/account",
  tone = "vendor",
}: AccessDeniedStateProps) {
  const router = useRouter();

  const isAdmin = tone === "admin";

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className={`mb-4 rounded-full p-4 ${isAdmin ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
        <HiLockClosed className="size-8" />
      </div>
      <h3 className="text-base font-black text-stone-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-stone-500">{message}</p>
      <button
        onClick={() => router.push(actionHref)}
        className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
          isAdmin
            ? "bg-stone-900 text-white hover:bg-stone-800"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        <span>{actionLabel}</span>
        <HiArrowSmLeft className="size-4" />
      </button>
    </div>
  );
}
