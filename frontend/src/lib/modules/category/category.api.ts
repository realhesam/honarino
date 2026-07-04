import { httpClient } from "@/lib/core/httpClient";
import {
    type CategoryResponse,
    type CategoryWithParentResponse,
    type CategoryAncestorResponse,
    type CategoryDescendantResponse,
    type CategoryAdminResponse,
    type CategoryCreate,
    type CategoryUpdate,
} from "./category.types";

export const CategoryAPI = {
    list_root_categories() {
        return httpClient.get<{ data: CategoryResponse[] }>("/api/v1/categories");
    },

    list_child_categories(id: string) {
        return httpClient.get<{ data: CategoryResponse[] }>(`/api/v1/categories/${id}/children`);
    },

    get_category(id: string) {
        return httpClient.get<CategoryWithParentResponse>(`/api/v1/categories/${id}`);
    },

    get_category_by_slug(slug: string) {
        return httpClient.get<CategoryResponse>(`/api/v1/categories/slug/${slug}`);
    },

    get_category_ancestors(id: string) {
        return httpClient.get<{ data: CategoryAncestorResponse[] }>(`/api/v1/categories/${id}/ancestors`);
    },

    get_category_descendants(id: string) {
        return httpClient.get<{ data: CategoryDescendantResponse[] }>(`/api/v1/categories/${id}/descendants`);
    },

    list_all_categories() {
        return httpClient.get<{ data: CategoryResponse[] }>("/api/v1/categories/all");
    },

    create_category(data: CategoryCreate) {
        return httpClient.post<CategoryResponse>("/api/v1/admin/categories", data);
    },

    update_category(id: string, data: CategoryUpdate) {
        return httpClient.patch<CategoryResponse>(`/api/v1/admin/categories/${id}`, data);
    },

    delete_category(id: string) {
        return httpClient.delete<{ message: string }>(`/api/v1/admin/categories/${id}`);
    },

    activate_category(id: string) {
        return httpClient.post<{ message: string }>(`/api/v1/admin/categories/${id}/activate`, {});
    },

    deactivate_category(id: string) {
        return httpClient.post<{ message: string }>(`/api/v1/admin/categories/${id}/deactivate`, {});
    },

    list_all_categories_admin(limit: number, offset: number, search?: string, status?: string) {
        return httpClient.get<{ data: CategoryAdminResponse[]; total: number; limit: number; offset: number }>(
            `/api/v1/admin/categories`,
            {
                params: {
                    limit,
                    offset,
                    ...(search ? { q: search } : {}),
                    ...(status ? { status } : {}),
                },
            }
        );
    },
};