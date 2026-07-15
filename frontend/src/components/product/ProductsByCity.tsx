"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi2";
import type { ProductType } from "@/types/types";
import SectionTabs from "@/ui/SectionTabs";
import ProductList from "./ProductList";

export interface ProductWithCity extends ProductType {
  city: string;
}

interface CityTab {
  name: string;
  label: string;
}

interface ProductsByCityProps {
  products: Array<ProductWithCity>;
  cities: Array<CityTab>;
}

function ProductsByCity({ products, cities }: Readonly<ProductsByCityProps>) {
  const [active, setActive] = useState(cities[0]?.name);

  const filtered = useMemo(
    () => products.filter((p) => p.city === active).slice(0, 5),
    [products, active]
  );

  const activeLabel = cities.find((c) => c.name === active)?.label;

  return (
    <div>
      <SectionTabs
        tabs={cities}
        defaultTab={active}
        onChange={setActive}
        theme="emerald"
      />
      <div className="mt-6">
        <ProductList products={filtered} />
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/products?city=${active}`}
          className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
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

export default ProductsByCity;
