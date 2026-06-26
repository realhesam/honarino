"use client";

import { useRouter } from "next/navigation";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

export default function HistoryControlButton() {
  const router = useRouter();

  return (
    <div className="flex items-center rounded-xl border border-stone-300 *:transition shrink-0" style={{padding: "3.5px"}}>
      <button
        className="*:size-5 py-1 px-2 hover:scale-[1.2]"
        onClick={() => router.forward()}
      >
        <HiOutlineChevronRight />
      </button>
      <span className="text-stone-400">|</span>
      <button
        className="*:size-5 py-1 px-2 hover:scale-[1.2]"
        onClick={() => router.back()}
      >
        <HiOutlineChevronLeft />
      </button>
    </div>
  );
}
