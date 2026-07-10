import LinkButton from "@/ui/LinkButton";
import { HiChevronLeft } from "react-icons/hi2";

export default function NotFoundPage() {
  return (
    <div className="relative h-screen w-screen flex items-center justify-center">
      <span className="text-stone-200/80 text-shadow-[0.3rem_0.3rem_#dedede] md:text-shadow-[1rem_1rem_#dedede] absolute -z-10 font-black inset-0 m-auto text-center leading-[100vh] text-[40vw] md:text-[30vw]">
        404
      </span>
      <div className="flex flex-col gap-5 items-center ">
        <h4 className="text-4xl font-bold">صفحه پیدا نشد</h4>
        <p className="max-w-100 text-center text-stone-500">
          کاربر گرامی صفحه ای با این نام پیدا نشد شما می توانید از لینک زیر به
          صفحه اصلی برگردید.
        </p>
        <LinkButton href="/" customClass="w-fit">
          <span> برگشت به صفحه اصلی</span>
          <span className="*:size-5">
            <HiChevronLeft />
          </span>
        </LinkButton>
      </div>
    </div>
  );
}
