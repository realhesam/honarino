"use client";

import { 
  HiUsers, 
  HiTruck, 
  HiTicket, 
} from "react-icons/hi2";

import { 

  HiBadgeCheck, 

} from "react-icons/hi";

export default function AdminOverviewPage() {

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="border-b border-stone-200/60 pb-5">
        <h2 className="text-xl font-black text-stone-900 tracking-tight">میز کار مدیریت کل سیستم</h2>
        <p className="text-xs font-medium text-stone-500 mt-1.5">
          خلاصه‌ای از آخرین وضعیت پلتفرم، آمار کاربران و درخواست‌های ارتقای سطح دسترسی.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HiUsers className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">کل کاربران سیستم</p>
            <h4 className="text-lg font-black text-stone-800 mt-1">1 نفر</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <HiTruck className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">تولیدی‌های ثبت‌شده</p>
            <h4 className="text-lg font-black text-stone-800 mt-1">2 کارگاه</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-xs relative overflow-hidden group">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HiBadgeCheck className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">درخواست‌های دسترسی</p>
            <h4 className="text-lg font-black text-amber-600 mt-1">3 مورد جدید</h4>
          </div>
          <span className="absolute top-2 left-2 size-2 bg-amber-500 rounded-full animate-ping" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/60 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <HiTicket className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">تیکت‌های باز پشتیبانی</p>
            <h4 className="text-lg font-black text-stone-800 mt-1">4 تیکت</h4>
          </div>
        </div>

      </div>

    </div>
  );
}