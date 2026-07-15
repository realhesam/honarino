"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProductService } from "@/lib/modules/product/product.service";
import ProductList from "@/components/product/ProductList";
import {
  mapProductsToWithMeta,
  mapProductToWithMeta,
} from "@/lib/modules/product/product.mapper";
import { FiInbox } from "react-icons/fi";
import { ProductResponse } from "@/lib/modules/product/product.types";

const PAGE_SIZE = 12;

export default function ProductionProductsPage() {
  const { production: productionId } = useParams() as { production: string };
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const searchTerm = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProductionProducts() {
      setIsLoading(true);
      try {
        const response = await ProductService.list(
          PAGE_SIZE,
          (page - 1) * PAGE_SIZE,
          {
            q: searchTerm,
            productionId: productionId,
          },
        );
        setProducts(response?.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (productionId) loadProductionProducts();
  }, [page, searchTerm, productionId]);

  const mappedProducts = useMemo(() => {
    return products.map(mapProductToWithMeta);
  }, [products]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 animate-pulse">
        در حال دریافت محصولات تولیدی...
      </div>
    );
  }

  if (mappedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-white py-16 text-center">
        <FiInbox className="mb-3 h-10 w-10 text-slate-300" />
        <p className="font-semibold text-slate-600">
          این تولیدی هنوز محصولی ثبت نکرده است.
        </p>
      </div>
    );
  }

  return <ProductList products={mappedProducts} />;
}
