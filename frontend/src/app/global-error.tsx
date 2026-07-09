"use client";

import LinkButton from "@/ui/LinkButton";
import Logo from "@/ui/Logo";
import Link from "next/link";
import { useEffect } from "react";
import { HiMiniArrowUturnLeft } from "react-icons/hi2";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <div className="container h-screen w-screen flex items-center justify-center">
          <div className="flex flex-col gap-5 items-center">
            <div className="flex flex-col items-center">
              <Logo />
              <h4 className="text-4xl font-bold text-center">
                خطای غیر منتظره ای رخ داد
              </h4>
            </div>
            <p className="bg-red-100 text-red-500 text-sm p-1 rounded-sm">
              {error.message}
            </p>
            <p className="max-w-130 text-center text-stone-500" dir="ltr">
              برای پیگیری و رفع خطا می توانید محتوا یا متن خطا را با تیم{" "}
              <Link className="text-blue-700 underline" href="/contact">
                پشتیبانی
              </Link>{" "}
              در اختیار بگذارید
            </p>
            <LinkButton onClick={() => reset()} customClass="w-fit">
              <span>امتحان دوباره</span>
              <span className="*:size-5">
                <HiMiniArrowUturnLeft />
              </span>
            </LinkButton>
          </div>
        </div>
      </body>
    </html>
  );
}
