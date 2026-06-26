"use client";

import { AppError } from "@/lib/core/errors/AppError";
import { AccountService } from "@/lib/modules/account/account.service";
import { AuthService } from "@/lib/modules/auth/auth.service";
import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import { useNotification } from "@/utils/useNotification";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { HiArrowRightStartOnRectangle } from "react-icons/hi2";
import { PiUserCircleDuotone } from "react-icons/pi";

type Profile = {
  name: string;
  username: string;
  address: string;
  image: string;
  userType: string;
  phone?: string;
  email?: string;
  password?: string;
};

const defaultProfile: Profile = {
  name: "",
  username: "",
  address: "",
  image: "/images/default-user.jpg",
  userType: "",
  phone: "",
  email: "",
  password: "",
};
type FileInputProps = {
  label: string;
  inputName: string;
  onFileSelect: (file: File) => void;
  isFileUploaded: boolean;
};

function FileInput({
  label,
  inputName,
  onFileSelect,
  isFileUploaded,
}: FileInputProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    onFileSelect(selectedFile);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="font-medium text-stone-700">{label}</label>

      <input
        type="file"
        id={inputName}
        name={inputName}
        onChange={handleSelect}
        className="hidden"
        accept="image/png"
      />

      <label
        htmlFor={inputName}
        className={`
                    cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 text-stone-500
                    hover:border-primary hover:text-primary transition-colors duration-200
                    ${isFileUploaded === false ? "bg-white" : "bg-green-50 border-green-400 text-green-600"}
                  `}
      >
        {isFileUploaded === false && "انتخاب فایل"}
        {isFileUploaded === true && "✅ آپلود انجام شد"}
      </label>

      {preview && (
        <div className="flex items-center gap-4 mt-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-stone-300 shadow-sm">
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Page() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<Boolean>(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const notification = useNotification();
  runserver;
  async function handle_user_data() {
    try {
      const response = await AccountService.get_user_data();
      const userType = response.admin === "1" ? "ادمین" : "کاربر عادی";

      setProfile({
        name: response.name,
        username: response.username,
        address: response.address || "",
        image: response.profile_picture_url || "/images/default-user.jpg",
        userType,
        phone: response.phone || "",
        email: response.email || "",
        password: "",
      });

      console.log(response.profile_picture_url);
    } catch (error: any) {
      notification.error(error?.message || "خطا در دریافت اطلاعات کاربر");
    }
  }

  useEffect(() => {
    try {
      AuthService.requireAuth();
      handle_user_data();
    } catch (error) {
      if (error instanceof AppError) {
        notification.error(error.message);
        redirect("/auth/signin");
      } else {
        notification.error("خطای غیرمنتظره‌ای رخ داد");
        redirect("/auth/signin");
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notification.error("رمز جدید و تکرار آن باید یکسان باشد");
      return;
    }
    if (newPassword.length < 8) {
      notification.error("رمز جدید باید حداقل 8 کاراکتر باشد");
      return;
    }

    try {
      await AccountService.change_password(currentPassword, newPassword);
      notification.success("کلمه عبور با موفقیت تغییر کرد");
      closePasswordModal();
    } catch (error: any) {
      notification.error(error?.message || "خطا در تغییر کلمه عبور");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let profileUrl = profile.image;

      if (selectedFile) {
        const { publicUrl } = await AccountService.upload_file(selectedFile);
        profileUrl = publicUrl;
      }

      const dataToSend = {
        name: profile.name || undefined,
        username: profile.username || undefined,
        address: profile.address || undefined,
        phone: profile.phone || undefined,
        email: profile.email || undefined,
        profile_picture_url: profileUrl || undefined,
        password: profile.password || undefined,
      };

      await AccountService.update_user_data(dataToSend);
      setIsFileUploaded(selectedFile ? true : false);

      notification.success("اطلاعات کاربر با موفقیت به‌روز شد");
    } catch (error: any) {
      notification.error(error?.message || "خطا در آپدیت اطلاعات");
    }
  };

  return (
    <div>
      <div className="flex justify-between p-3 bg-primary">
        <h2 className="gap-1 flex items-center text-xl text-white">
          <span className="*:size-10">
            <PiUserCircleDuotone />
          </span>
          <span className="font-medium">حساب کاربری</span>
        </h2>
        <LinkButton href="/" variation="btn-light">
          صفحه اصلی
        </LinkButton>
      </div>

      <div className="p-5 grid gap-5 items-start md:grid-cols-[20rem_1fr]">
        <div className="p-5 bg-white rounded-xl border border-stone-200 flex flex-col items-center">
          <div className="relative size-25 rounded-full overflow-hidden">
            <img
              className="bg-cover"
              src={profile.image}
              alt="image of the user"
            />
          </div>
          <h3 className="text-xl font-medium text-stone-800 mt-2">
            {profile.username}
          </h3>
          <span className="bg-stone-200 rounded-sm p-1 text-xs text-stone-600">
            {profile.userType}
          </span>
          <div className="mt-5 w-full flex flex-col items-center gap-2 *:w-full">
            <LinkButton href="/production-form" size="btn-lg">
              <span>ارتقای حساب به تولیدی</span>
            </LinkButton>
            <button
              type="button"
              onClick={openPasswordModal}
              className="btn btn-secondary btn-lg"
              style={{ cursor: "pointer" }}
            >
              تغییر کلمه عبور
            </button>
            <LinkButton href="/auth/logout" variation="btn-danger-light">
              <span className="*:size-5">
                <HiArrowRightStartOnRectangle />
              </span>
              <span>خروج از حساب</span>
            </LinkButton>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl">
          <form onSubmit={handleSubmit}>
            <div className="gap-y-2 gap-x-5 grid grid-cols-1 lg:grid-cols-2">
              <InputRow label="نام کاربری" htmlFor="username">
                <input
                  className="input-light bg-stone-50"
                  type="text"
                  name="username"
                  id="username"
                  value={profile.username}
                  placeholder="نام کاربری"
                  onChange={handleChange}
                />
              </InputRow>

              <InputRow label="نام و نام خانوادگی" htmlFor="name">
                <input
                  className="input-light bg-stone-50"
                  name="name"
                  id="name"
                  type="text"
                  value={profile.name}
                  placeholder="نام و نام خانوادگی"
                  onChange={handleChange}
                />
              </InputRow>

              <FileInput
                label="تصویر حساب"
                inputName="userImage"
                onFileSelect={(file) => setSelectedFile(file)}
                isFileUploaded={isFileUploaded}
              />

              <InputRow label="شماره تماس (اختیاری)">
                <input
                  className="input-light bg-stone-50"
                  type="tel"
                  name="phone"
                  id="tel"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </InputRow>

              <InputRow label="ایمیل (اختیاری)">
                <input
                  className="input-light bg-stone-50"
                  type="email"
                  name="email"
                  id="email"
                  value={profile.email}
                  onChange={handleChange}
                />
              </InputRow>

              <InputRow label="ادرس" htmlFor="address">
                <textarea
                  className="input-light bg-stone-50"
                  name="address"
                  id="address"
                  value={profile.address}
                  placeholder="ادرس"
                  onChange={handleChange}
                />
              </InputRow>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="submit"
                className="
                  bg-primary text-white font-medium
                  px-6 py-3 rounded-lg
                  hover:bg-primary-dark
                  shadow-md hover:shadow-lg
                  transition-all duration-200
                "
              >
                ذخیره اطلاعات
              </button>
            </div>
          </form>
        </div>
      </div>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-stone-900">
              تغییر کلمه عبور
            </h3>
            <p className="text-sm text-stone-600 mt-2">
              برای حفظ حریم خصوصی خود کلمه عبور خود را هرچند وقت یکبار تغییر
              دهید.
            </p>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm text-stone-700 mb-2"
                >
                  رمز فعلی
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full input-light bg-stone-50"
                  placeholder="رمز فعلی"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm text-stone-700 mb-2"
                >
                  رمز جدید
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full input-light bg-stone-50"
                  placeholder="رمز جدید"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm text-stone-700 mb-2"
                >
                  تکرار رمز جدید
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full input-light bg-stone-50"
                  placeholder="تکرار رمز جدید"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition"
                >
                  ذخیره رمز جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
