import { z } from "zod";

const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const CreateCategoryDto = z.object({
    parent_id: z
        .string()
        .uuid("شناسه دسته والد معتبر نیست")
        .nullable()
        .optional(),

    name: z
        .string()
        .min(2, "نام دسته‌بندی حداقل باید 2 کاراکتر باشد")
        .max(80, "نام دسته‌بندی حداکثر می‌تواند 80 کاراکتر باشد"),

    slug: z
        .string()
        .min(1, "اسلاگ الزامی است")
        .max(120, "اسلاگ حداکثر می‌تواند 120 کاراکتر باشد")
        .regex(slugRegex, "اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد"),

    description: z
        .string()
        .max(2000, "توضیحات حداکثر می‌تواند 2000 کاراکتر باشد")
        .optional(),

    active: z.boolean().optional(),
});

export const UpdateCategoryDto = z.object({
    parent_id: z
        .string()
        .uuid("شناسه دسته والد معتبر نیست")
        .nullable()
        .optional(),

    name: z
        .string()
        .min(2, "نام دسته‌بندی حداقل باید 2 کاراکتر باشد")
        .max(80, "نام دسته‌بندی حداکثر می‌تواند 80 کاراکتر باشد")
        .optional(),

    slug: z
        .string()
        .min(1, "اسلاگ الزامی است")
        .max(120, "اسلاگ حداکثر می‌تواند 120 کاراکتر باشد")
        .regex(slugRegex, "اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد")
        .optional(),

    description: z
        .string()
        .max(2000, "توضیحات حداکثر می‌تواند 2000 کاراکتر باشد")
        .optional(),
});

export type CreateCategoryDtoType = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDtoType = z.infer<typeof UpdateCategoryDto>;