"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import AccessDeniedState from "@/components/dashboard/AccessDeniedState";
import { ProductionService } from "@/lib/modules/production/production.service";
import { useParams } from "next/navigation";

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const productionId = params.productionId as string;
  const { user, isLoading: isUserLoading } = useUser();

  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    if (
      isUserLoading ||
      !user ||
      (user.role !== "vendor" && user.role !== "admin")
    ) {
      return;
    }

    async function checkBackendAccess() {
      try {
        await ProductionService.isProductionActive(productionId);
        setHasAccess(true);
      } catch (err) {
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    }

    checkBackendAccess();
  }, [productionId, user, isUserLoading]);

  if (
    isUserLoading ||
    (user &&
      (user.role === "vendor" || user.role === "admin") &&
      isCheckingAccess)
  ) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-stone-200 bg-white p-8 text-sm text-stone-500">
        در حال بررسی دسترسی...
      </div>
    );
  }

  if (!user || (user.role !== "vendor" && user.role !== "admin")) {
    return (
      <AccessDeniedState
        title="شما به این بخش دسترسی ندارید"
        message="برای ورود به مدیریت کارگاه‌ها، باید حساب کاربری شما به سطح تولیدکننده یا مدیریت ارتقا یافته باشد."
        actionLabel="بازگشت به حساب کاربری"
        actionHref="/dashboard/account"
        tone="vendor"
      />
    );
  }

  if (!hasAccess) {
    return (
      <AccessDeniedState
        title="شما به این بخش دسترسی ندارید"
        message="شما هیچ دسترسی به این تولیدی ندارید. لطفاً با مدیر سیستم تماس بگیرید."
        actionLabel="بازگشت به حساب کاربری"
        actionHref="/dashboard/account"
        tone="vendor"
      />
    );
  }

  return <>{children}</>;
}
