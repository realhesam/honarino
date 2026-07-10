import Category from "@/components/category/Category";
import Services from "@/components/other/Services";
import PopularProductsCarousel from "@/components/product/PopularProductsCarousel";
import PopularBuildersCarousel from "@/components/builder/PopularBuildersCarousel";
import ProductPanel, {
  type ProductWithMeta,
} from "@/components/product/ProductPanel";
import BuilderPanel from "@/components/builder/BuilderPanel";
import Section from "@/layout/Section";
import Banners from "@/ui/Banners";
import SliderCover from "@/ui/SliderCover";
import type { BuilderType } from "@/types/builder";
import { categories } from "@/data/categories";
import {
  PiBuildingsDuotone,
  PiFireDuotone,
  PiNoteDuotone,
  PiQuestion,
  PiShootingStarDuotone,
} from "react-icons/pi";

// ------------------------------------------------------------------
// Fake data — replace with real fetches once the API is ready.
// ------------------------------------------------------------------
const catSlugs = categories.map((c) => c.name);
const citySlugs = ["tehran", "isfahan", "shiraz", "tabriz", "mashhad"];
const subFiltersBySlug: Record<string, string[]> = Object.fromEntries(
  categories.map((c) => [c.name, c.subFilters.filter((f) => f.name !== "all").map((f) => f.name)])
);

const products: Array<ProductWithMeta> = Array.from({ length: 300 }, (_, i) => {
  const categorySlug = catSlugs[i % catSlugs.length];
  const tags = subFiltersBySlug[categorySlug];
  return {
    id: 530 + i,
    cover: "/images/product.jpg",
    alt: "تصویر مبل راحتی رویال",
    name: "مبل ال راحتی رویال",
    builder: "تولیدی مبلمان آقای علیسواری",
    slug: "mbl-al-kapr",
    caption:
      "مبل ال کاپر یکی از انواع مبل‌های ال ساده و مینیمال است که به دلیل سادگی در طراحی مورد توجه قرار گرفته است.",
    category: categories.find((c) => c.name === categorySlug)?.label ?? "",
    categorySlug,
    filterTag: tags[i % tags.length],
    city: citySlugs[i % citySlugs.length],
    rate: Number((3.6 + (i % 5) * 0.3).toFixed(1)),
    price: 21000000 + i * 150000,
    offerPrice: 20000000 + i * 150000,
    offer: 4 + (i % 6) * 3,
  };
});

const builders: Array<BuilderType> = Array.from({ length: 10 }, (_, i) => ({
  id: 100 + i,
  name: "تولیدی مبلمان آقای علیسواری",
  slug: `builder-${i}`,
  logo: "/images/product.jpg",
  city: citySlugs[i % citySlugs.length],
  rate: Number((3.6 + (i % 5) * 0.3).toFixed(1)),
  verified: i % 3 !== 0,
  productsCount: 40 + i * 17,
  viewsCount: 800 + i * 430,
  categories: [catSlugs[i % catSlugs.length]],
  bio: "بیش از ۱۵ سال سابقه در تولید مبلمان سنتی و مدرن با تمرکز بر کیفیت چوب و دوخت دست‌ساز.",
}));

const popularProducts = [...products].sort((a, b) => b.rate - a.rate).slice(0, 8);
const popularBuilders = [...builders]
  .sort((a, b) => b.viewsCount - a.viewsCount)
  .slice(0, 6);

function Home() {
  return (
    <div>
      <SliderCover />

      <Section
        title="برترین ها"
        caption="برترین تولیدی های هنرینو"
        icon={<PiShootingStarDuotone />}
      >
        <Banners />
      </Section>

      <Section
        hasViewMore={false}
        title="محصولات محبوب"
        caption="پرطرفدارترین محصولات از نگاه خریداران"
        icon={<PiFireDuotone />}
        withBg="bg-emerald-600"
        textColor="text-emerald-600"
      >
        <div className="container">
          <PopularProductsCarousel products={popularProducts} />
        </div>
      </Section>

      <Section
        id="products"
        title="محصولات"
        caption="با فیلتر دسته، شهر و مرتب‌سازی، دقیقاً همونی که میخوای رو پیدا کن"
        hasViewMore={false}
        icon={<PiNoteDuotone />}

        textColor="text-emerald-600"
      >
        <div className="container">
          <ProductPanel products={products} />
        </div>
      </Section>

      <Section
        hasViewMore={false}
        title="چرا هنرینو"
        caption="چرا باید از خدمات ما استفاده کنید؟"
        icon={<PiQuestion />}
      >
        <div className="container">
          <Services />
        </div>
      </Section>
    </div>
  );
}

export default Home;
