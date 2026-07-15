import type { ProductResponse } from "./product.types";
import type { ProductWithMeta } from "@/components/product/ProductPanel";

const FALLBACK_IMAGE = "/images/product.jpg";

function getMainCategory(p: ProductResponse) {
  return p.categories.find((c) => c.parent_id === null) ?? p.categories[0];
}

function getSubCategory(p: ProductResponse) {
  return p.categories.find((c) => c.parent_id !== null);
}

function computeOfferPercent(fromPrice: number | null, toPrice: number | null) {
  if (!fromPrice || !toPrice || fromPrice <= toPrice) return 0;
  return Math.round((1 - toPrice / fromPrice) * 100);
}

export function mapProductToWithMeta(p: ProductResponse): ProductWithMeta {
  const mainCategory = getMainCategory(p);
  const subCategory = getSubCategory(p);
  const cover = p.media[0]?.url ?? FALLBACK_IMAGE;

  return {
    id: p.id,
    cover,
    alt: p.media[0]?.alt_text ?? p.title,
    name: p.title,
    builder: p.shop_name ?? "",
    builderSlug: p.shop_id, // TODO: باید از بک‌اند shop_slug بگیریم، فعلاً fallback به id
    slug: p.slug,
    caption: p.description,
    category: mainCategory?.name ?? "",
    categorySlug: mainCategory?.slug ?? "",
    filterTag: subCategory?.slug ?? "",
    city: "", // TODO: بک‌اند فعلاً شهر تولیدکننده رو برنمی‌گردونه
    rate: 0, // TODO: بک‌اند فعلاً امتیاز/rating رو برنمی‌گردونه
    price: p.from_price ?? 0,
    offerPrice: p.to_price ?? p.from_price ?? 0,
    offer: computeOfferPercent(p.from_price, p.to_price),
    viewsCount: p.views_count,
  };
}

export function mapProductsToWithMeta(
  items: ProductResponse[],
): ProductWithMeta[] {
  return items.map(mapProductToWithMeta);
}