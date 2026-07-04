"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  HiCheck,
  HiXMark,
  HiFolder,
  HiFolderOpen,
  HiEye,
  HiPencil,
  HiPlus,
  HiTrash,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiFunnel,
  HiTag,
  HiDocumentText,
} from "react-icons/hi2";
import { CategoryService } from "@/lib/modules/category/category.service";
import { CategoryAdminResponse } from "@/lib/modules/category/category.types";
import DataList, { DataListColumn } from "@/components/dashboard/Datalist";
import DetailModal from "@/components/dashboard/Detailmodal";
import { InfoRow, InfoBlock } from "@/components/dashboard/Inforow";
import StatusBadge from "@/components/dashboard/Statusbadge";
import { useNotification } from "@/utils/useNotification";
import { AppError } from "@/lib/core/errors/AppError";

const LIMIT = 10;

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
};

const EMPTY_FORM: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  parent_id: null,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
const notification = useNotification();
  const [categories, setCategories] = useState<CategoryAdminResponse[]>([]);
  const [allParentOptions, setAllParentOptions] = useState<
    CategoryAdminResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedCat, setSelectedCat] = useState<CategoryAdminResponse | null>(
    null,
  );
  const [catToDelete, setCatToDelete] = useState<CategoryAdminResponse | null>(
    null,
  );

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formTarget, setFormTarget] = useState<CategoryAdminResponse | null>(
    null,
  );
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadAllCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await CategoryService.list_all_categories_admin(
        LIMIT,
        offset,
        searchQuery || undefined,
        statusFilter !== "all" ? statusFilter : undefined,
      );

      if (response) {
        setCategories(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.total ?? response.data.length);
      }
    } catch (err) {
      setError("خطا در بارگذاری لیست دسته‌بندی‌ها؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  }, [offset, searchQuery, statusFilter]);

  const loadParentOptions = useCallback(async () => {
    try {
      const response = await CategoryService.list_all_categories_admin(
        200,
        0,
        undefined,
        "active",
      );
      setAllParentOptions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.log("Failed to load parent options:", err);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadAllCategories();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [loadAllCategories]);

  useEffect(() => {
    loadParentOptions();
  }, [loadParentOptions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOffset(0);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setOffset(0);
  };

  const handleUpdateStatus = async (
    categoryId: string,
    nextStatus: boolean,
  ) => {
    try {
      setIsActionLoading(categoryId);
      if (nextStatus) {
        await CategoryService.activate_category(categoryId);
      } else {
        await CategoryService.deactivate_category(categoryId);
      }

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, active: nextStatus } : cat,
        ),
      );

      if (selectedCat && selectedCat.id === categoryId) {
        setSelectedCat({ ...selectedCat, active: nextStatus });
      }
    } catch (err: any) {
      notification.error(err?.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    const categoryId = catToDelete.id;

    try {
      setIsDeleteLoading(categoryId);
      await CategoryService.delete_category(categoryId);

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      setTotalCount((prev) => Math.max(0, prev - 1));

      if (selectedCat && selectedCat.id === categoryId) {
        setSelectedCat(null);
      }
      setCatToDelete(null);
      loadParentOptions();
    } catch (err: any) {
      console.log("Failed to delete category:", err);
      if (err instanceof AppError) {
        notification.error(err.message);
      } else {
        notification.error("خطای غیرمنتظره‌ای رخ داد");
      }
        
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setFormTarget(null);
    setFormMode("create");
  };

  const openEditForm = (cat: CategoryAdminResponse) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parent_id: cat.parent_id,
    });
    setSlugTouched(true);
    setFormError(null);
    setFormTarget(cat);
    setFormMode("edit");
  };

  const closeForm = () => {
    if (isSaving) return;
    setFormMode(null);
    setFormTarget(null);
    setFormError(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleSubmitForm = async () => {
    setFormError(null);

    if (form.name.trim().length < 2) {
      setFormError("نام دسته‌بندی حداقل باید 2 کاراکتر باشد.");
      return;
    }
    if (!form.slug) {
      setFormError("اسلاگ الزامی است.");
      return;
    }

    try {
      setIsSaving(true);

      if (formMode === "create") {
        await CategoryService.create_category({
          name: form.name.trim(),
          slug: form.slug,
          description: form.description.trim() || undefined,
          parent_id: form.parent_id,
        });
      } else if (formMode === "edit" && formTarget) {
        await CategoryService.update_category(formTarget.id, {
          name: form.name.trim(),
          slug: form.slug,
          description: form.description.trim() || undefined,
          parent_id: form.parent_id,
        });
      }

      setFormMode(null);
      setFormTarget(null);
      await loadAllCategories();
      await loadParentOptions();
    } catch (err: any) {
      console.log("Failed to save category:", err);
      if (err instanceof AppError) {
        notification.error(err.message);
    } else {
        notification.error("خطای غیرمنتظره‌ای رخ داد");
    }
      setFormError(err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const parentOptionsForForm = useMemo(
    () => allParentOptions.filter((opt) => opt.id !== formTarget?.id),
    [allParentOptions, formTarget],
  );

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const columns: DataListColumn<CategoryAdminResponse>[] = [
    {
      key: "name",
      header: "نام دسته‌بندی",
      render: (cat) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200/60 flex items-center justify-center">
            {cat.parent_id ? (
              <HiFolder className="size-4.5 text-stone-400" />
            ) : (
              <HiFolderOpen className="size-4.5 text-emerald-500" />
            )}
          </div>
          <div>
            <div className="font-bold text-stone-800">{cat.name}</div>
            <div
              className="text-[10px] text-stone-400 font-mono mt-0.5"
              dir="ltr"
            >
              {cat.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      header: "دسته والد",
      render: (cat) =>
        cat.parent_name ? (
          <span className="font-bold text-stone-600">{cat.parent_name}</span>
        ) : (
          <span className="text-stone-400 text-[11px]">دسته اصلی (ریشه)</span>
        ),
    },
    {
      key: "description",
      header: "توضیحات",
      render: (cat) => (
        <span className="text-stone-500 text-[11px] line-clamp-1 max-w-[220px] block">
          {cat.description || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      render: (cat) => <StatusBadge active={cat.active} />,
    },
    {
      key: "actions",
      header: "عملیات",
      headerClassName: "text-left",
      render: (cat) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedCat(cat)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-all active:scale-95 cursor-pointer"
          >
            <HiEye className="size-4 text-stone-500" />
            <span>مشاهده</span>
          </button>

          <button
            onClick={() => openEditForm(cat)}
            title="ویرایش دسته‌بندی"
            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
          >
            <HiPencil className="size-4.5" />
          </button>

          {cat.active ? (
            <button
              disabled={isActionLoading === cat.id}
              onClick={() => handleUpdateStatus(cat.id, false)}
              title="غیرفعال‌سازی"
              className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <HiXMark className="size-4.5" />
            </button>
          ) : (
            <button
              disabled={isActionLoading === cat.id}
              onClick={() => handleUpdateStatus(cat.id, true)}
              title="فعال‌سازی"
              className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/10 disabled:opacity-40 cursor-pointer"
            >
              <HiCheck className="size-4.5" />
            </button>
          )}

          <button
            onClick={() => setCatToDelete(cat)}
            title="حذف دسته‌بندی"
            className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
          >
            <HiTrash className="size-4.5" />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (cat: CategoryAdminResponse) => (
    <div className="p-4 space-y-3 hover:bg-stone-50/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200/60 flex items-center justify-center">
            {cat.parent_id ? (
              <HiFolder className="size-5 text-stone-400" />
            ) : (
              <HiFolderOpen className="size-5 text-emerald-500" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-stone-800 text-sm">{cat.name}</h4>
            <div className="mt-1">
              <StatusBadge active={cat.active} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
        <div>
          <span className="text-stone-400">والد:</span>{" "}
          <span className="text-stone-700 font-bold">
            {cat.parent_name || "دسته اصلی"}
          </span>
        </div>
        <div className="text-left font-mono" dir="ltr">
          <span className="text-stone-400">اسلاگ:</span>{" "}
          <span className="text-stone-700">{cat.slug}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setSelectedCat(cat)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
        >
          <HiEye className="size-4 text-stone-500" />
          <span>جزئیات</span>
        </button>

        <button
          onClick={() => openEditForm(cat)}
          title="ویرایش"
          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <HiPencil className="size-5" />
        </button>

        {cat.active ? (
          <button
            disabled={isActionLoading === cat.id}
            onClick={() => handleUpdateStatus(cat.id, false)}
            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <HiXMark className="size-5" />
          </button>
        ) : (
          <button
            disabled={isActionLoading === cat.id}
            onClick={() => handleUpdateStatus(cat.id, true)}
            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <HiCheck className="size-5" />
          </button>
        )}

        <button
          onClick={() => setCatToDelete(cat)}
          title="حذف دسته‌بندی"
          className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <HiTrash className="size-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-5 antialiased min-h-0 animate-in fade-in duration-300">
      <div className="border-b border-stone-200/60 pb-4 shrink-0 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-stone-900">
            <HiFolderOpen className="size-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              مدیریت دسته‌بندی‌ها
            </h2>
          </div>
          <p className="text-xs font-medium text-stone-500 mt-1.5">
            ساخت، ویرایش و سازمان‌دهی درخت دسته‌بندی محصولات و کارگاه‌های
            تولیدی.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/10"
        >
          <HiPlus className="size-4" />
          <span>دسته‌بندی جدید</span>
        </button>
      </div>

      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 shrink-0 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <HiMagnifyingGlass className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا اسلاگ دسته‌بندی..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pr-10 pl-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="relative w-full sm:w-48 flex items-center">
          <HiFunnel className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full pr-9 pl-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none border-solid border-t-stone-400 border-t-4 border-x-transparent border-x-4 border-b-0" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <DataList
          data={categories}
          keyExtractor={(cat) => cat.id}
          columns={columns}
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
          error={error}
          emptyIcon={<HiFolderOpen className="size-5" />}
          emptyTitle="هیچ دسته‌بندی‌ای یافت نشد"
          emptyDescription={
            searchQuery || statusFilter !== "all"
              ? "دسته‌بندی‌ای با فیلترهای اعمال شده مطابقت ندارد."
              : "در حال حاضر دسته‌بندی‌ای ثبت نشده است."
          }
          loadingLabel="در حال بارگذاری اطلاعات دسته‌بندی‌ها..."
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={LIMIT}
          onPageChange={(page) => setOffset((page - 1) * LIMIT)}
          itemLabel="دسته‌بندی"
        />
      </div>

      {selectedCat && (
        <DetailModal
          icon={<HiFolderOpen className="size-5 text-emerald-600" />}
          title="جزئیات دسته‌بندی"
          onClose={() => setSelectedCat(null)}
          footer={
            <>
              <button
                onClick={() => {
                  setSelectedCat(null);
                  openEditForm(selectedCat);
                }}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors cursor-pointer"
              >
                <HiPencil className="size-4" />
                <span>ویرایش</span>
              </button>

              {selectedCat.active ? (
                <button
                  disabled={isActionLoading === selectedCat.id}
                  onClick={() => handleUpdateStatus(selectedCat.id, false)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <HiXMark className="size-4" />
                  <span>غیرفعال‌سازی</span>
                </button>
              ) : (
                <button
                  disabled={isActionLoading === selectedCat.id}
                  onClick={() => handleUpdateStatus(selectedCat.id, true)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-md shadow-emerald-600/10 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <HiCheck className="size-4" />
                  <span>فعال‌سازی</span>
                </button>
              )}

              <button
                onClick={() => setCatToDelete(selectedCat)}
                className="w-full sm:w-auto inline-flex items-center justify-center p-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                title="حذف دسته‌بندی"
              >
                <HiTrash className="size-4" />
              </button>
            </>
          }
        >
          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200/50">
            <InfoRow
              icon={<HiFolderOpen className="size-3.5" />}
              label="نام دسته‌بندی"
              value={selectedCat.name}
            />
            <InfoRow
              icon={<HiTag className="size-3.5" />}
              label="اسلاگ"
              value={selectedCat.slug}
              ltr
            />
            <InfoRow
              icon={<HiFolder className="size-3.5" />}
              label="دسته والد"
              value={selectedCat.parent_name || "دسته اصلی (ریشه)"}
            />
          </div>

          {selectedCat.description && (
            <InfoBlock
              icon={<HiDocumentText className="size-3.5" />}
              label="توضیحات"
              value={selectedCat.description}
            />
          )}
        </DetailModal>
      )}

      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={closeForm}
          />
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white shrink-0">
              <div className="flex items-center gap-2 text-emerald-600">
                {formMode === "create" ? (
                  <HiPlus className="size-5" />
                ) : (
                  <HiPencil className="size-5" />
                )}
                <h3 className="font-black text-sm text-stone-800">
                  {formMode === "create"
                    ? "ساخت دسته‌بندی جدید"
                    : "ویرایش دسته‌بندی"}
                </h3>
              </div>
              <button
                disabled={isSaving}
                onClick={closeForm}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <HiXMark className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold px-3 py-2 rounded-xl">
                  <HiExclamationTriangle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-600">
                  نام دسته‌بندی
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="مثلاً مبلمان و صندلی"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-600">
                  اسلاگ (URL)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={handleSlugChange}
                  placeholder="mobleman-sandali"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                  <HiFolder className="size-3.5 text-stone-400" />
                  <span>دسته والد</span>
                </label>

                <div className="relative">
                  <select
                    value={form.parent_id ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        parent_id: e.target.value || null,
                      }))
                    }
                    className="w-full pr-10 pl-10 py-3 bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="font-bold text-stone-500">
                      — بدون والد (دسته اصلی / ریشه) —
                    </option>
                    {parentOptionsForForm.map((opt) => (
                      <option
                        key={opt.id}
                        value={opt.id}
                        className="text-stone-800 py-2"
                      >
                        {opt.parent_name
                          ? `${opt.parent_name}  ←  ${opt.name}`
                          : opt.name}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <HiFolder className="size-4.5" />
                  </div>

                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center pr-2 border-r border-stone-200 text-stone-400">
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 font-medium mr-1">
                  اگر این دسته قرار است زیرمجموعه دسته دیگری باشد، والد آن را
                  انتخاب کنید.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-600">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="توضیح کوتاهی درباره این دسته‌بندی بنویسید..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-stone-100 bg-white shrink-0 flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSubmitForm}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/10"
              >
                {isSaving
                  ? "در حال ذخیره..."
                  : formMode === "create"
                    ? "ساخت دسته‌بندی"
                    : "ذخیره تغییرات"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={closeForm}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => !isDeleteLoading && setCatToDelete(null)}
          />
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white shrink-0">
              <div className="flex items-center gap-2 text-rose-600">
                <HiExclamationTriangle className="size-5" />
                <h3 className="font-black text-sm text-stone-800">
                  حذف دسته‌بندی
                </h3>
              </div>
              <button
                disabled={isDeleteLoading === catToDelete.id}
                onClick={() => setCatToDelete(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <HiXMark className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-right">
              <p className="text-xs text-stone-600 leading-relaxed">
                آیا از حذف دسته‌بندی{" "}
                <span className="font-black text-stone-900">
                  «{catToDelete.name}»
                </span>{" "}
                اطمینان دارید؟ اگر این دسته‌بندی زیرمجموعه داشته باشد، امکان حذف
                آن وجود ندارد.
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isDeleteLoading === catToDelete.id}
                  onClick={handleConfirmDelete}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-95 cursor-pointer shadow-sm shadow-rose-600/10"
                >
                  {isDeleteLoading === catToDelete.id
                    ? "در حال حذف..."
                    : "بله، حذف شود"}
                </button>
                <button
                  type="button"
                  disabled={isDeleteLoading === catToDelete.id}
                  onClick={() => setCatToDelete(null)}
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
