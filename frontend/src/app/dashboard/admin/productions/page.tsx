"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiCheck,
  HiXMark,
  HiMapPin,
  HiFolder,
  HiBuildingStorefront,
  HiUser,
  HiEye,
  HiAdjustmentsHorizontal,
  HiPhone,
  HiTrash,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiFunnel,
} from "react-icons/hi2";
import { ProductionService } from "@/lib/modules/production/production.service";
import { Production } from "@/lib/modules/production/production.types";
import DataList, { DataListColumn } from "@/components/dashboard/Datalist";
import DetailModal from "@/components/dashboard/Detailmodal";
import { InfoRow, InfoBlock } from "@/components/dashboard/Inforow";
import StatusBadge from "@/components/dashboard/Statusbadge";

const LIMIT = 10;

export default function AdminProductionsPage() {
  const router = useRouter();
  const [productions, setProductions] = useState<Production[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedProd, setSelectedProd] = useState<Production | null>(null);
  const [prodToDelete, setProdToDelete] = useState<Production | null>(null);

  const loadAllProductions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ProductionService.adminList(LIMIT, offset, {
        search: searchQuery || "",
        status: statusFilter || "all",
      });

      if (response) {
        setProductions(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.total ?? response.data.length);
      }
    } catch (err: any) {
      console.error("Failed to load admin productions:", err);
      setError("خطا در بارگذاری لیست کارگاه‌ها؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  }, [offset, searchQuery, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadAllProductions();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [loadAllProductions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOffset(0);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setOffset(0);
  };

  const handleUpdateStatus = async (productionId: string, nextStatus: boolean) => {
    try {
      setIsActionLoading(productionId);
      await ProductionService.toggleActivate(productionId, nextStatus);

      setProductions((prev) =>
        prev.map((prod) =>
          prod.id === productionId ? { ...prod, active: nextStatus } : prod
        )
      );

      if (selectedProd && selectedProd.id === productionId) {
        setSelectedProd({ ...selectedProd, active: nextStatus });
      }
    } catch (err) {
      console.error("Failed to change production status:", err);
      alert("اعمال تغییرات با خطا مواجه شد.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!prodToDelete) return;
    const productionId = prodToDelete.id;

    try {
      setIsDeleteLoading(productionId);
      await ProductionService.delete(productionId);

      setProductions((prev) => prev.filter((prod) => prod.id !== productionId));
      setTotalCount((prev) => Math.max(0, prev - 1));

      if (selectedProd && selectedProd.id === productionId) {
        setSelectedProd(null);
      }
      setProdToDelete(null);
    } catch (err) {
      console.error("Failed to delete production:", err);
      alert("حذف کارگاه با خطا مواجه شد.");
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const goToProducts = (id: string) => router.push(`/dashboard/vendor/${id}/products`);

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const columns: DataListColumn<Production>[] = [
    {
      key: "shop",
      header: "اطلاعات و عنوان کارگاه",
      render: (prod) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg overflow-hidden relative shrink-0 bg-stone-100 border border-stone-200/60">
            <Image
              src={prod.logo_url || "/images/default-production.jpg"}
              alt={prod.shop_name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="font-bold text-stone-800">{prod.shop_name}</div>
            <div className="text-[10px] text-stone-400 font-mono mt-0.5 truncate max-w-[180px]" dir="ltr">
              {prod.categories?.join("، ") || "بدون رسته"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "مالک کارگاه",
      render: (prod) => <span className="font-bold text-stone-600">{prod.owner_name || "—"}</span>,
    },
    {
      key: "phone",
      header: "شماره تماس",
      render: (prod) => <span className="font-mono text-stone-600" dir="ltr">{prod.production_phone || "—"}</span>,
    },
    {
      key: "status",
      header: "وضعیت",
      render: (prod) => <StatusBadge active={prod.active} />,
    },
    {
      key: "actions",
      header: "عملیات بررسی",
      headerClassName: "text-left",
      render: (prod) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedProd(prod)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-all active:scale-95 cursor-pointer"
          >
            <HiEye className="size-4 text-stone-500" />
            <span>مشاهده</span>
          </button>

          <button
            onClick={() => goToProducts(prod.id)}
            title="مدیریت محصولات"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-all active:scale-95 cursor-pointer"
          >
            <HiAdjustmentsHorizontal className="size-4" />
          </button>

          {prod.active ? (
            <button
              disabled={isActionLoading === prod.id}
              onClick={() => handleUpdateStatus(prod.id, false)}
              title="غیرفعال سازی"
              className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <HiXMark className="size-4.5" />
            </button>
          ) : (
            <button
              disabled={isActionLoading === prod.id}
              onClick={() => handleUpdateStatus(prod.id, true)}
              title="تایید کارگاه"
              className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/10 disabled:opacity-40 cursor-pointer"
            >
              <HiCheck className="size-4.5" />
            </button>
          )}

          <button
            onClick={() => setProdToDelete(prod)}
            title="حذف کارگاه"
            className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
          >
            <HiTrash className="size-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (prod: Production) => (
    <div className="p-4 space-y-3 hover:bg-stone-50/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden relative shrink-0 bg-stone-100 border border-stone-200/60">
            <Image
              src={prod.logo_url || "/images/default-production.jpg"}
              alt={prod.shop_name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h4 className="font-bold text-stone-800 text-sm">{prod.shop_name}</h4>
            <div className="mt-1">
              <StatusBadge active={prod.active} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
        <div>
          <span className="text-stone-400">مالک:</span>{" "}
          <span className="text-stone-700 font-bold">{prod.owner_name || "ثبت نشده"}</span>
        </div>
        <div className="text-left">
          <span className="text-stone-400">تماس:</span>{" "}
          <span className="font-mono text-stone-700">{prod.production_phone || "ثبت نشده"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setSelectedProd(prod)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
        >
          <HiEye className="size-4 text-stone-500" />
          <span>جزئیات</span>
        </button>

        <button
          onClick={() => goToProducts(prod.id)}
          title="مدیریت محصولات"
          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <HiAdjustmentsHorizontal className="size-5" />
        </button>

        {prod.active ? (
          <button
            disabled={isActionLoading === prod.id}
            onClick={() => handleUpdateStatus(prod.id, false)}
            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <HiXMark className="size-5" />
          </button>
        ) : (
          <button
            disabled={isActionLoading === prod.id}
            onClick={() => handleUpdateStatus(prod.id, true)}
            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <HiCheck className="size-5" />
          </button>
        )}

        <button
          onClick={() => setProdToDelete(prod)}
          title="حذف کارگاه"
          className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <HiTrash className="size-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-5 antialiased min-h-0 animate-in fade-in duration-300">
      {/* هدر صفحه */}
      <div className="border-b border-stone-200/60 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-stone-900">
          <HiBuildingStorefront className="size-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            مدیریت کارگاه‌های تولیدی
          </h2>
        </div>
        <p className="text-xs font-medium text-stone-500 mt-1.5">
          سیستم یکپارچه نظارت، تایید، حذف یا لغو صلاحیت کارگاه‌ها و ورود مستقیم به پنل محصولات.
        </p>
      </div>

      {/* نوار فیلتر و جستجو */}
      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 shrink-0 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <HiMagnifyingGlass className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام کارگاه، نام مالک یا شماره تماس..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pr-10 pl-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="relative w-full sm:w-48 flex items-center">
          <HiFunnel className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full pr-9 pl-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">کارگاه‌های فعال</option>
            <option value="inactive">کارگاه‌های غیرفعال</option>
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none border-solid border-t-stone-400 border-t-4 border-x-transparent border-x-4 border-b-0" />
        </div>
      </div>

      {/* جدول و لیست */}
      <div className="flex-1 flex flex-col min-h-0">
        <DataList
          data={productions}
          keyExtractor={(prod) => prod.id}
          columns={columns}
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
          error={error}
          emptyIcon={<HiBuildingStorefront className="size-5" />}
          emptyTitle="هیچ واحد تولیدی یافت نشد"
          emptyDescription={
            searchQuery || statusFilter !== "all"
              ? "کارگاهی با فیلترهای اعمال شده مطابقت ندارد."
              : "در حال حاضر کارگاهی در این بخش ثبت نشده است."
          }
          loadingLabel="در حال بارگذاری اطلاعات پنل مدیریت تولیدی‌ها..."
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={LIMIT}
          onPageChange={(page) => setOffset((page - 1) * LIMIT)}
          itemLabel="کارگاه"
        />
      </div>

      {/* مودال جزئیات واحد تولیدی */}
      {selectedProd && (
        <DetailModal
          icon={<HiBuildingStorefront className="size-5 text-blue-600" />}
          title="جزئیات و اصالت‌سنجی تولیدی"
          onClose={() => setSelectedProd(null)}
          footer={
            <>
              <button
                onClick={() => {
                  setSelectedProd(null);
                  goToProducts(selectedProd.id);
                }}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
              >
                <HiAdjustmentsHorizontal className="size-4" />
                <span>مدیریت محصولات</span>
              </button>

              {selectedProd.active ? (
                <button
                  disabled={isActionLoading === selectedProd.id}
                  onClick={() => handleUpdateStatus(selectedProd.id, false)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <HiXMark className="size-4" />
                  <span>غیرفعال‌سازی</span>
                </button>
              ) : (
                <button
                  disabled={isActionLoading === selectedProd.id}
                  onClick={() => handleUpdateStatus(selectedProd.id, true)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-md shadow-emerald-600/10 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <HiCheck className="size-4" />
                  <span>تایید صلاحیت کارگاه</span>
                </button>
              )}

              <button
                onClick={() => setProdToDelete(selectedProd)}
                className="w-full sm:w-auto inline-flex items-center justify-center p-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                title="حذف کامل کارگاه"
              >
                <HiTrash className="size-4" />
              </button>
            </>
          }
        >
          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/50">
            <InfoRow icon={<HiBuildingStorefront className="size-3.5" />} label="نام کارگاه" value={selectedProd.shop_name} />
            <InfoRow icon={<HiUser className="size-3.5" />} label="نام مالک" value={selectedProd.owner_name || "ثبت نشده"} />
            <InfoRow icon={<HiPhone className="size-3.5" />} label="شماره تماس" value={selectedProd.production_phone || "ثبت نشده"} ltr />
            <InfoRow icon={<HiFolder className="size-3.5" />} label="رسته‌ها" value={selectedProd.categories?.join("، ") || "بدون رسته"} />
          </div>

          <InfoBlock icon={<HiMapPin className="size-3.5" />} label="نشانی و آدرس کارگاه" value={selectedProd.production_address || "آدرسی درج نشده است."} />

          {selectedProd.description && (
            <InfoBlock icon={null} label="توضیحات تکمیلی فعالیت" value={selectedProd.description} />
          )}
        </DetailModal>
      )}

      {/* مودال تایید حذف کارگاه */}
      {prodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => !isDeleteLoading && setProdToDelete(null)}
          />
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white shrink-0">
              <div className="flex items-center gap-2 text-rose-600">
                <HiExclamationTriangle className="size-5" />
                <h3 className="font-black text-sm text-stone-800">حذف کارگاه تولیدی</h3>
              </div>
              <button
                disabled={isDeleteLoading === prodToDelete.id}
                onClick={() => setProdToDelete(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <HiXMark className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-right">
              <p className="text-xs text-stone-600 leading-relaxed">
                آیا از حذف کامل کارگاه <span className="font-black text-stone-900">«{prodToDelete.shop_name}»</span> متعلق به{" "}
                <span className="font-bold text-stone-800">{prodToDelete.owner_name || "ثبت نشده"}</span> و ابطال کامل دسترسی‌ها و محصولات آن اطمینان دارید؟ این عمل غیرقابل بازگشت است.
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isDeleteLoading === prodToDelete.id}
                  onClick={handleConfirmDelete}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-95 cursor-pointer shadow-sm shadow-rose-600/10"
                >
                  {isDeleteLoading === prodToDelete.id ? "در حال حذف..." : "بله، حذف شود"}
                </button>
                <button
                  type="button"
                  disabled={isDeleteLoading === prodToDelete.id}
                  onClick={() => setProdToDelete(null)}
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}