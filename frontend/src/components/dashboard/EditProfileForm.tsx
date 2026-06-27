"use client";

import InputRow from "@/ui/InputRow";
import { useState, FormEvent, useRef, ChangeEvent } from "react";
import { HiUser, HiEnvelope, HiPhone, HiMapPin, HiIdentification, HiCamera, HiTrash } from "react-icons/hi2";

interface User {
  username: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
}

interface EditProfileFormProps {
  user: User;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const { username, name, phone, email, address, avatarUrl } = user;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const baseInputClass = 
    "w-full text-sm text-stone-800 bg-stone-50/50 placeholder-stone-400/70 " +
    "border border-stone-200/80 rounded-xl py-3 outline-none " +
    "focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 " +
    "hover:border-stone-300 hover:bg-stone-50/80 " +
    "transition-all duration-200 shadow-sm";

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleRemoveFile(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white border border-stone-200/60 rounded-2xl shadow-sm overflow-hidden">
      
      <div className="px-6 py-4 bg-stone-50/40 border-b border-stone-100">
        <h5 className="text-sm font-bold text-stone-800">تنظیمات حساب کاربری</h5>
        <p className="text-[11px] text-stone-400 mt-0.5">اطلاعات شخصی و عمومی پروفایل خود را ویرایش کنید.</p>
      </div>

      <div className="p-6 flex flex-col xl:flex-row gap-8 items-start w-full">
        
        <div className="flex flex-col items-center gap-3 shrink-0 mx-auto xl:mx-0 w-full xl:w-auto">
          <label className="text-xs font-semibold text-stone-500 block text-center">تصویر پروفایل</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative size-32 rounded-3xl overflow-hidden border-2 border-dashed border-stone-200 hover:border-primary bg-stone-50 flex items-center justify-center cursor-pointer shadow-inner transition-all duration-300"
          >
            <input ref={fileInputRef} type="file" name="userImage" accept="image/*" className="hidden" onChange={handleFileChange} />
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="size-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="flex flex-col items-center text-stone-400 gap-1 select-none">
                <HiCamera className="size-7 text-stone-300 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium px-2 text-center leading-normal">انتخاب تصویر</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <HiCamera className="size-6 text-white" />
            </div>
          </div>
          {previewUrl && (
            <button onClick={handleRemoveFile} className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600 bg-red-50/60 px-2.5 py-1 rounded-lg border border-red-100/50 transition-colors">
              <HiTrash className="size-3.5" />
              <span>حذف تصویر</span>
            </button>
          )}
        </div>

        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          
          <InputRow label="نام کاربری" htmlFor="username">
            <div className="relative flex items-center">
              <HiIdentification className="absolute left-3.5 size-4.5 text-stone-400 z-10" />
              <input 
                className={`${baseInputClass} pl-10 pr-4 text-left tracking-wide font-medium`} 
                type="text" 
                name="username" 
                id="username" 
                defaultValue={username} 
                placeholder="مثلا: amir_dev" 
                dir="ltr" 
                required 
              />
            </div>
          </InputRow>

          <InputRow label="نام و نام خانوادگی" htmlFor="name">
            <div className="relative flex items-center">
              <HiUser className="absolute right-3.5 size-4.5 text-stone-400" />
              <input className={`${baseInputClass} pr-10 pl-4`} name="name" id="name" type="text" defaultValue={name} placeholder="نام خود را وارد کنید" required />
            </div>
          </InputRow>

          <InputRow label="شماره تماس (اختیاری)" htmlFor="phone">
            <div className="relative flex items-center">
              <HiPhone className="absolute left-3.5 size-4.5 text-stone-400 z-10" />
              <input 
                className={`${baseInputClass} pl-10 pr-4 text-left tracking-wider font-medium`} 
                type="tel" 
                name="phone" 
                id="phone" 
                defaultValue={phone} 
                placeholder="09123456789" 
                dir="ltr" 
              />
            </div>
          </InputRow>

          <InputRow label="ایمیل (اختیاری)" htmlFor="email">
            <div className="relative flex items-center">
              <HiEnvelope className="absolute left-3.5 size-4.5 text-stone-400 z-10" />
              <input 
                className={`${baseInputClass} pl-10 pr-4 text-left tracking-wide`} 
                type="email" 
                name="email" 
                id="email" 
                defaultValue={email} 
                placeholder="example@domain.com" 
                dir="ltr" 
              />
            </div>
          </InputRow>

          <div className="sm:col-span-2">
            <InputRow label="آدرس دقیق محل سکونت یا کار" htmlFor="address">
              <div className="relative flex items-center">
                <HiMapPin className="absolute right-3.5 size-4.5 text-stone-400" />
                <input className={`${baseInputClass} pr-10 pl-4`} type="text" name="address" id="address" defaultValue={address} placeholder="نشانی دقیق محل سکونت یا کار خود را وارد کنید..." />
              </div>
            </InputRow>
          </div>
        </div>

      </div>

      <div className="px-6 py-4 bg-stone-50/30 border-t border-stone-100 flex items-center justify-end gap-3">
        <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/95 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-sm min-w-[140px] flex items-center justify-center">
          {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}