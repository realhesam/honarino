"use client";

import { useEffect, useState } from "react";
import { HiXMark, HiBuildingStorefront } from "react-icons/hi2";
import UpgradeProductionForm from "./CreateProductionForm";

interface UpgradeProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpgradeProductionModal({
  isOpen,
  onClose,
  onSuccess,
}: UpgradeProductionModalProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (isOpen) setFormKey((k) => k + 1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isBusy) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick() {
    if (!isBusy) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-production-modal-title"
    >
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
        <div className="relative z-10 w-full sm:max-w-5xl bg-white sm:rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-stone-100 bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-none size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                <HiBuildingStorefront className="size-5" />
              </span>
              <div className="min-w-0">
                <h3
                  id="upgrade-production-modal-title"
                  className="font-black text-sm sm:text-base text-stone-900 truncate"
                >
                  ثبت کارگاه یا تولیدی جدید
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 truncate">
                  اطلاعات فروشگاه را در چند مرحله ساده تکمیل کنید
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="flex-none p-2 rounded-xl text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="بستن"
            >
              <HiXMark className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 sm:py-5 bg-stone-50/40">
            <UpgradeProductionForm
              key={formKey}
              variant="modal"
              onCancel={onClose}
              onBusyChange={setIsBusy}
              onSuccess={() => {
                onSuccess?.();
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
