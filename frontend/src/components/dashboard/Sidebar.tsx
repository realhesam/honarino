"use client";

import LinkButton from "@/ui/LinkButton";
import Logo from "@/ui/Logo";
import Overlay from "@/ui/Overlay";
import { useOutsideClick } from "@/utils/useOutsideClick";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiOutlineLogin, HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi2";

export default function Sidebar({ links }: { links: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ref } = useOutsideClick(setIsSidebarOpen);
  const pathname = usePathname();
  console.log(pathname);

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-5 right-3 z-30 *:size-7 *:stroke-2 text-stone-600 hover:scale-[1.1] transition lg:hidden shrink-0"
        aria-label="باز کردن منو"
      >
        <HiOutlineMenu />
      </button>

      {isSidebarOpen && <Overlay />}

      {/* Sidebar panel */}
      <aside
        ref={ref}
        className={`fixed flex flex-col pb-2 inset-y-0 right-0 z-50 w-64 max-w-[80vw] bg-stone-50 border-l border-stone-200 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
          lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:h-screen`}
      >
        <div className="h-16 lg:h-19 px-4 flex items-center justify-between border-b border-stone-200">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="*:size-5 *:stroke-2 text-stone-600 hover:scale-[1.2] transition lg:hidden"
              aria-label="بستن منو"
            >
              <HiOutlineX />
            </button>
            <Link
              href="/"
              className="hidden lg:inline-flex *:size-5 *:stroke-2 text-stone-600 hover:scale-[1.2] transition"
            >
              <HiOutlineChevronDoubleRight />
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-stretch">
          {links.map((link) => (
            <LinkButton
              href={link.href}
              key={link.href}
              variation="btn-light"
              customClass={`relative py-3 rounded-none text-stone-600 bg-stone-50 gap-2.5 justify-start hover:bg-stone-100 ${pathname === link.href ? "*:text-stone-800" : ""}`}
            >
              <span
                className={`*:size-6 text-stone-400 ${pathname === link.href && "*:text-primary"}`}
              >
                {link.icon}
              </span>
              <span className="text-stone-500">{link.label}</span>
              <span
                className={`absolute left-1 text-stone-300 ${pathname === link.href && "rotate-180 text-stone-800"}`}
              >
                <HiChevronRight />
              </span>
            </LinkButton>
          ))}
        </div>
        <LinkButton
          href="/logout"
          variation="btn-dim"
          customClass="mx-2 mt-auto"
        >
          <span className="*:size-6">
            <HiOutlineLogin />
          </span>
          <span>خروج از حساب</span>
        </LinkButton>
      </aside>
    </>
  );
}
