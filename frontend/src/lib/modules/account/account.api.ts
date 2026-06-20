import { httpClient } from "@/lib/core/httpClient";
import { type AccountResponse, type AccountUpdate } from "./account.types";

export const AccountAPI = {
    get_user_data() {
        return httpClient.get<AccountResponse>("/api/v1/user/profile");
    },

    update_user_data(data: AccountUpdate) {
        return httpClient.put<AccountResponse>("/api/v1/user/profile", data);
    },

    get_upload_url(fileName: string, contentType: string) {
        return httpClient.post<{ uploadUrl: string; publicUrl: string }>("/api/v1/user/profile/upload-url", {
            fileName,
            contentType,
        });
    },

    change_password(currentPassword: string, newPassword: string) {
        return httpClient.post<{ message: string }>("/api/v1/user/profile/change-password", {
            current_password: currentPassword,
            new_password: newPassword,
        });
    },
};
