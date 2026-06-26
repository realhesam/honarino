"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NotifType = "info" | "success" | "warning";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "success", title: "سفارش تایید شد",       body: "سفارش شماره #۱۲۸۴ با موفقیت ثبت و تایید گردید.",                         time: "۵ دقیقه پیش", read: false },
  { id: "2", type: "info",    title: "پیام جدید",            body: "تولیدی پارچه‌بافی نیلوفر به پرسش شما پاسخ داد.",                          time: "۲ ساعت پیش",  read: false },
  { id: "3", type: "warning", title: "تکمیل پروفایل",        body: "برای بهره‌مندی کامل از خدمات، اطلاعات پروفایل خود را تکمیل کنید.",        time: "دیروز",        read: false },
  { id: "4", type: "success", title: "علاقه‌مندی ثبت شد",    body: "تولیدی آرایه به لیست علاقه‌مندی‌های شما اضافه شد.",                       time: "۳ روز پیش",   read: true  },
  { id: "5", type: "info",    title: "بروزرسانی سیستم",      body: "نسخه جدید پنل با امکانات بیشتر در دسترس است.",                            time: "۵ روز پیش",   read: true  },
  { id: "6", type: "warning", title: "انقضای رمز عبور",      body: "رمز عبور شما ۷ روز دیگر منقضی می‌شود. همین الان تغییر دهید.",             time: "۱ هفته پیش",  read: true  },
  { id: "7", type: "success", title: "تیکت بسته شد",         body: "تیکت پشتیبانی شماره #۵۵۲ با موفقیت بسته و حل شد.",                        time: "۱ هفته پیش",  read: true  },
  { id: "8", type: "info",    title: "محصول جدید",           body: "تولیدی صنایع‌دستی رها محصول جدیدی اضافه کرد که ممکن است برایتان جالب باشد.", time: "۲ هفته پیش",  read: true  },
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, dismiss }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("vaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaay (bebakhshid saat 2 nesf shabe dige hosele nadashtam ba jooziat benevisam okeyesh mikonam im really sorry reza)");
  }
  return context;
}