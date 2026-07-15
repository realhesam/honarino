"use client";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import {
  HiCheck,
  HiXMark,
  HiEye,
  HiPencil,
  HiPlus,
  HiTrash,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiFunnel,
  HiShoppingBag,
  HiDocumentText,
  HiCurrencyDollar,
  HiPhoto,
  HiArrowUpTray,
  HiArrowRight,
  HiCloudArrowUp,
} from "react-icons/hi2";
import { ProductService } from "@/lib/modules/product/product.service";
import { ProductAPI } from "@/lib/modules/product/product.api";
import { ProductResponse } from "@/lib/modules/product/product.types";
import { ProductionService } from "@/lib/modules/production/production.service";
import { CategoryService } from "@/lib/modules/category/category.service";
import DataList, { DataListColumn } from "@/components/dashboard/Datalist";
import DetailModal from "@/components/dashboard/Detailmodal";
import { InfoRow, InfoBlock } from "@/components/dashboard/Inforow";
import StatusBadge from "@/components/dashboard/Statusbadge";
import { useNotification } from "@/utils/useNotification";

const LIMIT = 10;

type ProductFormState = {
  title: string;
  slug: string;
  description: string;
  is_price_hidden: boolean;
  from_price: number | null;
  to_price: number | null;
  material: string;
  style: string;
  dimensions: string;
  production_time_days: number | null;
  is_customizable: boolean;
  category_ids: string[];
};

const EMPTY_FORM: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  is_price_hidden: false,
  from_price: null,
  to_price: null,
  material: "",
  style: "",
  dimensions: "",
  production_time_days: null,
  is_customizable: false,
  category_ids: [],
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface PageProps {
  params: Promise<{ productionId: string }>;
}

