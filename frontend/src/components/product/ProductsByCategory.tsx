"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi2";
import type { ProductType } from "@/types/types";
import SectionTabs from "@/ui/SectionTabs";
import ProductList from "./ProductList";

export interface ProductWithCategory extends ProductType {
  categorySlug: string;
}

interface CategoryTab {
  name: string;
  label: string;
}

interface ProductsByCategoryProps {
  products: Array<ProductWithCategory>;
  categories: Array<CategoryTab>;
}

function ProductsByCategory({
  products,
  categories,
}: Readonly<ProductsByCategoryProps>) {
  const [active, setActive] = useState(categories[0]?.name);

  const filtered = useMemo(
    () => products.filter((p) => p.categorySlug === active).slice(0, 5),
    [products, active]
  );

  const activeLabel = categories.find((c) => c.name === active)?.label;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <SectionTabs
          tabs={categories}
          defaultTab={active}
          onChange={setActive}
        />
      </div>
      <div className="mt-6">
        <ProductList products={filtered} />
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/products?category=${active}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <span>مشاهده همه محصولات {activeLabel}</span>
          <span className="*:size-4">
            <HiChevronLeft />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default ProductsByCategory;
