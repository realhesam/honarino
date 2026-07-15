import Image from "next/image";
import Link from "next/link";
import {
  PiEyeDuotone,
  PiMapPinDuotone,
  PiPackageDuotone,
  PiSealCheckFill,
  PiStarFill,
} from "react-icons/pi";
import type { BuilderType } from "@/types/builder";
import { cities } from "@/data/cities";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

function Builder({ builder }: Readonly<{ builder: BuilderType }>) {
  const {
    name,
    slug,
    logo,
    city,
    rate,
    verified,
    productsCount,
    viewsCount,
    bio,
  } = builder;

  const cityLabel = cities.find((c) => c.name === city)?.label ?? city;

  return (
    <div className="group relative rounded-xl bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="relative size-16 overflow-hidden rounded-full border border-stone-100">
            <Image src={logo} alt={name} fill className="object-cover" />
          </div>
          {verified && (
            <span
              title="تولیدی تأیید شده"
              className="absolute -bottom-1 -left-1 flex size-6 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-transform duration-300 group-hover:rotate-12"
            >
              <PiSealCheckFill className="size-6" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-stone-600">
            <Link href={`/builders/${slug}`} className="hover:text-primary">
              {name}
            </Link>
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-stone-400">
            <span className="*:size-3.5">
              <PiMapPinDuotone />
            </span>
            <span>{cityLabel}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs text-stone-400">{bio}</p>

      <div className="mt-3 flex items-center justify-between border-y border-stone-100 py-2 text-xs text-stone-500">
        <div className="flex items-center gap-1">
          <span className="text-amber-400 *:size-4">
            <PiStarFill />
          </span>
          <span>{rate}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="*:size-4">
            <PiPackageDuotone />
          </span>
          <span>{formatCount(productsCount)} محصول</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="*:size-4">
            <PiEyeDuotone />
          </span>
          <span>{formatCount(viewsCount)}</span>
        </div>
      </div>

      <Link
        href={`/builders/${slug}`}
        className="mt-3 flex items-center justify-center rounded-lg bg-stone-50 py-2 text-sm text-stone-500 transition-colors hover:bg-primary hover:text-white"
      >
        مشاهده تولیدی
      </Link>
    </div>
  );
}

export default Builder;
