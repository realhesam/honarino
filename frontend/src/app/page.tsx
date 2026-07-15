"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Services from "@/components/other/Services";
import PopularProductsCarousel from "@/components/product/PopularProductsCarousel";
import ProductPanel, {
  type ProductWithMeta,
} from "@/components/product/ProductPanel";
import Section from "@/layout/Section";
import Banners from "@/ui/Banners";
import SliderCover from "@/ui/SliderCover";
import {
  PiFireDuotone,
  PiNoteDuotone,
  PiQuestion,
  PiShootingStarDuotone,
} from "react-icons/pi";
import { ProductService } from "@/lib/modules/product/product.service";
import { mapProductsToWithMeta } from "@/lib/modules/product/product.mapper";
import { CategoryService } from "@/lib/modules/category/category.service";
import FeaturedProducts from "@/components/product/FeaturedProducts";

interface MappedCategory {
  id: string;
  name: string;
  label: string;
  subFilters: Array<{ id: string; name: string; label: string }>;
}

function Home() {
  const [products, setProducts] = useState<ProductWithMeta[]>([]);

  const [initialProducts, setInitialProducts] = useState<ProductWithMeta[]>([]);
  const [categories, setCategories] = useState<MappedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("p_category") || "";
  const currentSubFilter = searchParams.get("p_filter") || "";

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [productRes, categoryData] = await Promise.all([
          ProductService.list(60, 0),
          CategoryService.list_all_categories(),
        ]);

        const rawProducts = productRes?.data || productRes || [];
        const mappedInitProducts = mapProductsToWithMeta(rawProducts);
        setInitialProducts(mappedInitProducts);
        setProducts(mappedInitProducts);

        const rawCategories = categoryData?.data || categoryData || [];
        const rootCategories = rawCategories.filter(
          (cat: any) => !cat.parent_id,
        );

        const mappedCategories: MappedCategory[] = rootCategories.map(
          (rootCat: any) => {
            const children = rawCategories.filter(
              (child: any) => child.parent_id === rootCat.id,
            );
            return {
              id: rootCat.id,
              name: rootCat.slug || rootCat.name || "",
              label: rootCat.name || "بدون نام",
              subFilters: [
                { id: rootCat.id, name: "all", label: "همه" },
                ...children.map((child: any) => ({
                  id: child.id,
                  name: child.slug || child.name || "",
                  label: child.name,
                })),
              ],
            };
          },
        );

        setCategories(mappedCategories);
      } catch (error) {
        console.error("خطا در بارگذاری اولیه صفحه:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function fetchFilteredProducts() {
      if (categories.length === 0) return;

      try {
        setProductsLoading(true);
        let productRes = null;

        if (currentCategory) {
          const activeCategoryObj = categories.find(
            (c) => c.name === currentCategory,
          );

          if (activeCategoryObj) {
            if (currentSubFilter && currentSubFilter !== "all") {
              const activeSub = activeCategoryObj.subFilters.find(
                (s) => s.name === currentSubFilter,
              );
              const targetId = activeSub ? activeSub.id : activeCategoryObj.id;
              productRes = await ProductService.list(60, 0, {
                categoryId: targetId,
              });
            } else {
              const childIds = activeCategoryObj.subFilters
                .filter((sub) => sub.name !== "all")
                .map((sub) => sub.id);

              if (childIds.length > 0) {
                productRes = await ProductService.list(60, 0, {
                  categoryId: childIds[0],
                });
              } else {
                productRes = await ProductService.list(60, 0, {
                  categoryId: activeCategoryObj.id,
                });
              }
            }
          }
        }

        if (!productRes) {
          const defaultRes = await ProductService.list(60, 0);
          const rawData = defaultRes?.data || defaultRes || [];
          setProducts(mapProductsToWithMeta(rawData));
          return;
        }

        const rawData = productRes?.data || productRes || [];
        setProducts(mapProductsToWithMeta(rawData));
      } catch (error) {
        console.error("خطا در واکشی فیلتر محصولات:", error);
      } finally {
        setProductsLoading(false);
      }
    }

    if (categories.length > 0) {
      fetchFilteredProducts();
    }
  }, [currentCategory, currentSubFilter, categories]);

  const popularProducts: ProductWithMeta[] = [...initialProducts]
    .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="text-center py-20">در حال بارگذاری اولیه صفحه...</div>
    );
  }

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
        title="چرا هنرینو"
        caption="چرا باید از خدمات ما استفاده کنید?"
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
