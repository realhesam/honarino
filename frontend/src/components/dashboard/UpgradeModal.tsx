"use client";

import { useState } from "react";
import { HiXMark, HiUser, HiPhone, HiIdentification, HiShieldCheck } from "react-icons/hi2";
import { VendorService } from "@/lib/modules/vendor/vendor.service";
import { useUser } from "@/context/UserContext";
import { useNotification } from "@/utils/useNotification";
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useUser();
  const notification = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    nationalCode: "",
    phone: "",
    note: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await VendorService.create_request({
        fullname: formData.fullName,
        nid: formData.nationalCode,
        phone: formData.phone,
        email: user!.email,
        description: formData.note || undefined,
      });
      onClose();
    } catch (err: any) {
      notification.error(err.message || "خطایی رخ داد");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2 text-stone-800">
            <HiShieldCheck className="size-5 text-emerald-600" />
            <h3 className="font-black text-sm sm:text-base">درخواست دسترسی حساب تولیدکننده</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          >
            <HiXMark className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <p className="text-xs text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/40">
            جهت فعال‌سازی قابلیت «ثبت و مدیریت کارگاه‌ها»، لطفاً اطلاعات هویتی خود را تایید کنید. پشتیبانی پس از احراز هویت، این پرمیشن را برای شما فعال خواهد کرد.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">نام و نام خانوادگی</label>
            <div className="relative">
              <HiUser className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                required
                placeholder="مثال: علی علیسواری"
                className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl pr-10 pl-3 py-3 text-stone-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">کد ملی</label>
            <div className="relative">
              <HiIdentification className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                required
                maxLength={10}
                placeholder="XXXXXXXXXX"
                dir="ltr"
                className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl pr-10 pl-3 py-3 text-stone-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right"
                value={formData.nationalCode}
                onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">شماره تلفن همراه (جهت هماهنگی)</label>
            <div className="relative">
              <HiPhone className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="tel"
                required
                placeholder="0912XXXXXXX"
                dir="ltr"
                className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl pr-10 pl-3 py-3 text-stone-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">توضیحات (اختیاری)</label>
            <textarea
              rows={2}
              placeholder="اگر نکته‌ای هست یا قبلاً با پشتیبانی هماهنگ کرده‌اید، بنویسید..."
              className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none resize-none leading-relaxed"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 active:scale-95 transition-all disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/10 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "در حال ارسال..." : "ارسال درخواست دسترسی"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}