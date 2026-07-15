export interface ProductCategoryInfo {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface ProductMediaInfo {
  id: string;
  type: "image" | "video";
  url: string;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface ProductResponse {
  id: string;
  shop_id: string;
  shop_name?: string;
  title: string;
  slug: string;
  description: string;
  from_price: number | null;
  to_price: number | null;
  is_price_hidden: boolean;
  material: string | null;
  style: string | null;
  dimensions: string | null;
  production_time_days: number | null;
  is_customizable: boolean;
  status: "active" | "inactive";
  views_count: number;
  created_at: string;
  updated_at: string;
  categories: ProductCategoryInfo[];
  media: ProductMediaInfo[];
}

export interface ProductListResponse {
  data: ProductResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductAdminFilters {
  q?: string;
  status?: string;
}