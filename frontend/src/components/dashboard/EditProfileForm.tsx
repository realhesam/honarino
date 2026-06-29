"use client";

import { useState, FormEvent, useRef, ChangeEvent } from "react";
import {
  HiUser,
  HiEnvelope,
  HiPhone,
  HiMapPin,
  HiIdentification,
  HiCamera,
  HiTrash,
  HiArrowUpTray,
} from "react-icons/hi2";
import InputRow from "@/ui/InputRow";
import { useUser } from "@/context/UserContext";
import { useNotification } from "@/utils/useNotification";

export default function EditProfileForm() {
  const { user, updateProfile } = useUser();
  const notification = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const [formData, setFormData] = useState({
    username: user.username,
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: user.address,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatar || null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const baseInputClass =
    "w-full text-sm text-stone-800 bg-stone-50/50 placeholder-stone-400/70 " +
    "border border-stone-200/80 rounded-xl py-3 outline-none " +
    "focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 " +
    "hover:border-stone-300 hover:bg-stone-50/80 " +
    "transition-all duration-200 shadow-sm";

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadProgress(null);
    }
  }

  function handleRemoveFile(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile(formData, selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      notification.success("تغییرات حساب کاربری با موفقیت ذخیره شد");
      setSelectedFile(null);
    } catch (error: any) {
      notification.error(error?.message || "خطا در ذخیره‌سازی اطلاعات");
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border border-stone-200/60 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 bg-stone-50/40 border-b border-stone-100">
        <h5 className="text-sm font-bold text-stone-800">
          تنظیمات حساب کاربری
        </h5>
        <p className="text-[11px] text-stone-400 mt-0.5">
          اطلاعات شخصی و عمومی پروفایل خود را ویرایش کنید.
        </p>
      </div>

      <div className="p-6 flex flex-col xl:flex-row gap-8 items-start w-full">
        <div className="flex flex-col items-center gap-4 shrink-0 mx-auto xl:mx-0 w-full xl:w-auto">
          <label className="text-xs font-semibold text-stone-500 block text-center">
            تصویر پروفایل
          </label>

          <div
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            className={`group relative size-32 rounded-3xl overflow-hidden border-2 border-dashed bg-stone-50 flex items-center justify-center shadow-inner transition-all duration-300 ${isSubmitting ? "border-primary/40 cursor-not-allowed" : "border-stone-200 hover:border-primary cursor-pointer"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              name="userImage"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center text-stone-400 gap-1 select-none">
                <HiCamera className="size-7 text-stone-300 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium px-2 text-center leading-normal">
                  انتخاب تصویر
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <HiCamera className="size-6 text-white" />
            </div>

            {uploadProgress !== null && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 animate-pulse">
                <HiArrowUpTray className="size-5 text-primary animate-bounce" />
                <span className="text-xs font-bold text-primary">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {uploadProgress !== null && (
            <div className="w-full max-w-[140px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-semibold">
                <span
                  className={
                    uploadProgress === 100 ? "text-green-600" : "text-stone-500"
                  }
                >
                  {uploadProgress === 100
                    ? "پردازش نهایی..."
                    : "در حال آپلود..."}
                </span>
                <span className="font-bold text-stone-700">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${uploadProgress === 100 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"}`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {previewUrl && !isSubmitting && (
            <button
              onClick={handleRemoveFile}
              className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600 bg-red-50/60 px-2.5 py-1 rounded-lg border border-red-100/50 transition-colors"
            >
              <HiTrash className="size-3.5" />
              <span>حذف تصویر</span>
            </button>
          )}
        </div>

        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <InputRow
            label="نام کاربری"
            htmlFor="username"
            icon={<HiIdentification />}
          >
            <input
              className={`${baseInputClass} pl-10 pr-4 text-left tracking-wide font-medium`}
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="مثلا: amir_dev"
              required
            />
          </InputRow>

          <InputRow
            label="نام و نام خانوادگی"
            htmlFor="name"
            icon={<HiUser />}
            dir="rtl"
          >
            <input
              className="input"
              name="name"
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="نام خود را وارد کنید"
              required
            />
          </InputRow>

          <InputRow
            label="شماره تماس (اختیاری)"
            htmlFor="phone"
            icon={<HiPhone />}
            dir="rtl"
          >
            <input
              className="input text-left tracking-wider font-medium"
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="09123456789"
            />
          </InputRow>

          <InputRow
            label="ایمیل (اختیاری)"
            htmlFor="email"
            icon={<HiEnvelope />}
          >
            <input
              className="input tracking-wide"
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@domain.com"
            />
          </InputRow>

          <div className="sm:col-span-2">
            <InputRow
              dir="rtl"
              label="آدرس دقیق محل سکونت یا کار"
              htmlFor="address"
              icon={<HiMapPin />}
            >
              <input
                className="input"
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="نشانی دقیق محل سکونت یا کار خود را وارد کنید..."
              />
            </InputRow>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-stone-50/30 border-t border-stone-100 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/95 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-sm min-w-[140px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
