import type { ProductType } from "@/types/types";
import ProductList from "./ProductList";

async function getNewProducts(
  products: Array<ProductType>
): Promise<Array<ProductType>> {
  // Simulated network delay — replace with a real fetch/DB call.
  // Kept here so the Suspense boundary in page.tsx has something to show for.
  await new Promise((resolve) => setTimeout(resolve, 300));
  return products;
}

async function NewProducts({
  products,
}: Readonly<{ products: Array<ProductType> }>) {
  const newProducts = await getNewProducts(products);

  return <ProductList products={newProducts} badge="جدید" />;
}

export default NewProducts;
