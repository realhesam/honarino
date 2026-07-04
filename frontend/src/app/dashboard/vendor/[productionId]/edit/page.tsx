"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiOutlineArrowRight } from "react-icons/hi2";
import EditProductionForm from "@/components/production/EditProductionForm";
import { ProductionService } from "@/lib/modules/production/production.service";

export default function EditProductionPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params.productionId as string;

  const [productionData, setProductionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduction() {
      try {
        if (!productionId) return;
        const data = await ProductionService.getById(productionId);
        setProductionData(data);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات تولیدی:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduction();
  }, [productionId]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px] text-xs font-bold text-stone-500 animate-pulse"
        dir="rtl"
      >
        در حال بارگذاری و بازیابی اطلاعات کارگاه...
      </div>
    );
  }

  if (!productionData) {
    return (
      <div
        className="text-center py-12 text-xs font-bold text-stone-500"
        dir="rtl"
      >
        اطلاعات تولیدی مورد نظر یافت نشد یا دسترسی به آن محدود شده است.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 antialiased" dir="rtl">
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-black text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <HiOutlineArrowRight className="size-4 stroke-[2.5]" />
          <span>بازگشت به مدیریت تولیدی</span>
        </button>
      </div>

      <EditProductionForm
        initialData={{
          id: productionData.id,
          shopId: productionData.shop_id,
          shopName: productionData.shop_name,
          shopDescription: productionData.shop_description,
          categories: productionData.categories || [],
          productionAddress: productionData.production_address,
          productionPhone: productionData.production_phone,
          productionEmail: productionData.production_email,
          telegram: productionData.telegram,
          whatsapp: productionData.whatsapp,
          rubika: productionData.rubika,
          eitaa: productionData.eitaa,
          website: productionData.website,
          logoUrl: productionData.logo_url,
          bannerUrl: productionData.banner_url,
          coverUrl: productionData.cover_url,
        }}
        onSaveSuccess={() => {}}
      />
    </div>
  );
}