export default function VendorProductsPage({ params }: PageProps) {
  const { productionId } = use(params);
  const notification = useNotification();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [allowedSubCategories, setAllowedSubCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [shopHasNoCategories, setShopHasNoCategories] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [productToDelete, setProductToDelete] =
    useState<ProductResponse | null>(null);
  const [galleryProduct, setGalleryProduct] = useState<ProductResponse | null>(
    null,
  );

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [formTarget, setFormTarget] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [mediaForm, setMediaForm] = useState({
    type: "image" as "image" | "video",
    sort_order: 0,
    alt_text: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const loadShopAllowedCategories = useCallback(async () => {
    try {
      setIsCategoriesLoading(true);
      setShopHasNoCategories(false);

      const shop = await ProductionService.getById(productionId);
      if (!shop || !shop.categories || shop.categories.length === 0) {
        setShopHasNoCategories(true);
        return;
      }

      const branches = await Promise.all(
        shop.categories.map(async (cat: { id: string; name?: string }) => {
          try {
            const rootCatId = cat.id;
            const rootName = cat.name || "دسته ریشه";
            const response =
              await CategoryService.list_child_categories(rootCatId);
            const subCats =
              response && Array.isArray(response.data)
                ? response.data
                : Array.isArray(response)
                  ? response
                  : [];

            return {
              rootId: rootCatId,
              rootName: rootName,
              subCategories: subCats,
            };
          } catch (err) {
            return {
              rootId: cat.id,
              rootName: cat.name || "خطا در بارگذاری",
              subCategories: [],
            };
          }
        }),
      );

      setAllowedSubCategories(branches);
    } catch (err) {
      console.error("Failed to load shop categories structure", err);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [productionId]);

  const loadShopProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ProductAPI.listShopProducts(
        productionId,
        LIMIT,
        offset,
      );
      if (response && response.data) {
        let filtered = response.data.data || [];
        if (searchQuery) {
          filtered = filtered.filter(
            (p) =>
              p.title.includes(searchQuery) || p.slug.includes(searchQuery),
          );
        }
        if (statusFilter !== "all") {
          filtered = filtered.filter((p) => p.status === statusFilter);
        }
        setProducts(filtered);
        setTotalCount(response.data.total ?? filtered.length);
      }
    } catch (err) {
      setError("خطا در بارگذاری لیست محصولات غرفه؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  }, [productionId, offset, searchQuery, statusFilter]);

  useEffect(() => {
    loadShopAllowedCategories();
  }, [loadShopAllowedCategories]);
  useEffect(() => {
    loadShopProducts();
  }, [loadShopProducts]);

  const handleUpdateStatus = async (
    product: ProductResponse,
    nextStatus: boolean,
  ) => {
    try {
      setIsActionLoading(product.id);
      await ProductService.toggleActivate(productionId, product.id, nextStatus);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: nextStatus ? "active" : "inactive" }
            : p,
        ),
      );
      notification.success(
        nextStatus ? "محصول با موفقیت فعال شد." : "محصول غیرفعال شد.",
      );
    } catch (err: any) {
      notification.error(err?.message || "خطا در تغییر وضعیت محصول");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleteLoading(productToDelete.id);
      await ProductService.delete(productionId, productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setProductToDelete(null);
      notification.success("محصول با موفقیت حذف شد.");
    } catch (err: any) {
      notification.error(err?.message || "خطا در حذف محصول");
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const openCreateForm = () => {
    if (shopHasNoCategories) {
      notification.error(
        "ابتدا باید دسته‌بندی‌های ریشه غرفه را در بخش تنظیمات فروشگاه مشخص کنید.",
      );
      return;
    }
    setForm(EMPTY_FORM);
    setFormStep(1);
    setSlugTouched(false);
    setFormError(null);
    setFormTarget(null);
    setFormMode("create");
  };

  const openEditForm = (p: ProductResponse) => {
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      is_price_hidden: p.is_price_hidden,
      from_price: p.from_price,
      to_price: p.to_price,
      material: p.material || "",
      style: p.style || "",
      dimensions: p.dimensions || "",
      production_time_days: p.production_time_days,
      is_customizable: p.is_customizable,
      category_ids: p.categories.map((c) => c.id),
    });
    setFormStep(1);
    setSlugTouched(true);
    setFormError(null);
    setFormTarget(p);
    setFormMode("edit");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  };

  const handleCategoryCheckboxChange = (catId: string, checked: boolean) => {
    setForm((prev) => {
      const updated = checked
        ? [...prev.category_ids, catId]
        : prev.category_ids.filter((id) => id !== catId);
      return { ...prev, category_ids: updated };
    });
  };

  const handleNextStep = () => {
    setFormError(null);
    if (formStep === 1) {
      if (form.title.trim().length < 2) {
        setFormError("عنوان محصول حداقل باید ۲ کاراکتر باشد.");
        return;
      }
      if (form.category_ids.length === 0) {
        setFormError("حداقل یک زیردسته باید انتخاب شود.");
        return;
      }
      setFormStep(2);
    } else if (formStep === 2) {
      if (!form.is_price_hidden) {
        if (form.from_price === null || form.to_price === null) {
          setFormError(
            "در حالت نمایش قیمت، وارد کردن هردو بازه قیمت الزامی است.",
          );
          return;
        }
        if (form.from_price > form.to_price) {
          setFormError("قیمت شروع نباید از قیمت پایان بزرگتر باشد.");
          return;
        }
      }
      setFormStep(3);
    }
  };

  const handleSubmitForm = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...form,
        material: form.material.trim() || null,
        style: form.style.trim() || null,
        dimensions: form.dimensions.trim() || null,
      };

      if (formMode === "create") {
        await ProductAPI.create(productionId, payload as any);
        notification.success("محصول جدید با موفقیت ساخته شد.");
      } else if (formMode === "edit" && formTarget) {
        await ProductAPI.update(productionId, formTarget.id, payload as any);
        notification.success("تغییرات محصول با موفقیت ذخیره شد.");
      }

      setFormMode(null);
      loadShopProducts();
    } catch (err: any) {
      setFormError(err?.message || "خطایی در ذخیره‌سازی رخ داد.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadMedia = async () => {
    if (!galleryProduct || !selectedFile) return;
    try {
      setUploadProgress(true);

      const urlData = await ProductService.getMediaUploadURL(
        productionId,
        galleryProduct.id,
        selectedFile.name,
        selectedFile.type,
      );
      if (!urlData) throw new Error("دریافت لینک آپلود ناموفق بود.");

      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      if (!uploadResponse.ok) {
        throw new Error("آپلود فایل با خطا مواجه شد.");
      }

      const newMedia = await ProductService.addMedia(
        productionId,
        galleryProduct.id,
        {
          type: mediaForm.type,
          url: urlData.publicUrl,
          sort_order: mediaForm.sort_order,
          alt_text: mediaForm.alt_text || undefined,
        },
      );
      if (!newMedia) throw new Error("ثبت رسانه ناموفق بود.");

      const updatedProduct = {
        ...galleryProduct,
        media: [...galleryProduct.media, newMedia],
      };
      setGalleryProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === galleryProduct.id ? updatedProduct : p)),
      );

      setSelectedFile(null);
      setMediaForm({ type: "image", sort_order: 0, alt_text: "" });
      notification.success("رسانه جدید با موفقیت آپلود و اضافه شد.");
    } catch (err: any) {
      notification.error(err?.message || "خطا در آپلود رسانه");
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!galleryProduct) return;
    try {
      await ProductAPI.deleteMedia(productionId, galleryProduct.id, mediaId);
      const updatedMedia = galleryProduct.media.filter((m) => m.id !== mediaId);
      const updatedProduct = { ...galleryProduct, media: updatedMedia };
      setGalleryProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === galleryProduct.id ? updatedProduct : p)),
      );
      notification.success("رسانه حذف شد.");
    } catch (err: any) {
      notification.error(err?.message || "خطا در حذف رسانه");
    }
  };

  const formatPrice = (p: ProductResponse) => {
    if (p.is_price_hidden) return "تماس بگیرید";
    return p.from_price && p.to_price
      ? `${p.from_price.toLocaleString("fa-IR")} تا ${p.to_price.toLocaleString("fa-IR")} تومان`
      : "—";
  };

  const columns: DataListColumn<ProductResponse>[] = [
    {
      key: "title",
      header: "نام و اسلاگ محصول",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center shadow-sm">
            {p.media && p.media.length > 0 ? (
              <img
                src={p.media.sort((a, b) => a.sort_order - b.sort_order)[0].url}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <HiShoppingBag className="size-5 text-stone-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-stone-800 text-xs sm:text-sm">
              {p.title}
            </div>
            <div
              className="text-[10px] text-stone-400 font-mono mt-0.5"
              dir="ltr"
            >
              {p.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "وضعیت قیمت (تومان)",
      render: (p) => (
        <span className="text-stone-600 font-semibold text-xs">
          {formatPrice(p)}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت انتشار",
      render: (p) => <StatusBadge active={p.status === "active"} />,
    },
    {
      key: "actions",
      header: "عملیات غرفه",
      headerClassName: "text-left",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedProduct(p)}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <HiEye className="size-4 text-stone-500" />
            <span className="hidden md:inline">مشاهده</span>
          </button>
          <button
            onClick={() => openEditForm(p)}
            title="ویرایش اطلاعات"
            className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-all"
          >
            <HiPencil className="size-4.5" />
          </button>
          <button
            onClick={() => setGalleryProduct(p)}
            title="مدیریت تصاویر/رسانه"
            className="p-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-all"
          >
            <HiPhoto className="size-4.5" />
          </button>
          {p.status === "active" ? (
            <button
              disabled={isActionLoading === p.id}
              onClick={() => handleUpdateStatus(p, false)}
              title="غیرفعال‌سازی غرفه"
              className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
            >
              <HiXMark className="size-4.5" />
            </button>
          ) : (
            <button
              disabled={isActionLoading === p.id}
              onClick={() => handleUpdateStatus(p, true)}
              title="فعال‌سازی"
              className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm transition-all"
            >
              <HiCheck className="size-4.5" />
            </button>
          )}
          <button
            onClick={() => setProductToDelete(p)}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
          >
            <HiTrash className="size-4.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="h-[calc(100vh-110px)] flex flex-col space-y-5 antialiased min-h-0"
      dir="rtl"
    >
      {/* هدر بخش غرفه */}
      <div className="border-b border-stone-200/60 pb-4 shrink-0 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-stone-900">
            <HiShoppingBag className="size-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              مدیریت محصولات غرفه
            </h2>
          </div>
          <p className="text-xs font-medium text-stone-500 mt-1.5">
            ویترین غرفه و آلبوم تصاویر محصولات خود را به شکلی پیشرفته مدیریت
            نمایید.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <HiPlus className="size-4" />
          <span>افزودن کالا به ویترین</span>
        </button>
      </div>

      {/* فیلترها */}
      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 shrink-0 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <HiMagnifyingGlass className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="جستجو در محصولات غرفه..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOffset(0);
            }}
            className="w-full pr-10 pl-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative w-full sm:w-48 flex items-center">
          <HiFunnel className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
            className="w-full pr-9 pl-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none cursor-pointer appearance-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال (روی سایت)</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>
      </div>

      {/* لیست اصلی دیتا */}
      <div className="flex-1 flex flex-col min-h-0">
        <DataList
          data={products}
          keyExtractor={(p) => p.id}
          columns={columns}
          renderMobileCard={(p) => (
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-800 text-sm">
                  {p.title}
                </span>
                <StatusBadge active={p.status === "active"} />
              </div>
              <div className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                قیمت: {formatPrice(p)}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="flex-1 py-1.5 bg-stone-100 rounded-lg text-xs font-bold text-center"
                >
                  مشاهده
                </button>
                <button
                  onClick={() => openEditForm(p)}
                  className="py-1.5 px-3 bg-emerald-50 text-emerald-600 rounded-lg"
                >
                  <HiPencil className="size-4" />
                </button>
                <button
                  onClick={() => setGalleryProduct(p)}
                  className="py-1.5 px-3 bg-blue-50 text-blue-600 rounded-lg"
                >
                  <HiPhoto className="size-4" />
                </button>
                <button
                  onClick={() => setProductToDelete(p)}
                  className="py-1.5 px-3 border border-stone-200 text-stone-500 rounded-lg"
                >
                  <HiTrash className="size-4" />
                </button>
              </div>
            </div>
          )}
          isLoading={isLoading}
          error={error}
          currentPage={Math.floor(offset / LIMIT) + 1}
          totalPages={Math.max(1, Math.ceil(totalCount / LIMIT))}
          totalItems={totalCount}
          itemsPerPage={LIMIT}
          onPageChange={(page) => setOffset((page - 1) * LIMIT)}
          itemLabel="محصول"
        />
      </div>

      {/* ۱. مودال استپر دار (فرم مرحله‌ای خفن) */}
      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => !isSaving && setFormMode(null)}
          />
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[92vh]">
            {/* هدر مودال به همراه نمایشگر وضعیت استپر */}
            <div className="px-6 py-4 bg-stone-50/60 border-b border-stone-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-sm text-stone-800">
                  {formMode === "create"
                    ? "افزودن محصول جدید به غرفه"
                    : "ویرایش اطلاعات محصول غرفه"}
                </h3>
                <button
                  onClick={() => setFormMode(null)}
                  className="p-1 rounded-xl text-stone-400 hover:bg-stone-200 cursor-pointer transition-colors"
                >
                  <HiXMark className="size-5" />
                </button>
              </div>

              {/* نوار استپر گرافیکی */}
              <div className="flex items-center justify-between max-w-md mx-auto pt-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${formStep >= 1 ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"}`}
                  >
                    ۱
                  </div>
                  <span
                    className={`text-[11px] font-bold ${formStep === 1 ? "text-emerald-700" : "text-stone-400"}`}
                  >
                    اطلاعات پایه
                  </span>
                </div>
                <div className="flex-1 h-[2px] bg-stone-200 mx-3 rounded" />
                <div className="flex items-center gap-2">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${formStep >= 2 ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"}`}
                  >
                    ۲
                  </div>
                  <span
                    className={`text-[11px] font-bold ${formStep === 2 ? "text-emerald-700" : "text-stone-400"}`}
                  >
                    قیمت و ساخت
                  </span>
                </div>
                <div className="flex-1 h-[2px] bg-stone-200 mx-3 rounded" />
                <div className="flex items-center gap-2">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${formStep === 3 ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"}`}
                  >
                    ۳
                  </div>
                  <span
                    className={`text-[11px] font-bold ${formStep === 3 ? "text-emerald-700" : "text-stone-400"}`}
                  >
                    توضیحات
                  </span>
                </div>
              </div>
            </div>

            {/* بدنه فرم بر اساس استپ‌ها */}
            <div className="p-6 space-y-4 overflow-y-auto min-h-0 flex-1">
              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold px-3 py-2.5 rounded-xl animate-shake">
                  <HiExclamationTriangle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-left-5 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        عنوان محصول
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={handleTitleChange}
                        placeholder="مثلاً صندلی راک چوبی هور"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        اسلاگ (URL)
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setForm((prev) => ({
                            ...prev,
                            slug: slugify(e.target.value),
                          }));
                        }}
                        dir="ltr"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50">
                    <label className="text-[11px] font-black text-stone-700 block mb-2">
                      زیردسته‌بندی‌های غرفه
                    </label>
                    {isCategoriesLoading ? (
                      <p className="text-[11px] text-stone-400">
                        در حال بارگذاری ساختار دسته‌بندی‌های مجاز غرفه...
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                        {allowedSubCategories.map((branch) => (
                          <div
                            key={branch.rootId}
                            className="space-y-1.5 border-b border-stone-200/40 pb-2 last:border-0"
                          >
                            <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                              {branch.rootName}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pl-1">
                              {branch.subCategories.map((sub: any) => (
                                <label
                                  key={sub.id}
                                  className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={form.category_ids.includes(sub.id)}
                                    onChange={(e) =>
                                      handleCategoryCheckboxChange(
                                        sub.id,
                                        e.target.checked,
                                      )
                                    }
                                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 size-3.5"
                                  />
                                  <span>{sub.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-left-5 duration-200">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11px] font-black text-stone-700">
                          مخفی‌سازی قیمت
                        </label>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          در این صورت، دکمه «تماس بگیرید» جایگزین بازه قیمتی
                          محصول می‌شود.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.is_price_hidden}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            is_price_hidden: e.target.checked,
                          }))
                        }
                        className="size-4.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>

                    {!form.is_price_hidden && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600">
                            قیمت شروع (تومان)
                          </label>
                          <input
                            type="number"
                            value={form.from_price ?? ""}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                from_price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }))
                            }
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-600">
                            قیمت پایان (تومان)
                          </label>
                          <input
                            type="number"
                            value={form.to_price ?? ""}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                to_price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }))
                            }
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        جنس/متریال
                      </label>
                      <input
                        type="text"
                        value={form.material}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            material: e.target.value,
                          }))
                        }
                        placeholder="بلوط، فلز و..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        سبک طراحی
                      </label>
                      <input
                        type="text"
                        value={form.style}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            style: e.target.value,
                          }))
                        }
                        placeholder="مینیمال، مدرن"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        ابعاد (سانتی‌متر)
                      </label>
                      <input
                        type="text"
                        value={form.dimensions}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            dimensions: e.target.value,
                          }))
                        }
                        placeholder="۱۲۰×۸۰×۴۵"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600">
                        مدت زمان ساخت (روز)
                      </label>
                      <input
                        type="number"
                        value={form.production_time_days ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            production_time_days: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex items-center justify-between border border-stone-200 rounded-xl p-3 bg-stone-50/40">
                      <span className="text-[11px] font-bold text-stone-600">
                        قابلیت سفارشی‌سازی ابعاد
                      </span>
                      <input
                        type="checkbox"
                        checked={form.is_customizable}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            is_customizable: e.target.checked,
                          }))
                        }
                        className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-4 animate-in slide-in-from-left-5 duration-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600">
                      توضیحات کامل محصول
                    </label>
                    <textarea
                      rows={6}
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs resize-none focus:outline-none focus:border-emerald-500 leading-relaxed"
                      placeholder="ویژگی‌ها، نکات کارگاهی ساخت و نگهداری کالا را بنویسید..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* بخش فوتر استپر دار */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 shrink-0 flex justify-between gap-2">
              <button
                type="button"
                disabled={formStep === 1 || isSaving}
                onClick={() => setFormStep((prev) => (prev - 1) as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border border-stone-200 flex items-center gap-1 transition-all bg-white ${formStep === 1 ? "opacity-40 pointer-events-none" : "hover:bg-stone-100"}`}
              >
                <HiArrowRight className="size-3.5" />
                <span>مرحله قبل</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setFormMode(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 font-bold text-xs rounded-xl hover:bg-stone-100 bg-white"
                >
                  انصراف
                </button>
                {formStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                  >
                    <span>گام بعدی</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmitForm}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {isSaving ? "در حال ثبت..." : "تأیید و ذخیره کالا"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ۲. مودال گالری به همراه آپلودر Drag & Drop لوکس */}
      {galleryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setGalleryProduct(null)}
          />
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-lg overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
              <h3 className="font-black text-sm text-stone-800">
                آلبوم تصاویر: {galleryProduct.title}
              </h3>
              <button
                onClick={() => setGalleryProduct(null)}
                className="p-1 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <HiXMark className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              {/* فرم آپلودر Drag & Drop پیشرفته */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4">
                <span className="text-[11px] font-black text-stone-600 uppercase tracking-wider block">
                  آپلود مدیا یا عکس کارگاهی
                </span>

                {/* بخش دراپ فایل اصلی */}
                <label className="border-2 border-dashed border-stone-300 hover:border-blue-500 bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <HiCloudArrowUp className="size-8 text-stone-400 group-hover:text-blue-600 transition-colors" />
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="text-xs font-bold text-stone-800 truncate max-w-[250px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-bold text-stone-700">
                        تصویر یا فایل خود را اینجا رها کنید یا کلیک نمایید
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        فرمت‌های مجاز: JPG, PNG, MP4
                      </p>
                    </div>
                  )}
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={mediaForm.type}
                    onChange={(e: any) =>
                      setMediaForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="px-2 py-1.5 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="image">تصویر ثابت</option>
                    <option value="video">ویدیو محصول</option>
                  </select>
                  <input
                    type="number"
                    placeholder="ترتیب نمایش"
                    value={mediaForm.sort_order || ""}
                    onChange={(e) =>
                      setMediaForm((prev) => ({
                        ...prev,
                        sort_order: Number(e.target.value),
                      }))
                    }
                    className="px-2 py-1.5 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="توضیح Alt عکس"
                    value={mediaForm.alt_text}
                    onChange={(e) =>
                      setMediaForm((prev) => ({
                        ...prev,
                        alt_text: e.target.value,
                      }))
                    }
                    className="px-2 py-1.5 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none"
                  />
                </div>

                <button
                  disabled={uploadProgress || !selectedFile}
                  onClick={handleUploadMedia}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HiArrowUpTray className="size-4" />
                  <span>
                    {uploadProgress
                      ? "در حال آپلود فایل..."
                      : "شروع فرآیند آپلود و الحاق"}
                  </span>
                </button>
              </div>

              {/* نمایش آیتم‌های موجود در گالری */}
              <div className="space-y-3">
                <span className="text-[11px] font-black text-stone-600 block">
                  مدیریت فایل‌های آلبوم ({galleryProduct.media?.length || 0})
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {galleryProduct.media
                    ?.sort((a, b) => a.sort_order - b.sort_order)
                    .map((m, index) => (
                      <div
                        key={m.id || `gallery-media-${index}`}
                        className="group relative border border-stone-200 rounded-2xl overflow-hidden aspect-video bg-stone-100 flex flex-col justify-between shadow-sm"
                      >
                        {m.type === "image" ? (
                          <img
                            src={m.url}
                            className="w-full h-full object-cover flex-1"
                            alt={m.alt_text || ""}
                          />
                        ) : (
                          <video
                            src={m.url}
                            controls
                            className="w-full h-full object-cover flex-1"
                          />
                        )}
                        <div className="absolute top-1.5 right-1.5 bg-black/70 text-white font-mono text-[9px] px-2 py-0.5 rounded-md">
                          ترتیب: {m.sort_order}
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(m.id)}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold text-center transition-colors cursor-pointer"
                        >
                          حذف از آلبوم
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ۳. مودال مشاهده جزییات کالا */}
      {selectedProduct && (
        <DetailModal
          icon={<HiShoppingBag className="size-5 text-emerald-600" />}
          title="بررسی ساختار محصول غرفه"
          onClose={() => setSelectedProduct(null)}
        >
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
            <InfoRow
              icon={<HiShoppingBag className="size-3.5" />}
              label="عنوان ثبت شده"
              value={selectedProduct.title}
            />
            <InfoRow
              icon={<HiCurrencyDollar className="size-3.5" />}
              label="وضعیت فروش و بازه قیمت"
              value={formatPrice(selectedProduct)}
            />
            <InfoRow
              icon={<HiDocumentText className="size-3.5" />}
              label="جنس و متریال پایه"
              value={selectedProduct.material || "ثبت نشده"}
            />
            <InfoRow
              icon={<HiEye className="size-3.5" />}
              label="تعداد بازدید عمومی"
              value={`${selectedProduct.views_count.toLocaleString("fa-IR")} بار`}
            />
            <InfoRow
              icon={<HiCheck className="size-3.5" />}
              label="مدت زمان ساخت کارگاه"
              value={
                selectedProduct.production_time_days
                  ? `${selectedProduct.production_time_days} روز`
                  : "آماده تحویل"
              }
            />
          </div>
          {selectedProduct.description && (
            <InfoBlock
              icon={<HiDocumentText className="size-3.5" />}
              label="توضیحات و متون معرفی"
              value={selectedProduct.description}
            />
          )}
        </DetailModal>
      )}

      {/* ۴. مودال تأیید حذف محصول */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-100">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setProductToDelete(null)}
          />
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-sm overflow-hidden shadow-2xl relative z-10 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <HiExclamationTriangle className="size-5" />
              <h3 className="font-black text-sm text-stone-800">
                حذف کالا از غرفه
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              آیا از حذف محصول{" "}
              <span className="font-black text-stone-900">
                «{productToDelete.title}»
              </span>{" "}
              مطمئن هستید؟ این درخواست کالا را به صورت کامل از دیدرس غرفه و
              مشتریان خارج می‌کند.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <button
                disabled={isDeleteLoading === productToDelete.id}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                {isDeleteLoading === productToDelete.id
                  ? "در حال حذف..."
                  : "بله، حذف شود"}
              </button>
              <button
                disabled={isDeleteLoading === productToDelete.id}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 border border-stone-200 text-stone-600 font-bold text-xs rounded-xl hover:bg-stone-50 bg-white"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
