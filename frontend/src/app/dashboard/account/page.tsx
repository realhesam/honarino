"use client";

import EditProfileForm from "@/components/dashboard/EditProfileForm";
import LinkButton from "@/ui/LinkButton";
import ShowCurrentTime from "@/ui/ShowCurrentTime";
import Image from "next/image";
import { HiChatBubbleLeftRight, HiLightBulb, HiMiniBellAlert, HiMiniHeart } from "react-icons/hi2";
import { useUser } from "@/context/UserContext";

function roleLabel(role: string) {
  if (role === "vendor") return "حساب تولیدی";
  if (role === "admin") return "حساب مدیریت";
  return "حساب معمولی";
}

export default function UserSettings() {
  const { user } = useUser();

  return (
    <div>
      <div className="w-full flex items-end justify-between">
        <div>
          <span className="text-xs sm:text-sm px-2 py-1 bg-primary/15 text-primary rounded-lg">
            👋 کاربر {user.name}, خوش آمدید.
          </span>
          <h4 className="text-xl mt-2 font-bold text-stone-700">حساب کاربری</h4>
        </div>
        <div className="text-xs sm:text-base">
          <ShowCurrentTime />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[19rem_1fr] items-start gap-5 mt-5">
        <div className="flex flex-col items-center justify-center p-5 pt-18 overflow-hidden bg-white border border-stone-200 rounded-xl">
          <div className="relative size-20 rounded-full mb-2.5 flex items-center justify-center">
            <div className="absolute size-30 bg-stone-200/45 rounded-full" />
            <div className="absolute size-40 bg-stone-200/35 rounded-full" />
            <div className="absolute size-50 bg-stone-200/25 rounded-full" />
            <div className="absolute size-60 bg-stone-200/15 rounded-full" />
            <Image src={user.avatar} alt="user-avatar" fill className="rounded-full" />
            <span className="absolute inset-x-0 mx-auto -bottom-2 w-fit py-0.5 px-2 text-xs border border-stone-300 bg-stone-200 text-stone-600 rounded-lg">
              {user.username}
            </span>
          </div>

          <h3 className="text-lg text-stone-700 font-medium z-20">{user.name}</h3>
          <span className="text-sm">({roleLabel(user.role)})</span>

          <LinkButton customClass="mt-2.5 w-full z-20">تغییر رمز عبور</LinkButton>

          <div className="w-full flex items-center gap-2 mt-2.5 *:grow *:flex-col *:gap-0">
            <LinkButton variation="btn-dim">
              <span className="*:size-6"><HiChatBubbleLeftRight /></span>
              <span className="text-stone-500">{user.queriesCount}</span>
            </LinkButton>
            <LinkButton variation="btn-dim">
              <span className="*:size-6"><HiMiniHeart /></span>
              <span className="text-stone-500">{user.favoritesCount}</span>
            </LinkButton>
            <LinkButton variation="btn-dim">
              <span className="*:size-6"><HiMiniBellAlert /></span>
              <span className="text-stone-500">{user.notificationsCount}</span>
            </LinkButton>
          </div>
        </div>

        <div className="bg-white border p-5 border-stone-200 rounded-xl">
          <p className="flex items-center gap-1 mb-2.5 p-1 bg-stone-100 text-stone-600 text-sm rounded-lg">
            <span className="*:size-5 text-amber-400"><HiLightBulb /></span>
            <span>کاربر گرامی برای تغییر اطلاعات آنها را با دکمه 'ذخیره اطلاعات' ثبت کنید.</span>
          </p>
          <EditProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}