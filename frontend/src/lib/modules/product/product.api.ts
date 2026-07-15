import { httpClient } from "@/lib/core/httpClient";
import {
  ProductResponse,
  ProductListResponse,
  ProductAdminFilters,
  ProductMediaInfo,
} from "./product.types";
import {
  CreateProductRequest,
  UpdateProductRequest,
  AddProductMediaRequest,
} from "./product.dto";

export const ProductAPI = {
  // اندپوینت‌های عمومی و کلاینت
  list(
    limit: number = 20,
    offset: number = 0,
    filters?: { q?: string; categoryId?: string },
  ) {
    return httpClient.get<ProductListResponse>("/api/v1/products", {
      params: {
        limit,
        offset,
        ...(filters?.q ? { q: filters.q } : {}),
        ...(filters?.categoryId ? { category_id: filters.categoryId } : {}),
      },
    });
  },

  listByCategory(categoryId: string, limit: number = 20, offset: number = 0) {
    return httpClient.get<ProductListResponse>(
      `/api/v1/products?category_id=${categoryId}&limit=${limit}&offset=${offset}`,
    );
  },
  listByShop(shopId: string, limit: number = 20, offset: number = 0) {
    return httpClient.get<ProductListResponse>(
      `/api/v1/products/shop/${shopId}?limit=${limit}&offset=${offset}`,
    );
  },
  getBySlug(shopId: string, slug: string) {
    return httpClient.get<ProductResponse>(
      `/api/v1/products/shop/${shopId}/slug/${slug}`,
    );
  },
  getById(id: string) {
    return httpClient.get<ProductResponse>(`/api/v1/products/${id}`);
  },

  // اندپوینت‌های مدیریت فروشگاه
  create(shopId: string, data: CreateProductRequest) {
    return httpClient.post<ProductResponse>(
      `/api/v1/productions/${shopId}/products`,
      data,
    );
  },
  listShopProducts(shopId: string, limit: number = 20, offset: number = 0) {
    return httpClient.get<ProductListResponse>(
      `/api/v1/productions/${shopId}/products?limit=${limit}&offset=${offset}`,
    );
  },
  update(shopId: string, productId: string, data: UpdateProductRequest) {
    return httpClient.patch<ProductResponse>(
      `/api/v1/productions/${shopId}/products/${productId}`,
      data,
    );
  },
  delete(shopId: string, productId: string) {
    return httpClient.delete<void>(
      `/api/v1/productions/${shopId}/products/${productId}`,
    );
  },
  activate(shopId: string, productId: string) {
    return httpClient.post<void>(
      `/api/v1/productions/${shopId}/products/${productId}/activate`,
    );
  },
  deactivate(shopId: string, productId: string) {
    return httpClient.post<void>(
      `/api/v1/productions/${shopId}/products/${productId}/deactivate`,
    );
  },
  addMedia(shopId: string, productId: string, data: AddProductMediaRequest) {
    return httpClient.post<ProductMediaInfo>(
      `/api/v1/productions/${shopId}/products/${productId}/media`,
      data,
    );
  },
  deleteMedia(shopId: string, productId: string, mediaId: string) {
    return httpClient.delete<void>(
      `/api/v1/productions/${shopId}/products/${productId}/media/${mediaId}`,
    );
  },

  // پنل ادمین سراسری
  adminList(
    limit: number = 20,
    offset: number = 0,
    filters?: ProductAdminFilters,
  ) {
    let url = `/api/v1/admin/products?limit=${limit}&offset=${offset}`;
    if (filters?.q) url += `&q=${encodeURIComponent(filters.q)}`;
    if (filters?.status && filters.status !== "all")
      url += `&status=${filters.status}`;
    return httpClient.get<ProductListResponse>(url);
  },

  getMediaUploadURL(
    shopId: string,
    productId: string,
    data: { fileName: string; contentType: string },
  ) {
    return httpClient.post<{ uploadUrl: string; publicUrl: string }>(
      `/api/v1/productions/${shopId}/products/${productId}/media/upload-url`,
      data,
    );
  },
};
