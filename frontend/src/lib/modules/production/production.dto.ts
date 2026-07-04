import { z } from "zod";

export const CreateProductionDto = z.object({
    shop_id: z
        .string()
        .min(3, "شناسه فروشگاه حداقل باید ۳ کاراکتر باشد")
        .max(50, "شناسه فروشگاه نباید بیشتر از ۵۰ کاراکتر باشد")
        .regex(
            /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/,
            "شناسه فقط شامل حروف انگلیسی کوچک، اعداد و خط تیره است",
        ),
    shop_name: z.string().min(2, "نام فروشگاه حداقل باید ۲ کاراکتر باشد"),
    shop_description: z.string().min(20, "توضیحات باید حداقل ۲۰ کاراکتر باشد"),
    categories: z.array(z.string()).min(1, "حداقل یک دسته‌بندی انتخاب کنید"),
    production_address: z.string().min(5, "آدرس را کامل وارد کنید"),
    production_phone: z.string().min(8, "شماره تماس معتبر نیست"),
    production_email: z.string().email("فرمت ایمیل نامعتبر است"),
    telegram: z.string().optional(),
    rubika: z.string().optional(),
    eitaa: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().url("فرمت لینک وبسایت معتبر نیست").optional().or(z.literal("")),
});

export const UpdateProductionDto = CreateProductionDto.partial();

export const AddMemberDto = z.object({
    user_id: z.string().min(1, "شناسه کاربر الزامی است"),
    role: z.enum(["admin", "editor"], {
        error: (issue) => issue.input === undefined
            ? "نقش کاربر الزامی است"
            : "نقش کاربر باید admin یا editor باشد"
    }),
});

export const UpdateMemberRoleDto = z.object({
    role: z.enum(["admin", "editor"]),
});

export const UploadImageDto = z.object({
    type: z.enum(["logo", "banner", "cover"]),
    contentType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"], {
        error: (issue) => issue.input === undefined 
            ? "فرمت عکس الزامی است" 
            : "فرمت عکس پشتیبانی نمی‌شود"
    }),
});

export type CreateProductionRequest = z.infer<typeof CreateProductionDto>;
export type UpdateProductionRequest = z.infer<typeof UpdateProductionDto>;
export type AddMemberRequest = z.infer<typeof AddMemberDto>;
export type UpdateMemberRoleRequest = z.infer<typeof UpdateMemberRoleDto>;
export type UploadImageRequest = z.infer<typeof UploadImageDto>;