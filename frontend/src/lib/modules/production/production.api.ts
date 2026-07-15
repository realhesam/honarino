import { httpClient } from "@/lib/core/httpClient";
import type {
    Production,
    ProductionListResponse,
    ProductionMember,
    ProductionMembersListResponse,
    UploadUrlResponse,
    ConfirmUploadResponse,
    isProductionActiveResponse,
    ProductionFilters
} from "./production.types";
import type {
    CreateProductionRequest,
    UpdateProductionRequest,
    AddMemberRequest,
    UpdateMemberRoleRequest,
    UploadImageRequest
} from "./production.dto";

const BASE_URL = "/api/v1/productions";

export const ProductionAPI = {
    create(data: CreateProductionRequest) {
        return httpClient.post<Production>(BASE_URL, data);
    },
    list(limit: number = 20, offset: number = 0) {
        return httpClient.get<ProductionListResponse>(`${BASE_URL}/list?limit=${limit}&offset=${offset}`);
    },
    adminList(limit: number = 20, offset: number = 0, filters?: ProductionFilters) {
        let url = `${BASE_URL}/list/admin?limit=${limit}&offset=${offset}`;
        
        if (filters?.search) {
            url += `&search=${encodeURIComponent(filters.search)}`;
        }

        if (filters?.status && filters.status !== 'all') {
            url += `&status=${filters.status}`;
        }

        return httpClient.get<ProductionListResponse>(url);
    },
    getById(id: string) {
        return httpClient.get<Production>(`${BASE_URL}/${id}`);
    },
    publicGetById(id: string) {
        return httpClient.get<Production>(`${BASE_URL}/${id}/get`);
    },
    update(id: string, data: UpdateProductionRequest) {
        return httpClient.patch<Production>(`${BASE_URL}/${id}`, data);
    },
    delete(id: string) {
        return httpClient.delete<void>(`${BASE_URL}/${id}`);
    },

    isProductionActive(id: string) {
        return httpClient.post<isProductionActiveResponse>(`${BASE_URL}/${id}/isactive`);
    },

    getMembers(id: string, limit: number = 20, offset: number = 0) {
        return httpClient.get<ProductionMembersListResponse>(`${BASE_URL}/${id}/members?limit=${limit}&offset=${offset}`);
    },
    searchUsersForMembership(id: string, query: string) {
        return httpClient.get<{ data: any[] }>(`${BASE_URL}/${id}/members?q=${encodeURIComponent(query)}`);
    },
    addMember(id: string, data: AddMemberRequest) {
        return httpClient.post<void>(`${BASE_URL}/${id}/members`, data);
    },
    updateMemberRole(id: string, userId: string, data: UpdateMemberRoleRequest) {
        return httpClient.patch<void>(`${BASE_URL}/${id}/members/${userId}`, data);
    },
    removeMember(id: string, userId: string) {
        return httpClient.delete<void>(`${BASE_URL}/${id}/members/${userId}`);
    },

    getMembersCount(id: string) {
        return httpClient.get<{ total: number, editorTotal: number, adminTotal: number }>(`${BASE_URL}/${id}/members/count`);
    },

    getUploadUrl(id: string, data: UploadImageRequest) {
        return httpClient.post<UploadUrlResponse>(`${BASE_URL}/${id}/upload-url`, data);
    },
    confirmUpload(id: string, data: UploadImageRequest) {
        return httpClient.post<ConfirmUploadResponse>(`${BASE_URL}/${id}/confirm-upload`, data);
    },

    active(id: string) {
        return httpClient.post<void>(`${BASE_URL}/${id}/approve`);
    },

    deactive(id: string) {
        return httpClient.post<void>(`${BASE_URL}/${id}/deactive`);
    }
};