import { httpClient } from "@/lib/core/httpClient";
import { type VendorRequestResponse, type VendorRequestCreate, type VendorRequestUpdate } from "./vendor.types";

export const VendorAPI = {
    create_request(data: VendorRequestCreate) {
        return httpClient.post<VendorRequestResponse>("/api/v1/vendor/request", data);
    },

    get_my_request() {
        return httpClient.get<VendorRequestResponse>("/api/v1/vendor/request");
    },

    update_request(data: VendorRequestUpdate) {
        return httpClient.put<VendorRequestResponse>("/api/v1/vendor/request", data);
    },

    approve_request(id: string) {
        return httpClient.patch<{ message: string }>(`/api/v1/admin/vendor/requests/${id}/approve`, {});
    },

    delete_request(id: string) {
        return httpClient.delete<{ message: string }>(`/api/v1/admin/vendor/requests/${id}`);
    },

    list_requests(limit: number, offset: number, search?: string) {
        return httpClient.get<{ data: VendorRequestResponse[]; total: number; limit: number; offset: number }>(
            `/api/v1/admin/vendor/requests`, 
            {
                params: {
                    limit,
                    offset,
                    ...(search ? { search } : {}) 
                }
            }
        );
    },
};