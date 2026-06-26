"use client";

import InputRow from "@/ui/InputRow";
import FileInput from "../other/FileInput";
import { useState } from "react";

export default function EditProfileForm({ user }) {
  const { username, name, phone, email, address } = user;
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <form onSubmit={() => {}}>
      <div className="gap-y-2 gap-x-5 grid grid-cols-1 lg:grid-cols-2">
        <InputRow label="نام کاربری" htmlFor="username">
          <input
            className="input-light bg-stone-50"
            type="text"
            name="username"
            id="username"
            defaultValue={username}
            placeholder="نام کاربری"
          />
        </InputRow>

        <InputRow label="نام و نام خانوادگی" htmlFor="name">
          <input
            className="input-light bg-stone-50"
            name="name"
            id="name"
            type="text"
            defaultValue={name}
            placeholder="نام و نام خانوادگی"
          />
        </InputRow>

        <InputRow label="شماره تماس (اختیاری)">
          <input
            className="input-light bg-stone-50"
            type="tel"
            name="phone"
            id="tel"
            defaultValue={phone}
          />
        </InputRow>

        <InputRow label="ایمیل (اختیاری)">
          <input
            className="input-light bg-stone-50"
            type="email"
            name="email"
            id="email"
            defaultValue={email}
          />
        </InputRow>

        <InputRow
          label="ادرس"
          htmlFor="address"
          customClass="lg:col-span-2 xl:col-span-1"
        >
          <textarea
            className="h-15 input-light bg-stone-50"
            name="address"
            id="address"
            defaultValue={address}
            placeholder="ادرس"
          />
        </InputRow>

        <FileInput
          label="تصویر حساب"
          inputName="userImage"
          onFileSelect={(file) => setSelectedFile(file)}
          isFileUploaded={isFileUploaded}
        />
      </div>
      <div className="mt-5 flex gap-2 justify-center sm:justify-end">
        <button
          type="submit"
          className="bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-dark shadow-md hover:shadow-lg transition-all duration-200"
        >
          ذخیره اطلاعات
        </button>
      </div>
    </form>
  );
}
