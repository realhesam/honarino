import LinkButton from "@/ui/LinkButton";
import Image from "next/image";
import React from "react";
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
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiPresentationChartLine,
  HiTicket,
  HiTruck,
  HiUser,
  HiUsers,
} from "react-icons/hi2";
import Sidebar from "@/components/dashboard/Sidebar";

// Fake Data...
const user = {
  id: "329403",
  name: "آرش عظیمی",
  phone: "0918 211 8080",
  email: "arash.az@gmail.com",
  avatar: "/images/default-user.jpg",
  role: "user",
};
// Fake Links Data
const links = {
  user: [
    {
      icon: <HiUser />,
      label: "حساب کاربری",
      href: "/dashboard/user",
    },
    {
      icon: <HiHeart />,
      label: "تولیدی های محبوب",
      href: "/favorites",
    },
    {
      icon: <HiChatAlt2 />,
      label: "پرسش و پاسخ",
      href: "/queries",
    },
  ],
  vendor: [
    {
      icon: <HiHome />,
      label: "حساب تولیدی",
      href: "/dashboard/vendor",
    },
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
  ],
  admin: [
    {
      icon: <HiUser />,
      label: "حساب کاربری",
      href: "/dashboard/admin",
    },
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
  ],
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactElement }>) {
  return (
    <div className="lg:grid lg:grid-cols-[17rem_1fr]">
      <Sidebar links={links[user.role]} />

      {/* Content Wrapper */}
      <div className="px-3 sm:px-4">
        {/* Top Header Dashboard */}
        <div className="min-h-16 lg:h-19 py-3 lg:py-0 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
          <div className="mr-8 flex gap-2 items-center min-w-0 lg:mr-0">
            <div className="size-10 sm:size-12 rounded-full overflow-hidden relative shrink-0">
              <Image src={user.avatar} alt="image of the user" fill />
            </div>
            <div className="min-w-0">
              <h4 className="font-medium truncate">{user.name}</h4>
              <div className="mt-1 flex items-center gap-1 text-sm text-stone-600">
                <span className="block size-2 rounded-full bg-blue-500 shrink-0"></span>
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-stretch order-3 lg:order-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex gap-1 items-center text-primary bg-primary/15 p-2 rounded-xl whitespace-nowrap">
              <span className="*:size-5 shrink-0">
                <HiUser />
              </span>
              {user.role === "user" && <p>حساب معمولی</p>}
              {user.role === "vendor" && <p>حساب فروشنده</p>}
              {user.role === "admin" && <p>حساب مدیریت</p>}
            </div>
            <div className="flex items-center rounded-xl border border-stone-300 *:transition shrink-0">
              <button className="*:size-5 py-1 px-2 hover:scale-[1.2]">
                <HiOutlineChevronRight />
              </button>
              <span className="text-stone-400">|</span>
              <button className="*:size-5 py-1 px-2 hover:scale-[1.2]">
                <HiOutlineChevronLeft />
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade to Vendor Option*/}
        {user.role === "user" && (
          <div className="relative overflow-hidden p-3 rounded-xl bg-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Presentational Shapes - hidden on very small screens to avoid clutter, scaled down on sm */}
            <div className="hidden sm:block absolute size-28 sm:size-40 rounded-full bg-emerald-500 -left-5 sm:-right-5 sm:left-auto z-20"></div>
            <div className="hidden sm:block absolute size-36 sm:size-50 rounded-full bg-emerald-500/50 -left-5 sm:-right-5 sm:left-auto z-10"></div>
            <div className="hidden sm:block absolute size-44 sm:size-60 rounded-full bg-emerald-500/30 -left-5 sm:-right-5 sm:left-auto"></div>

            <div className="flex gap-2 z-30 relative">
              <div className="size-13 p-2 *:size-full rounded-xl bg-white text-primary shrink-0">
                <HiPresentationChartLine />
              </div>
              <div>
                <h5 className="p-1 rounded-xl flex gap-2 items-center w-fit text-white">
                  <span>ارتقای حساب به تولیدی</span>
                </h5>
                <p className="text-xs text-stone-200 md:text-sm">
                  کاربر گرامی شما می توانید برای تولیدی خودتان حساب فروشنده
                  تولید کنید و محصولات خود را با دیگران به اشتراک بزارید.
                </p>
              </div>
            </div>
            <LinkButton
              variation="btn-light"
              href="#"
              customClass="rounded-xl bg-white hover:bg-primary hover:text-white sm:size-10"
            >
              <span className="sm:hidden">تغییر حساب به تولیدی</span>
              <span className="*:size-5">
                <HiArrowSmLeft />
              </span>
            </LinkButton>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
