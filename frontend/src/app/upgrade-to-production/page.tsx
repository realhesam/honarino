import UpgradeProductionForm from "@/components/production/CreateProductionForm";
import LinkButton from "@/ui/LinkButton";
import { HiChevronLeft } from "react-icons/hi2";
import { PiFactoryFill } from "react-icons/pi";

export default function UpgradeProductionFormPage() {
  return (
    <div className="">
      <div className="m-5">
        <div className="flex items-center justify-between max-w-[980px] rounded-xl border border-gray-200 bg-white p-5 mx-auto">
          <h2 className="text-md sm:text-lg font-bold flex items-center gap-1 sm:gap-2">
            <span className="*:size-4 sm:*:size-6 text-stone-500 bg-stone-100 rounded-xl p-2">
              <PiFactoryFill />
            </span>
            <span className="text-stone-800">ارتقای حساب به تولیدی</span>
          </h2>
          <LinkButton href="/" customClass="text-xs sm:text-base">
            <span>صفحه اصلی</span>
            <span className="*:size-3 sm:*:size-5">
              <HiChevronLeft />
            </span>
          </LinkButton>
        </div>
      </div>
      <UpgradeProductionForm />
    </div>
  );
}
