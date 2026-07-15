import type { ProductType } from "@/types/types";
import ProductList from "./ProductList";

async function getPopularProducts(
  products: Array<ProductType>
): Promise<Array<ProductType>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...products].sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
}

async function PopularProducts({
  products,
}: Readonly<{ products: Array<ProductType> }>) {
  const popularProducts = await getPopularProducts(products);

  return <ProductList products={popularProducts} badge="پرفروش" />;
}

export default PopularProducts;
