"use client";

import ShowCurrentTime from "@/ui/ShowCurrentTime";
import { useState } from "react";
import { HiBell, HiCheckCircle, HiXMark } from "react-icons/hi2";
import { useNotifications } from "@/context/NotificationContext";
import { TYPE_CONFIG } from "@/components/dashboard/NotificationBell";

type FilterTab = "all" | "unread" | "success" | "info" | "warning";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",     label: "همه" },
  { key: "unread",  label: "خوانده‌نشده" },
  { key: "success", label: "موفقیت" },
  { key: "info",    label: "اطلاعات" },
  { key: "warning", label: "هشدار" },
];

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = notifications.filter((n) => {
    if (activeTab === "all")    return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="w-full flex items-center justify-between border-b border-stone-200/40 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            مرکز اعلان‌ها
          </span>
          <h4 className="text-xl lg:text-2xl mt-2 font-bold text-stone-800">اعلان‌ها</h4>
        </div>
        <ShowCurrentTime />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "کل اعلان‌ها",      value: notifications.length,                color: "text-stone-800",   bg: "bg-white"    },
          { label: "خوانده‌نشده",       value: unreadCount,                         color: "text-primary",     bg: "bg-primary/[0.03] border-primary/10"   },
          { label: "خوانده‌شده",        value: notifications.length - unreadCount,                color: "text-emerald-600", bg: "bg-emerald-50/40 border-emerald-100"  },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 sm:p-5 border border-stone-200/60 shadow-sm transition-all hover:shadow-md`}
          >
            <p className={`text-2xl sm:text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-medium text-stone-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 rounded-xl no-scrollbar max-w-full sm:max-w-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count =
                tab.key === "all"    ? notifications.length :
                tab.key === "unread" ? notifications.filter((n) => !n.read).length :
                notifications.filter((n) => n.type === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-primary transition-colors shrink-0 self-end sm:self-auto px-2 py-1 rounded-lg hover:bg-stone-100"
            >
              <HiCheckCircle className="size-4.5" />
              همه را خواندم
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-stone-50/20">
            <div className="size-16 rounded-2xl bg-stone-100 flex items-center justify-center border border-stone-200/40 shadow-inner">
              <HiBell className="size-8 text-stone-300" />
            </div>
            <p className="text-stone-400 text-sm font-medium">اعلانی در این بخش وجود ندارد</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG];
              return (
                <div
                  key={notif.id}
                  className={`group flex items-start gap-4 px-4 py-4.5 transition-all lg:hover:bg-stone-50/60 ${
                    !notif.read ? "bg-primary/[0.015]" : ""
                  }`}
                >
                  <div
                    className={`shrink-0 size-11 rounded-xl flex items-center justify-center shadow-sm border border-transparent ${cfg.bg} ${cfg.text}`}
                  >
                    <span className="font-bold text-lg">{cfg.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold tracking-tight ${
                              !notif.read ? "text-stone-900" : "text-stone-600"
                            }`}
                          >
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                              جدید
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed max-w-3xl">
                          {notif.body}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
                        {!notif.read && (
                          <button
                            onClick={() => markRead(notif.id)}
                            title="علامت به عنوان خوانده شده"
                            className="size-8 flex items-center justify-center rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-400 hover:text-emerald-600 border border-stone-200/40 hover:border-emerald-100 transition-all"
                          >
                            <HiCheckCircle className="size-4.5" />
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(notif.id)}
                          title="حذف اعلان"
                          className="size-8 flex items-center justify-center rounded-xl bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-500 border border-stone-200/40 hover:border-red-100 transition-all"
                        >
                          <HiXMark className="size-4.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="text-[11px] font-medium text-stone-400">{notif.time}</span>
                      <span className="text-stone-300">•</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.text} border-current/10`}>
                        {notif.type === "success" ? "موفقیت" : notif.type === "info" ? "اطلاعات" : "هشدار"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}