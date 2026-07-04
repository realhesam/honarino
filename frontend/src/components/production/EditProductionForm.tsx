"use client";

import { useId, useState } from "react";
import {
  HiOutlineMapPin,
  HiOutlineCheck,
  HiOutlineCamera,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { MdOutlineChatBubble } from "react-icons/md";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { AppError } from "@/lib/core/errors/AppError";
import { ApiError } from "@/lib/core/errors/ApiError";
import { ProductionService } from "@/lib/modules/production/production.service";
import {
  uploadProductionImage,
  validateProductionImageFile,
} from "@/utils/useProductionImageUpload";
import { useNotification } from "@/utils/useNotification";

interface ProductionData {
  id: string;
  shopId: string;
  shopName: string;
  shopDescription: string;
  categories: string[];
  productionAddress: string;
  productionPhone: string;
  productionEmail: string;
  telegram?: string;
  rubika?: string;
  eitaa?: string;
  whatsapp?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  coverUrl?: string;
}

interface EditProductionFormProps {
  initialData: ProductionData;
  onSaveSuccess?: () => void;
}

type FormState = Omit<ProductionData, "id" | "logoUrl" | "bannerUrl" | "coverUrl">;
type FormErrors = Partial<Record<keyof FormState | "categories", string>>;

const INPUT_BASE = "w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none";

export default function EditProductionForm({ initialData, onSaveSuccess }: EditProductionFormProps) {
  const notification = useNotification();

  const [activeTab, setActiveTab] = useState<"identity" | "contact" | "social">("identity");

  const [form, setForm] = useState<FormState>({
    shopId: initialData.shopId || "",
    shopName: initialData.shopName || "",
    shopDescription: initialData.shopDescription || "",
    categories: initialData.categories || [],
    productionAddress: initialData.productionAddress || "",
    productionPhone: initialData.productionPhone || "",
    productionEmail: initialData.productionEmail || "",
    telegram: initialData.telegram || "",
    rubika: initialData.rubika || "",
    eitaa: initialData.eitaa || "",
    whatsapp: initialData.whatsapp || "",
    website: initialData.website || "",
  });

  const [images, setImages] = useState({
    logo: { file: null as File | null, preview: initialData.logoUrl || null },
    banner: { file: null as File | null, preview: initialData.bannerUrl || null },
    cover: { file: null as File | null, preview: initialData.coverUrl || null },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);

  const updateField = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = (key: "logo" | "banner" | "cover", file: File) => {
    const imgError = validateProductionImageFile(file);
    if (imgError) {
      notification.error(imgError);
      return;
    }
    setImages((prev) => ({
      ...prev,
      [key]: { file, preview: URL.createObjectURL(file) },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.shopName.trim()) newErrors.shopName = "نام تولیدی الزامی است.";
    if (!form.shopDescription.trim() || form.shopDescription.length < 20) 
      newErrors.shopDescription = "توضیحات باید حداقل ۲۰ کاراکتر باشد.";
    if (!form.productionAddress.trim()) newErrors.productionAddress = "آدرس کارگاه الزامی است.";
    if (!form.productionPhone.trim()) newErrors.productionPhone = "شماره تماس الزامی است.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      notification.error("لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }

    setIsSubmitting(true);
    setUploadLabel(null);

    try {
      await ProductionService.update(initialData.id, {
        shop_id: form.shopId,
        shop_name: form.shopName,
        shop_description: form.shopDescription,
        categories: form.categories,
        production_address: form.productionAddress,
        production_phone: form.productionPhone,
        production_email: form.productionEmail,
        telegram: form.telegram || undefined,
        rubika: form.rubika || undefined,
        eitaa: form.eitaa || undefined,
        whatsapp: form.whatsapp || undefined,
        website: form.website || undefined,
      });

      const imageKeys: ("logo" | "banner" | "cover")[] = ["logo", "banner", "cover"];
      for (const key of imageKeys) {
        if (images[key].file) {
          setUploadLabel(`در حال آپلود تصویر ${key === 'logo' ? 'لوگو' : 'کاور'}…`);
          await uploadProductionImage(initialData.id, images[key].file!, key);
        }
      }

      notification.success("اطلاعات تولیدی با موفقیت بروزرسانی شد.");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: unknown) {
      let msg = "خطا در ذخیره‌سازی تغییرات.";
      if (err instanceof AppError || err instanceof ApiError) msg = err.message;
      notification.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadLabel(null);
    }
  };

  return (
    <div className="w-full bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm" dir="rtl">
      
      <div className="border-b border-stone-100 pb-4 mb-6">
        <h2 className="text-base font-black text-stone-800">ویرایش پروفایل و اطلاعات تولیدی</h2>
        <p className="text-xs text-stone-400 mt-1">تغییرات هویت تجاری، آدرس کارگاه و پل‌های ارتباطی آنلاین واحد صنعتی</p>
      </div>

      <div className="flex gap-2 p-1 bg-stone-50 border border-stone-200/60 rounded-xl mb-6 overflow-x-auto">
        {[
          { id: "identity", label: "اصالت و تصاویر" },
          { id: "contact", label: "نشانی و تماس" },
          { id: "social", label: "اتصالات آنلاین" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] text-xs font-bold py-2.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-emerald-700 shadow-sm border border-stone-200/50"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {activeTab === "identity" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">نام تولیدی / کارگاه</label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => updateField("shopName", e.target.value)}
                  className={`${INPUT_BASE} ${errors.shopName ? "border-red-400" : ""}`}
                />
                {errors.shopName && <p className="text-[11px] text-red-500 mt-1">{errors.shopName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">شناسه آدرس (انگلیسی)</label>
                <input
                  type="text"
                  disabled
                  value={form.shopId}
                  className={`${INPUT_BASE} bg-stone-100 text-stone-400 cursor-not-allowed`}
                  dir="ltr"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">شناسه یکبار در زمان ساخت ثبت می‌شود.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">توضیحات و بیوگرافی کارگاه</label>
              <textarea
                rows={4}
                value={form.shopDescription}
                onChange={(e) => updateField("shopDescription", e.target.value)}
                className={`${INPUT_BASE} ${errors.shopDescription ? "border-red-400" : ""}`}
              />
              {errors.shopDescription && <p className="text-[11px] text-red-500 mt-1">{errors.shopDescription}</p>}
            </div>

            <div className="pt-4 border-t border-stone-100">
              <span className="block text-xs font-bold text-stone-700 mb-3">تصاویر پروفایل کارگاه</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["logo", "banner", "cover"] as const).map((key) => (
                  <div key={key} className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 flex flex-col items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-600 mb-2">
                      {key === "logo" ? "لوگو مربع" : key === "banner" ? "بنر اصلی" : "تصویر کاور"}
                    </span>
                    <div className="relative size-20 rounded-xl overflow-hidden border border-stone-200 bg-white">
                      {images[key].preview ? (
                        <img src={images[key].preview!} className="size-full object-cover" alt="" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-stone-300"><HiOutlineCamera size={20} /></div>
                      )}
                    </div>
                    <label className="mt-3 cursor-pointer text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                      تغییر تصویر
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageChange(key, e.target.files[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">آدرس دقیق کارگاه یا دفتر مرکزی</label>
              <div className="relative flex items-center">
                <HiOutlineMapPin className="absolute right-3 text-stone-400 size-4" />
                <input
                  type="text"
                  value={form.productionAddress}
                  onChange={(e) => updateField("productionAddress", e.target.value)}
                  className={`${INPUT_BASE} pr-9 ${errors.productionAddress ? "border-red-400" : ""}`}
                  placeholder="استان، شهر، خیابان اصلی..."
                />
              </div>
              {errors.productionAddress && <p className="text-[11px] text-red-500 mt-1">{errors.productionAddress}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">شماره تلفن ثابت یا همراه کارگاه</label>
                <input
                  type="tel"
                  value={form.productionPhone}
                  onChange={(e) => updateField("productionPhone", e.target.value)}
                  className={`${INPUT_BASE} ${errors.productionPhone ? "border-red-400" : ""}`}
                  dir="ltr"
                />
                {errors.productionPhone && <p className="text-[11px] text-red-500 mt-1">{errors.productionPhone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">پست الکترونیک (ایمیل)</label>
                <input
                  type="email"
                  value={form.productionEmail}
                  onChange={(e) => updateField("productionEmail", e.target.value)}
                  className={INPUT_BASE}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {[
              { id: "telegram", label: "آیدی تلگرام", icon: <FaTelegram className="text-sky-500" /> },
              { id: "whatsapp", label: "شماره واتساپ", icon: <FaWhatsapp className="text-green-500" /> },
              { id: "rubika", label: "آیدی روبیکا", icon: <MdOutlineChatBubble className="text-purple-500" /> },
              { id: "eitaa", label: "آیدی ایتا", icon: <MdOutlineChatBubble className="text-orange-500" /> },
            ].map((item) => (
              <div key={item.id}>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">{item.label}</label>
                <div className="relative flex items-center bg-stone-50 border border-stone-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <span className="absolute right-3.5 flex items-center gap-2 text-stone-400 text-sm">
                    {item.icon}
                  </span>
                  <input
                    type="text"
                    value={(form as any)[item.id]}
                    onChange={(e) => updateField(item.id as any, e.target.value)}
                    className="w-full bg-transparent border-none outline-none py-2.5 pr-10 pl-3.5 text-sm text-stone-900 font-sans"
                    placeholder="@username یا شماره تماس"
                    dir="ltr"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">وب‌سایت رسمی تولیدی</label>
              <div className="relative flex items-center bg-stone-50 border border-stone-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <HiOutlineGlobeAlt className="absolute right-3.5 text-stone-400 size-4" />
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-2.5 pr-10 pl-3.5 text-sm text-stone-900 font-sans"
                  placeholder="https://example.com"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer shadow-sm shadow-emerald-700/10"
          >
            {isSubmitting ? (
              <>
                <HiOutlineArrowPath className="size-4 animate-spin" />
                <span>{uploadLabel || "در حال ذخیره تغییرات..."}</span>
              </>
            ) : (
              <>
                <HiOutlineCheck className="size-4 stroke-[2.5]" />
                <span>ذخیره نهایی تغییرات</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}