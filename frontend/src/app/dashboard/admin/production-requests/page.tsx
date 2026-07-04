"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiEye,
  HiCheckCircle,
  HiXCircle,
  HiUser,
  HiIdentification,
  HiPhone,
  HiDocumentText,
  HiClock,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { HiBadgeCheck } from "react-icons/hi";
import { VendorService } from "@/lib/modules/vendor/vendor.service";
import type { VendorRequestResponse } from "@/lib/modules/vendor/vendor.types";
import DataList, { DataListColumn } from "@/components/dashboard/Datalist";
import DetailModal from "@/components/dashboard/Detailmodal";
import { InfoRow, InfoBlock } from "@/components/dashboard/Inforow";

const ITEMS_PER_PAGE = 6;

export default function ProductionRequestsPage() {
  const [requests, setRequests] = useState<VendorRequestResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<VendorRequestResponse | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await VendorService.list_requests(
        ITEMS_PER_PAGE,
        offset,
        debouncedSearch,
      );

      if (res) {
        setRequests(Array.isArray(res.data) ? res.data : []);
        setTotal(res.total ?? res.data.length);
      }
    } catch (err: any) {
      console.error("fetch requests failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [offset, debouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    try {
      await VendorService.approve_request(id);
      await fetchRequests();
      if (selectedRequest?.id === id) setSelectedRequest(null);
    } catch (err: any) {
      console.error("approve failed:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await VendorService.delete_request(id);
      await fetchRequests();
      if (selectedRequest?.id === id) setSelectedRequest(null);
    } catch (err: any) {
      console.error("reject failed:", err);
    }
  };

  const columns: DataListColumn<VendorRequestResponse>[] = [
    {
      key: "applicant",
      header: "مشخصات متقاضی",
      render: (req) => (
        <>
          <div className="font-bold text-stone-800">{req.fullname}</div>
          <div
            className="text-[10px] text-stone-400 font-mono mt-0.5"
            dir="ltr"
          >
            {req.email}
          </div>
        </>
      ),
    },
    {
      key: "nid",
      header: "کد ملی",
      render: (req) => (
        <span className="font-mono text-stone-600" dir="ltr">
          {req.nid}
        </span>
      ),
    },
    {
      key: "phone",
      header: "شماره تماس",
      render: (req) => (
        <span className="font-mono text-stone-600" dir="ltr">
          {req.phone}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "زمان ثبت درخواست",
      render: (req) => (
        <span className="text-stone-500">
          {new Date(req.created_at).toLocaleDateString("fa-IR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "عملیات بررسی",
      headerClassName: "text-left",
      render: (req) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedRequest(req)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-all active:scale-95 cursor-pointer"
          >
            <HiEye className="size-4 text-stone-500" />
            <span>مشاهده کامل</span>
          </button>
          <button
            onClick={() => handleReject(req.id)}
            className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <HiXCircle className="size-4.5" />
          </button>
          <button
            onClick={() => handleApprove(req.id)}
            className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/10 cursor-pointer"
          >
            <HiCheckCircle className="size-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (req: VendorRequestResponse) => (
    <div className="p-4 space-y-3 hover:bg-stone-50/30 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-stone-800 text-sm">{req.fullname}</h4>
          <p className="text-[10px] text-stone-400 font-mono mt-0.5" dir="ltr">
            {req.email}
          </p>
        </div>
        <div className="text-left text-[11px] text-stone-400 shrink-0">
          {new Date(req.created_at).toLocaleDateString("fa-IR")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
        <div>
          <span className="text-stone-400">کد ملی:</span>{" "}
          <span className="font-mono text-stone-700">{req.nid}</span>
        </div>
        <div className="text-left">
          <span className="text-stone-400">تماس:</span>{" "}
          <span className="font-mono text-stone-700">{req.phone}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setSelectedRequest(req)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
        >
          <HiEye className="size-4 text-stone-500" />
          <span>مشاهده کامل</span>
        </button>
        <button
          onClick={() => handleReject(req.id)}
          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <HiXCircle className="size-5" />
        </button>
        <button
          onClick={() => handleApprove(req.id)}
          className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
        >
          <HiCheckCircle className="size-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-5 antialiased min-h-0 animate-in fade-in duration-300">
      {/* هدر صفحه */}
      <div className="border-b border-stone-200/60 pb-4 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-900">
            <HiBadgeCheck className="size-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              مدیریت درخواست‌های ارتقاء
            </h2>
          </div>
          <p className="text-xs font-medium text-stone-500 mt-1.5">
            بررسی نهایی، تایید یا رد درخواست‌های کاربران متقاضی دسترسی فروشنده و
            تولیدی.
          </p>
        </div>

        {/* باکس سرچ متصل به استیت لایو */}
        <div className="relative w-full sm:w-72 shrink-0">
          <HiMagnifyingGlass className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <input
            type="text"
            placeholder="جستجوی نام، کد ملی، تماس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* بخش جدول */}
      <div className="flex-1 flex flex-col min-h-0">
        <DataList
          data={requests}
          keyExtractor={(req) => req.id}
          columns={columns}
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
          emptyIcon={<HiBadgeCheck className="size-5" />}
          emptyTitle="درخواستی یافت نشد"
          emptyDescription={
            debouncedSearch
              ? "هیچ درخواستی با این مشخصات پیدا نشد."
              : "هیچ درخواست جدیدی برای بررسی وجود ندارد."
          }
          loadingLabel="در حال بارگذاری درخواست‌ها..."
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="درخواست"
        />
      </div>

      {/* مودال جزئیات */}
      {selectedRequest && (
        <DetailModal
          icon={<HiClock className="size-5 text-emerald-600" />}
          title="جزئیات کامل شناسنامه درخواست"
          onClose={() => setSelectedRequest(null)}
          footer={
            <>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <HiXCircle className="size-4" />
                <span>رد درخواست</span>
              </button>
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
              >
                <HiCheckCircle className="size-4" />
                <span>تایید دسترسی</span>
              </button>
            </>
          }
        >
          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/50">
            <InfoRow
              icon={<HiUser className="size-3.5" />}
              label="نام و نام خانوادگی"
              value={selectedRequest.fullname}
            />
            <InfoRow
              icon={<HiIdentification className="size-3.5" />}
              label="کد ملی"
              value={selectedRequest.nid}
              ltr
            />
            <InfoRow
              icon={<HiPhone className="size-3.5" />}
              label="شماره تماس"
              value={selectedRequest.phone}
              ltr
            />
            <InfoRow
              icon="@"
              label="ایمیل اکانت"
              value={selectedRequest.email}
              ltr
            />
            <InfoRow
              icon={<HiClock className="size-3.5" />}
              label="زمان ثبت"
              value={new Date(selectedRequest.created_at).toLocaleDateString(
                "fa-IR",
              )}
            />
          </div>

          <InfoBlock
            icon={<HiDocumentText className="size-3.5" />}
            label="توضیحات متقاضی"
            value={
              selectedRequest.description ||
              "توضیحاتی برای این درخواست ثبت نشده است."
            }
          />
        </DetailModal>
      )}
    </div>
  );
}
