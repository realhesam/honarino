"use client";

import Image from "next/image";
import LinkButton from "@/ui/LinkButton";
import { useUser } from "@/context/UserContext";
import Sidebar, { NavLink } from "@/components/dashboard/Sidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import HistoryControlButton from "@/components/dashboard/HistoryControlButton";
import {
  HiArrowSmLeft,
  HiBadgeCheck,
  HiChatAlt2,
  HiViewGrid,
  HiViewGridAdd,
} from "react-icons/hi";
import {
  HiHeart,
  HiHome,
  HiPresentationChartLine,
  HiTicket,
  HiTruck,
  HiUser,
  HiUsers,
} from "react-icons/hi2";

const userLinks: NavLink[] = [
  { icon: <HiUser />, label: "حساب کاربری", href: "/dashboard/account" },
  {
    icon: <HiHeart />,
    label: "تولیدی های محبوب",
    href: "/dashboard/user/favorites",
  },
  {
    icon: <HiChatAlt2 />,
    label: "پرسش و پاسخ",
    href: "/dashboard/user/queries",
  },
];

const vendorLinks: NavLink[] = [
  { icon: <HiHome />, label: "حساب تولیدی", href: "/dashboard/vendor" },
  {
    icon: <HiViewGrid />,
    label: "محصولات",
    href: "/dashboard/vendor/products",
  },
  {
    icon: <HiViewGridAdd />,
    label: "افزودن محصول",
    href: "/dashboard/vendor/add-product",
  },
  {
    icon: <HiTicket />,
    label: "تیکت های دریافتی",
    href: "/dashboard/vendor/tickets",
  },
];

const adminLinks: NavLink[] = [
  { icon: <HiUser />, label: "حساب کاربری", href: "/dashboard/admin" },
  {
    icon: <HiUsers />,
    label: "مدیریت کاربران",
    href: "/dashboard/admin/users",
  },
  {
    icon: <HiTruck />,
    label: "مدیریت تولیدی ها",
    href: "/dashboard/admin/productions",
  },
  {
    icon: <HiBadgeCheck />,
    label: "درخواست های تولیدی",
    href: "/dashboard/admin/production-requests",
  },
  {
    icon: <HiTicket />,
    label: "تیکت های دریافتی",
    href: "/dashboard/admin/tickets",
  },
];

const LINKS_BY_ROLE = {
  user: userLinks,
  vendor: [...userLinks, ...vendorLinks],
  admin: [...userLinks, ...vendorLinks, ...adminLinks],
};

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 animate-pulse">
        <div className="text-stone-400 text-sm font-medium">
          در حال بارگذاری داشبورد...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar links={LINKS_BY_ROLE[user.role] || userLinks} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar scroll-smooth">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/60 transition-all">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 min-h-16 justify-center lg:h-20 lg:py-0">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex gap-3 items-center min-w-0 pr-12 lg:pr-0">
                <div className="size-10 rounded-full overflow-hidden relative shrink-0 ring-2 ring-stone-100 shadow-sm bg-stone-100">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-stone-800 text-sm truncate">
                    {user.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                    <span className="block size-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <span className="truncate" dir="ltr">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-center shrink-0">
                <div className="flex items-center gap-1 p-1 rounded-xl">
                  <NotificationBell />
                  <HistoryControlButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">
          {user.role === "user" && (
            <div className="relative overflow-hidden mb-6 p-4 rounded-2xl bg-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md shadow-primary/10">
              <div className="hidden md:block absolute size-40 rounded-full bg-white/10 -right-5 -bottom-5 z-10" />
              <div className="hidden md:block absolute size-56 rounded-full bg-white/5 -right-10 -bottom-10 z-0" />

              <div className="flex gap-3 z-20 relative items-center">
                <div className="size-11 p-2 rounded-xl bg-white/10 text-white backdrop-blur-md shrink-0 flex items-center justify-center">
                  <HiPresentationChartLine className="size-6" />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm lg:text-base">
                    ارتقای حساب به تولیدی
                  </h5>
                  <p className="text-xs text-stone-100/90 max-w-xl mt-1 leading-relaxed">
                    کاربر گرامی شما می توانید برای تولیدی خودتان حساب فروشنده
                    تولید کنید و محصولات خود را با دیگران به اشتراک بگذارید.
                  </p>
                </div>
              </div>

              <LinkButton
                variation="btn-light"
                href="/upgrade-to-production"
                customClass="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-primary font-medium text-xs shadow-sm shrink-0 z-20 relative flex items-center gap-1.5 self-end md:self-auto"
              >
                <span>تغییر به تولیدی</span>
                <HiArrowSmLeft className="size-4" />
              </LinkButton>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
