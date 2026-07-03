import LinkButton from "@/ui/LinkButton";
import SectionCenter from "@/ui/SectionCenter";
import Image from "next/image";
import { title } from "process";
import React from "react";
import { HiChevronLeft } from "react-icons/hi2";
import {
  PiArmchairFill,
  PiCoatHangerBold,
  PiDotsThreeCircleDuotone,
  PiHandHeartFill,
  PiPottedPlantDuotone,
  PiTreeFill,
  PiYarnDuotone,
} from "react-icons/pi";

type CategoryType = {
  icon: React.ReactElement;
  title: string;
  link: string;
  subLinks: string[];
  productCount: number;
};

type CategoryItemType = {
  image: string;
  title: string;
  link: string;
  productCount: number;
};

const categoryList: CategoryType[] = [
  {
    icon: <PiArmchairFill />,
    title: "مبلمان و صندلی",
    link: "/sofa",
    subLinks: ["سلطنتی", "مینیمال", "راحتی", "گوشه گرد", "صندلی تکی"],
    productCount: 1500,
  },
  {
    icon: <PiYarnDuotone />,
    title: "فرش و بافتنی",
    link: "/carpet-and-knitting",
    subLinks: ["فرش سلطنتی", "فرش مدرن", "فرش دستبافت", "فرش گرد"],
    productCount: 3000,
  },
  {
    icon: <PiPottedPlantDuotone />,
    title: "سفال و ظروف",
    link: "/pottery",
    subLinks: ["پارچ", "لیوان", "بشقاب", "کوزه"],
    productCount: 200,
  },
  {
    icon: <PiHandHeartFill />,
    title: "صنایع دستی",
    link: "/handmake",
    subLinks: ["تابلو", "کیف", "گلیم", "مجسمه"],
    productCount: 500,
  },
  {
    icon: <PiTreeFill />,
    title: "صنایع چوبی",
    link: "/woodmake",
    subLinks: ["میز", "صندلی چوبی", "دکوری"],
    productCount: 683,
  },
  {
    icon: <PiCoatHangerBold />,
    title: "لباس و پوشاک",
    link: "/clothes",
    subLinks: ["شلوار", "کفش", "کیف", "لباس"],
    productCount: 1632,
  },
  {
    icon: <PiDotsThreeCircleDuotone />,
    title: "سایر محصولات",
    link: "/others",
    subLinks: ["لوازم برقی", "گل و گیاه", "سوغاتی", "کیف و کفش"],
    productCount: 1632,
  },
];

export default function Categories() {
  return (
    <div className="container mt-25 sm:mt-30">
      <SectionCenter
        title="دسته بندی محصولات"
        text="کالا هایی که میخوای رو دسته بندی کن"
      >
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {categoryList.map((category, i) => (
            <div
              className="p-4 flex flex-col rounded-xl bg-white xs:w-70 shadow"
              key={i}
            >
              <div className="w-fit mb-2 *:size-10 bg-primary/10 text-primary rounded-full p-2">
                {category.icon}
              </div>
              <h3 className="text-lg font-medium xs:text-2xl line-clamp-1">
                {category.title}
              </h3>
              <div className="flex gap-1 items-center flex-wrap mt-2.5">
                {category.subLinks.map((subLink) => (
                  <span
                    key={subLink}
                    className="bg-stone-100 border border-stone-200 text-stone-600 p-1 rounded-sm text-xs"
                  >
                    {subLink}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between pt-2.5">
                <span className="text-xs text-stone-600 xs:text-sm">
                  {category.productCount} محصول
                </span>
                <LinkButton
                  href={`/categories/${category.link}`}
                  size="small"
                  customClass="p-0.5 *:size-5"
                >
                  <HiChevronLeft />
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </SectionCenter>
    </div>
  );
}
