import LinkButton from "@/ui/LinkButton";
import { HiChevronLeft } from "react-icons/hi2";

type PropsType = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  caption?: string;
  viewMoreLink?: string;
  withBg?: string;
  textColor?: string;
  smallSize?: boolean;
  id?: string;
};

function Section({
  children,
  icon,
  title,
  caption,
  viewMoreLink,
  withBg,
  textColor,
  smallSize = false,
  id,
}: Readonly<PropsType>) {
  return (
    <section
      className={`${smallSize ? "mt-8" : "mt-16"} ${withBg} ${withBg && "pt-5 pb-10"}`}
      id={`${id || ""}`}
    >
      <div className={`${smallSize ? "" : "container"}`}>
        <div className="flex items-center justify-between border-b border-stone-500/20 mb-5">
          <div className="flex flex-col">
            <div
              className={`flex items-center gap-1 font-medium text-xl md:text-3xl ${
                withBg ? "text-white" : "text-primary"
              }`}
            >
              <span
                className={`${smallSize ? "*:size-7" : "*:size-7 md:*:size-10"}`}
              >
                {icon}
              </span>
              <h2 className={`${smallSize ? "text-lg" : ""}`}>{title}</h2>
            </div>
            <h3
              className={`text-sm md:text-lg my-1 ${
                withBg ? "text-stone-200" : "text-stone-400"
              }`}
            >
              {caption}
            </h3>
          </div>
          {viewMoreLink && (
            <LinkButton
              href={viewMoreLink}
              variation={withBg ? "btn-light" : "btn-primary"}
            >
              <span className={textColor}>مشاهده بیشتر</span>
              <span className={`${textColor} *:size-4`}>
                <HiChevronLeft />
              </span>
            </LinkButton>
          )}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default Section;
