import LinkButton from "@/ui/LinkButton";
import SectionCenter from "@/ui/SectionCenter";
import Image from "next/image";
import { title } from "process";
import React from "react";
import { HiChevronLeft } from "react-icons/hi2";
import {
  PiArmchairFill,
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
    link: "sofa",
    productCount: 1500,
  },
  {
    icon: <PiYarnDuotone />,
    title: "فرش و بافتنی",
    link: "carpet-and-knitting",
    productCount: 3000,
  },
  {
    icon: <PiPottedPlantDuotone />,
    title: "سفال و ظروف",
    link: "pottery",
    productCount: 200,
  },
  {
    icon: <PiHandHeartFill />,
    title: "صنایع دستی",
    link: "handmake",
    productCount: 500,
  },
  {
    icon: <PiTreeFill />,
    title: "صنایع چوبی",
    link: "woodmake",
    productCount: 683,
  },
  {
    icon: <PiDotsThreeCircleDuotone />,
    title: "سایر محصولات",
    link: "others",
    productCount: 1632,
  },
];

const sofaCategory: CategoryItemType[] = [
  {
    title: "مینیمال و راحتی",
    image: "/images/category-sofa.jpg",
    link: "minimal",
    productCount: 120,
  },
  {
    title: "سلطنتی",
    image: "/images/category-sofa.jpg",
    link: "royal",
    productCount: 123,
  },
  {
    title: "تخت خواب شو",
    image: "/images/category-sofa.jpg",
    link: "royal",
    productCount: 140,
  },
  {
    title: "گوشه گرد",
    image: "/images/category-sofa.jpg",
    link: "royal",
    productCount: 102,
  },
  {
    title: "چسترفیلد",
    image: "/images/category-sofa.jpg",
    link: "royal",
    productCount: 79,
  },
  {
    title: "قطعه ای",
    image: "/images/category-sofa.jpg",
    link: "royal",
    productCount: 178,
  },
];

const pottery: CategoryItemType[] = [];

function CategoryItem({
  image,
  title,
  productCount,
  link,
}: Readonly<CategoryItemType>) {
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="relative w-full h-40 xs:size-50">
        <Image
          src={image}
          alt="sofas-category-image"
          className="rounded-t-xl"
          fill
        />
      </div>
      <div className="p-2.5">
        <h3 className="text-lg font-medium xs:text-2xl line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center justify-between pt-2.5">
          <span className="text-xs text-stone-600 xs:text-sm">
            {productCount} محصول
          </span>
          <LinkButton href={link} size="small" customClass="p-0.5 *:size-5">
            <HiChevronLeft />
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  return (
    <div className="container mt-25 sm:mt-30">
      <SectionCenter
        title="دسته بندی محصولات"
        text="کالا هایی که میخوای رو دسته بندی کن"
      >
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {categoryList.map((category, i) => (
            <div className="p-4 rounded-xl bg-white xs:w-50 shadow" key={i}>
              <div className="w-fit mb-2 *:size-10 bg-primary/10 text-primary rounded-full p-2">
                {category.icon}
              </div>
              <h3 className="text-lg font-medium xs:text-2xl line-clamp-1">
                {category.title}
              </h3>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-xs text-stone-600 xs:text-sm">
                  {category.productCount} محصول
                </span>
                <LinkButton size="small" customClass="p-0.5 *:size-5">
                  <HiChevronLeft />
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </SectionCenter>

      <SectionCenter title="دسته بندی مبلمان" subTitle={false}>
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {sofaCategory.map((sofa, i) => (
            <CategoryItem
              title={sofa.title}
              image={sofa.image}
              productCount={sofa.productCount}
              link={sofa.link}
              key={i}
            />
          ))}
        </div>
      </SectionCenter>

      <SectionCenter title="دسته بندی فرش و بافتنی" subTitle={false}>
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {sofaCategory.map((sofa, i) => (
            <CategoryItem
              title={sofa.title}
              image="/images/category-carpet.jpg"
              productCount={sofa.productCount}
              link={sofa.link}
              key={i}
            />
          ))}
        </div>
      </SectionCenter>

      <SectionCenter title="دسته بندی سفال و ظروف" subTitle={false}>
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {sofaCategory.map((sofa, i) => (
            <CategoryItem
              title={sofa.title}
              image="/images/category-pottery.jpg"
              productCount={sofa.productCount}
              link={sofa.link}
              key={i}
            />
          ))}
        </div>
      </SectionCenter>

      <SectionCenter title="دسته بندی صنایع چوبی" subTitle={false}>
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {sofaCategory.map((sofa, i) => (
            <CategoryItem
              title={sofa.title}
              image="/images/category-table.jpg"
              productCount={sofa.productCount}
              link={sofa.link}
              key={i}
            />
          ))}
        </div>
      </SectionCenter>
    </div>
  );
}
