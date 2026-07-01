"use client";

import { useState } from "react";
import {
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiXMark,
  HiCheck,
  HiArrowRight,
  HiShieldCheck,
} from "react-icons/hi2";
import { useUser } from "@/context/UserContext";
import { useNotification } from "@/utils/useNotification";
import { useOutsideClick } from "@/utils/useOutsideClick";
import Overlay from "@/ui/Overlay";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { ref } = useOutsideClick(onClose);
  const { changePassword } = useUser();
  const notification = useNotification();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword)
      return notification.error("رمز عبور فعلی الزامی است.");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword)
      return notification.error("رمزهای جدید همخوانی ندارند.");
    if (newPassword.length < 8)
      return notification.error("رمز جدید باید حداقل ۸ کاراکتر باشد.");

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      notification.success("کلمه عبور با موفقیت تغییر یافت.");
      handleCloseModal();
    } catch (error: any) {
      notification.error(error?.message || "رمز فعلی اشتباه است.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const baseInputClass =
    "w-full text-sm text-stone-800 bg-stone-50/60 placeholder-stone-400/70 " +
    "border border-stone-200/80 rounded-xl py-3 pr-10 pl-10 outline-none " +
    "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 " +
    "hover:border-stone-300 hover:bg-stone-50 transition-all duration-200 text-left tracking-widest font-mono";

  return (
    <>
      <div
        ref={ref}
        className="absolute inset-0 m-auto h-fit z-50 w-full sm:max-w-[380px] bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200/50 shadow-2xl p-6 pb-8 sm:pb-6 space-y-5 transform transition-all duration-300 animate-slide-up sm:animate-scale-in"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/60 shrink-0">
              <HiLockClosed className="size-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800">
                تغییر کلمه عبور
              </h4>
              <p className="text-[10px] text-stone-400 mt-0.5">
                امنیت حساب کاربری
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100"
          >
            <HiXMark className="size-4.5" />
          </button>
        </div>

        <div className="relative h-[4px] w-full bg-stone-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 right-0 h-full bg-linear-to-l from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="overflow-hidden">
          {step === 1 ? (
            <form
              onSubmit={handleNextStep}
              className="space-y-4 animate-fade-in"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-stone-500 mr-0.5">
                  رمز عبور فعلی
                </label>
                <div className="relative flex items-center">
                  <HiLockClosed className="absolute right-3.5 size-4.5 text-stone-400 z-10" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={baseInputClass}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute left-3.5 text-stone-400 hover:text-emerald-600 transition-colors z-10"
                  >
                    {showCurrent ? (
                      <HiEyeSlash className="size-4.5" />
                    ) : (
                      <HiEye className="size-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 group transition-all duration-200"
              >
                <span>مرحله بعد</span>
                <HiArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rotate-180" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-stone-500 mr-0.5">
                  رمز عبور جدید
                </label>
                <div className="relative flex items-center">
                  <HiLockClosed className="absolute right-3.5 size-4.5 text-stone-400 z-10" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={baseInputClass}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute left-3.5 text-stone-400 hover:text-emerald-600 transition-colors z-10"
                  >
                    {showNew ? (
                      <HiEyeSlash className="size-4.5" />
                    ) : (
                      <HiEye className="size-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-stone-500 mr-0.5">
                  تکرار رمز عبور جدید
                </label>
                <div className="relative flex items-center">
                  <HiShieldCheck className="absolute right-3.5 size-4.5 text-stone-400 z-10" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={baseInputClass}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3.5 text-stone-400 hover:text-emerald-600 transition-colors z-10"
                  >
                    {showConfirm ? (
                      <HiEyeSlash className="size-4.5" />
                    ) : (
                      <HiEye className="size-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 font-bold text-xs hover:bg-stone-50 hover:text-stone-700 active:scale-[0.98] transition-all"
                >
                  بازگشت
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 disabled:opacity-70 transition-all duration-200"
                >
                  {isSubmitting ? (
                    "در حال ثبت..."
                  ) : (
                    <>
                      <span>ذخیره تغییرات</span>
                      <HiCheck className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Overlay />
    </>
  );
}
