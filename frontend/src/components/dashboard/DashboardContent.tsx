"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import Sidebar, { NavLink } from "@/components/dashboard/Sidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import HistoryControlButton from "@/components/dashboard/HistoryControlButton";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import AccessDeniedState from "@/components/dashboard/AccessDeniedState";
import { usePathname, useRouter } from "next/navigation";
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
  HiArrowRightOnRectangle,
  HiAdjustmentsHorizontal,
} from "react-icons/hi2";

const userLinks: NavLink[] = [
  { icon: <HiHome />, label: "داشبورد", href: "/dashboard/" },
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

const vendorBaseLinks: NavLink[] = [
  { icon: <HiHome />, label: "حساب تولیدی", href: "/dashboard/vendor" },
];

const adminPanelLinks: NavLink[] = [
  {
    icon: <HiArrowRightOnRectangle className="rotate-180" />,
    label: "بازگشت به داشبورد عمومی",
    href: "/dashboard/account",
  },
  { icon: <HiHome />, label: "داشبورد ادمین", href: "/dashboard/admin" },
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
    icon: <HiViewGrid />,
    label: "مدیریت دسته بندی ها",
    href: "/dashboard/admin/categories",
  },
  {
    icon: <HiBadgeCheck />,
    label: "درخواست ارتقا حساب",
    href: "/dashboard/admin/production-requests",
  },
  {
    icon: <HiTicket />,
    label: "تیکت های دریافتی",
    href: "/dashboard/admin/tickets",
  },
];

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 animate-pulse">
        <div className="text-stone-400 text-sm font-medium">
          در حال بارگذاری داشبورد...
        </div>
      </div>
    );
  }

  let currentLinks: NavLink[] = [];

  const vendorPathRegex = /\/dashboard\/vendor\/([^/]+)/;
  const isVendorManagementPage = pathname.match(vendorPathRegex);
  const isVendorBasePage = pathname.startsWith("/dashboard/vendor");
  const isAdminPage = pathname.startsWith("/dashboard/admin");

  const isAdminAccessDenied = isAdminPage && user.role !== "admin";

  const isVendorAccessDenied = isVendorBasePage && user.role === "user";

  if (isVendorManagementPage && isVendorManagementPage[1]) {
    const productionId = isVendorManagementPage[1];
    currentLinks = [
      {
        icon: <HiArrowRightOnRectangle className="rotate-180" />,
        label: "بازگشت به داشبورد",
        href: "/dashboard/vendor",
      },
      {
        icon: <HiHome />,
        label: "صفحه اصلی تولیدی",
        href: `/dashboard/vendor/${productionId}`,
      },
      {
        icon: <HiUsers />,
        label: "مدیریت کاربران تولیدی",
        href: `/dashboard/vendor/${productionId}/members`,
      },
      {
        icon: <HiViewGrid />,
        label: "محصولات تولیدی",
        href: `/dashboard/vendor/${productionId}/products`,
      },
      {
        icon: <HiViewGridAdd />,
        label: "افزودن محصول جدید",
        href: `/dashboard/vendor/${productionId}/add-product`,
      },
      {
        icon: <HiTicket />,
        label: "تیکت های دریافتی",
        href: `/dashboard/vendor/${productionId}/tickets`,
      },
    ];
  } else if (isAdminPage && user.role === "admin") {
    currentLinks = [...adminPanelLinks];
  } else {
    currentLinks = [...userLinks];

    if (user.role === "admin") {
      currentLinks = [
        ...currentLinks,
        ...vendorBaseLinks,
        {
          icon: <HiAdjustmentsHorizontal className="text-emerald-600" />,
          label: "ورود به پنل ادمین",
          href: "/dashboard/admin",
        },
      ];
    } else if (user.role === "vendor") {
      currentLinks = [...currentLinks, ...vendorBaseLinks];
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar links={currentLinks} />

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
          {isAdminAccessDenied ? (
            <AccessDeniedState
              title="شما به این بخش دسترسی ندارید"
              message="این مسیر صرفاً برای مدیران کل سیستم تعریف شده است."
              actionLabel="بازگشت به حساب کاربری"
              actionHref="/dashboard/account"
              tone="admin"
            />
          ) : isVendorAccessDenied ? (
            <AccessDeniedState
              title="حساب تولیدی شما فعال نیست"
              message="برای دسترسی به بخش مدیریت کارگاه و تولیدی، ابتدا باید حساب کاربری خود را به سطح «تولیدکننده» ارتقاء دهید."
              actionLabel="درخواست ارتقای حساب"
              actionHref="/dashboard/account"
              tone="vendor"
            />
          ) : (
            <>
              {!isVendorBasePage && !isAdminPage && user.role === "user" && (
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
                        کاربر گرامی شما می توانید برای تولیدی خودتان حساب
                        فروشنده تولید کنید و محصولات خود را با دیگران به اشتراک
                        بگذارید.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-primary font-bold text-xs shadow-sm shrink-0 z-20 relative flex items-center gap-1.5 self-end md:self-auto transition-all active:scale-95 cursor-pointer"
                  >
                    <span>تغییر به تولیدی</span>
                    <HiArrowSmLeft className="size-4" />
                  </button>
                </div>
              )}

              {children}
            </>
          )}
        </main>
      </div>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
