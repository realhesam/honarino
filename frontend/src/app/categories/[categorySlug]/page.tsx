import LinkButton from "@/ui/LinkButton";
import SectionCenter from "@/ui/SectionCenter";
import Image from "next/image";
import { HiChevronLeft } from "react-icons/hi2";
import { PiArmchairFill } from "react-icons/pi";

type CategoryItemType = {
  image: string;
  title: string;
  link: string;
  productCount: number;
};

const category = {
  name: "sofa",
  label: "مبلمان و صندلی",
  icon: PiArmchairFill,
  subCategories: [
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
    {
      title: "قطعه ای",
      image: "/images/category-sofa.jpg",
      link: "royal",
      productCount: 178,
    },

    {
      title: "قطعه ای",
      image: "/images/category-sofa.jpg",
      link: "royal",
      productCount: 178,
    },
    {
      title: "قطعه ای",
      image: "/images/category-sofa.jpg",
      link: "royal",
      productCount: 178,
    },
    {
      title: "قطعه ای",
      image: "/images/category-sofa.jpg",
      link: "royal",
      productCount: 178,
    },
    {
      title: "قطعه ای",
      image: "/images/category-sofa.jpg",
      link: "royal",
      productCount: 178,
    },
  ],
};

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

export default function CategorySingle() {
  return (
    <div className="mt-30">
      <SectionCenter
        title="دسته بندی مبلمان"
        subTitle={true}
        text={<category.icon className="size-10" />}
      >
        <div className="grid grid-cols-2 xs:flex flex-wrap justify-center gap-5">
          {category.subCategories.map((subcategory, i) => (
            <CategoryItem
              title={subcategory.title}
              image={subcategory.image}
              productCount={subcategory.productCount}
              link={subcategory.link}
              key={i}
            />
          ))}
        </div>
      </SectionCenter>
    </div>
  );
}
