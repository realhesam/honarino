import { ApiError } from "@/lib/core/errors/ApiError";
import { AppError } from "@/lib/core/errors/AppError";
import { mapToAppError } from "@/lib/core/errors/errorMapper";
import { mapZodErrorToAppError } from "@/lib/core/errors/zodError";
import { ZodError } from "zod";
import { AccountAPI } from "./account.api";
import { UpdateAccountDto, type UpdateAccountDtoType } from "./account.dto";

export const AccountService = {
    async get_user_data() {
        try {
            const response = await AccountAPI.get_user_data();
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async update_user_data(data: UpdateAccountDtoType) {
        try {
            const parsedData = UpdateAccountDto.parse(data);
            const response = await AccountAPI.update_user_data(parsedData);

            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async upload_file(file: File | Blob) {
        try {
            const fileName = file instanceof File ? file.name : `upload-${Date.now()}`;
            const contentType = file instanceof File ? file.type : "application/octet-stream";
            const uploadConfig = await AccountAPI.get_upload_url(fileName, contentType);
            console.log(uploadConfig)
            if (!uploadConfig?.data?.uploadUrl || !uploadConfig?.data?.publicUrl) {
                throw new Error("لود کردن لینک آپلود ناموفق بود");
            }

            const uploadResponse = await fetch(uploadConfig.data.uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": contentType,
                },
            });

            if (!uploadResponse.ok) {
                const bodyText = await uploadResponse.text();
                throw new Error(`آپلود تصویر ناموفق بود: ${uploadResponse.status} ${uploadResponse.statusText} ${bodyText}`);
            }

            return { publicUrl: uploadConfig.data.publicUrl };
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async change_password(currentPassword: string, newPassword: string) {
        try {
            const response = await AccountAPI.change_password(currentPassword, newPassword);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },
};
