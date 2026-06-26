"use client";

import { useOutsideClick } from "@/utils/useOutsideClick";
import Link from "next/link";
import { useState } from "react";
import { HiBell } from "react-icons/hi2";
import { useNotifications } from "@/context/NotificationContext";

export const TYPE_CONFIG = {
  success: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", icon: "✓" },
  info:    { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400",    icon: "i" },
  warning: { bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400",   icon: "!" },
};

const PREVIEW_COUNT = 5;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { ref } = useOutsideClick(setOpen);

  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  const preview = notifications.slice(0, PREVIEW_COUNT);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label="اعلان‌ها"
      >
        <HiBell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center size-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <HiBell className="size-4 text-primary" />
              <span className="font-semibold text-stone-800 text-sm">اعلان‌ها</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {unreadCount} جدید
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="text-xs text-stone-400 hover:text-primary transition-colors"
              >
                همه را خواندم
              </button>
            )}
          </div>

          <div className="divide-y divide-stone-50 max-h-96 overflow-y-auto no-scrollbar">
            {preview.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs font-medium">
                اعلانی برای نمایش وجود ندارد
              </div>
            ) : (
              preview.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG];
                return (
                  <button
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`w-full text-right flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-stone-50/80 ${
                      !notif.read ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    <div className={`shrink-0 size-8 rounded-xl flex items-center justify-center font-bold text-sm ${cfg.bg} ${cfg.text}`}>
                      {cfg.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-between mb-0.5">
                        <span className={`text-sm font-medium truncate ${!notif.read ? "text-stone-800 font-semibold" : "text-stone-600"}`}>
                          {notif.title}
                        </span>
                        {!notif.read && <span className={`shrink-0 size-1.5 rounded-full ${cfg.dot}`} />}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">{notif.body}</p>
                      <span className="text-[11px] text-stone-300 mt-1 block">{notif.time}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-stone-100 px-4 py-2.5 bg-stone-50/50">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full text-xs text-stone-500 hover:text-primary transition-colors py-0.5 group"
            >
              <span>مشاهده همه اعلان‌ها</span>
              {notifications.length > PREVIEW_COUNT && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200/60 text-stone-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  +{notifications.length - PREVIEW_COUNT}
                </span>
              )}
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}