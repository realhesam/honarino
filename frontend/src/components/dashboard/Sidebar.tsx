"use client";

import LinkButton from "@/ui/LinkButton";
import Logo from "@/ui/Logo";
import Overlay from "@/ui/Overlay";
import { useOutsideClick } from "@/utils/useOutsideClick";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiOutlineLogin, HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { HiChevronLeft, HiOutlineChevronDoubleRight } from "react-icons/hi2";

export interface NavLink {
  href: string;
  label: string;
  icon: React.ReactElement;
}

export default function Sidebar({ links }: { links: NavLink[] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ref } = useOutsideClick(setIsSidebarOpen);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 right-4 z-40 p-1.5 rounded-xl border transition-all lg:hidden shrink-0 text-stone-600 active:scale-95 bg-white border-transparent`}
        aria-label="باز کردن منو"
      >
        <HiOutlineMenu className="size-6" />
      </button>

      {isSidebarOpen && <Overlay />}

      <aside
        ref={ref}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-72 max-w-[85vw] bg-white border-l border-stone-200/80 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}
          lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:h-screen lg:bg-stone-50/50`}
      >
        <div className="h-16 lg:h-20 px-5 flex items-center justify-between border-b border-stone-200/60 shrink-0">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition lg:hidden"
              aria-label="بستن منو"
            >
              <HiOutlineX className="size-5" />
            </button>
            <Link
              href="/"
              className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              title="بازگشت به خانه"
            >
              <HiOutlineChevronDoubleRight className="size-5" />
            </Link>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 custom-scrollbar">
          {(() => {
            const activeLink = [...links]
              .sort((a, b) => b.href.length - a.href.length)
              .find((link) => {
                if (link.href === "/dashboard/") {
                  return (
                    pathname === "/dashboard" || pathname === "/dashboard/"
                  );
                }

                if (link.href === "/dashboard/vendor") {
                  return (
                    pathname === "/dashboard/vendor" ||
                    pathname === "/dashboard/vendor/"
                  );
                }

                if (link.href === "/dashboard/admin") {
                  return (
                    pathname === "/dashboard/admin" ||
                    pathname === "/dashboard/admin/"
                  );
                }

                return pathname.startsWith(link.href);
              });

            return links.map((link) => {
              const isActive = activeLink?.href === link.href;

              return (
                <LinkButton
                  href={link.href}
                  key={link.href}
                  variation="btn-light"
                  customClass={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 justify-start border border-transparent
            ${
              isActive
                ? "bg-primary/10 text-primary border-primary/5 font-medium"
                : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
            }`}
                >
                  {isActive && (
                    <span className="absolute right-0 top-3 bottom-3 w-1 bg-primary rounded-l-full" />
                  )}

                  <span
                    className={`shrink-0 transition-colors duration-200 *:size-5.5
              ${isActive ? "text-primary" : "text-stone-400 group-hover:text-stone-600"}`}
                  >
                    {link.icon}
                  </span>

                  <span className="text-sm">{link.label}</span>

                  <span
                    className={`mr-auto transition-transform duration-200 *:size-4
              ${isActive ? "text-primary translate-x-0" : "text-stone-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1"}`}
                  >
                    <HiChevronLeft />
                  </span>
                </LinkButton>
              );
            });
          })()}
        </nav>

        <div className="p-4 border-t border-stone-200/60 shrink-0 bg-gradient-to-t from-white to-transparent lg:from-stone-50/50">
          <LinkButton
            href="/auth/logout"
            variation="btn-dim"
            customClass="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100/50 transition-colors"
          >
            <HiOutlineLogin className="size-5 shrink-0" />
            <span className="text-sm font-medium">خروج از حساب</span>
          </LinkButton>
        </div>
      </aside>
    </>
  );
}
