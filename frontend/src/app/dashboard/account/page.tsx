"use client";

import EditProfileForm from "@/components/dashboard/EditProfileForm";
import LinkButton from "@/ui/LinkButton";
import ShowCurrentTime from "@/ui/ShowCurrentTime";
import Image from "next/image";
import { useState } from "react";
import { HiChatBubbleLeftRight, HiMiniBellAlert, HiMiniHeart, HiKey } from "react-icons/hi2";
import { useUser } from "@/context/UserContext";
import ChangePasswordModal from "@/components/dashboard/ChangePasswordModal";

function roleLabel(role: string) {
  if (role === "vendor") return "حساب تولیدی";
  if (role === "admin") return "حساب مدیریت";
  return "حساب معمولی";
}

export default function UserSettings() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="w-full flex items-center justify-between border-b border-stone-200/40 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            سلام {user.name}، خوش آمدید
          </span>
          <h4 className="text-xl lg:text-2xl mt-2 font-bold text-stone-800">حساب کاربری</h4>
        </div>
        <ShowCurrentTime />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] items-start gap-6">
        
        <div className="flex flex-col items-center p-6 bg-white border border-stone-200/60 rounded-2xl shadow-sm relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-stone-50 to-white border-b border-stone-100" />

          <div className="relative size-24 rounded-full mt-4 mb-4 flex items-center justify-center border-4 border-white shadow-md z-10 bg-stone-100">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                alt="user-avatar" 
                fill 
                className="rounded-full object-cover" 
                unoptimized
              />
            ) : (
              <span className="text-xl font-bold text-stone-400">
                {user.name?.charAt(0)}
              </span>
            )}
          </div>

          <div className="text-center space-y-1 z-10">
            <h3 className="text-base font-bold text-stone-800">{user.name}</h3>
            <p className="text-xs text-stone-400 font-medium" dir="ltr">@{user.username}</p>
          </div>

          <span className={`mt-3 px-3 py-1 text-[11px] font-semibold rounded-full border ${
            user.role === "vendor" 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : user.role === "admin" 
              ? "bg-amber-50 text-amber-600 border-amber-100" 
              : "bg-stone-100 text-stone-600 border-stone-200/60"
          }`}>
            {roleLabel(user.role)}
          </span>

          <LinkButton 
            customClass="mt-5 w-full z-10 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <HiKey className="size-4 shrink-0" />
            <span>تغییر رمز عبور</span>
          </LinkButton>

          <div className="w-full border-t border-stone-100 my-5" />

          <div className="w-full grid grid-cols-3 gap-2">
            
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-stone-50 border border-stone-100 hover:bg-stone-100/50 transition-colors">
              <HiChatBubbleLeftRight className="size-5 text-stone-400 mb-1" />
              <span className="text-xs font-bold text-stone-700">{user.queriesCount || 0}</span>
              <span className="text-[10px] text-stone-400 mt-0.5">گفتگوها</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-stone-50 border border-stone-100 hover:bg-stone-100/50 transition-colors">
              <HiMiniHeart className="size-5 text-stone-400 mb-1" />
              <span className="text-xs font-bold text-stone-700">{user.favoritesCount || 0}</span>
              <span className="text-[10px] text-stone-400 mt-0.5">علاقه‌ها</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-stone-50 border border-stone-100 hover:bg-stone-100/50 transition-colors">
              <HiMiniBellAlert className="size-5 text-stone-400 mb-1" />
              <span className="text-xs font-bold text-stone-700">{user.notificationsCount || 0}</span>
              <span className="text-[10px] text-stone-400 mt-0.5">اعلان‌ها</span>
            </div>

          </div>

        </div>

        <div className="w-full">
          <EditProfileForm user={user} />
        </div>

      </div>
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
    
  );
}