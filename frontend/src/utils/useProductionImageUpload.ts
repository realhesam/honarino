import { useState } from "react";
import { ProductionService } from "@/lib/modules/production/production.service";
import { AppError } from "@/lib/core/errors/AppError";
import type { ImageType } from "@/lib/modules/production/production.types";

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
] as const;

export type AcceptedImageContentType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function isAcceptedImageType(type: string): type is AcceptedImageContentType {
    return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function validateProductionImageFile(file: File): string | null {
    if (!isAcceptedImageType(file.type)) {
        return "فرمت عکس پشتیبانی نمی‌شود (JPG، PNG، GIF یا WebP)";
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return "حجم عکس باید کمتر از ۵ مگابایت باشد";
    }
    return null;
}

interface UseUploadResult {
    isUploading: boolean;
    progress: number;
    uploadImage: (file: File, type: ImageType) => Promise<string>;
}

export async function uploadProductionImage(
    productionId: string,
    file: File,
    type: ImageType,
    onProgress?: (percent: number) => void,
): Promise<string> {
    const validationError = validateProductionImageFile(file);
    if (validationError) {
        throw new AppError({
            message: validationError,
            code: "INVALID_IMAGE",
            status: 400,
        });
    }

    const contentType = file.type as AcceptedImageContentType;
    const payload = { type, contentType };

    onProgress?.(10);

    const urlData = await ProductionService.getUploadUrl(productionId, payload);
    if (!urlData) {
        throw new AppError({
            message: "خطا در دریافت آدرس آپلود",
            code: "UPLOAD_URL_FAILED",
            status: 500,
        });
    }

    onProgress?.(40);

    const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": contentType,
        },
        body: file,
    });

    if (!uploadResponse.ok) {
        throw new AppError({
            message: "خطا در آپلود فایل در سرور ذخیره‌سازی",
            code: "UPLOAD_FAILED",
            status: 500,
        });
    }

    onProgress?.(75);

    const confirmData = await ProductionService.confirmUpload(productionId, payload);
    if (!confirmData) {
        throw new AppError({
            message: "خطا در تایید نهایی عکس",
            code: "CONFIRM_UPLOAD_FAILED",
            status: 500,
        });
    }

    onProgress?.(100);
    return confirmData.url;
}

export function useProductionImageUpload(productionId: string): UseUploadResult {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadImage = async (file: File, type: ImageType): Promise<string> => {
        setIsUploading(true);
        setProgress(0);

        try {
            return await uploadProductionImage(productionId, file, type, setProgress);
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return { isUploading, progress, uploadImage };
}
