import { z } from "zod";

export const CreateVendorRequestDto = z.object({
    fullname: z
        .string()
        .min(3, "نام و نام خانوادگی حداقل باید 3 کاراکتر باشد")
        .max(100, "نام و نام خانوادگی حداکثر میتواند 100 کاراکتر باشد"),

    nid: z
        .string()
        .length(10, "کد ملی باید دقیقاً 10 رقم باشد")
        .regex(/^\d{10}$/, "کد ملی باید فقط شامل عدد باشد"),

    phone: z
        .string()
        .length(11, "تلفن همراه باید دقیقاً 11 کاراکتر باشد")
        .regex(/^09\d{9}$/, "شماره تلفن همراه معتبر نیست"),

    email: z
        .string()
        .email("ایمیل را به درستی وارد کنید"),

    description: z
        .string()
        .min(10, "توضیحات حداقل باید 10 کاراکتر باشد")
        .max(1000, "توضیحات حداکثر میتواند 1000 کاراکتر باشد")
        .optional(),
});

export const UpdateVendorRequestDto = z.object({
    fullname: z
        .string()
        .min(3, "نام و نام خانوادگی حداقل باید 3 کاراکتر باشد")
        .max(100, "نام و نام خانوادگی حداکثر میتواند 100 کاراکتر باشد")
        .optional(),

    phone: z
        .string()
        .length(11, "تلفن همراه باید دقیقاً 11 کاراکتر باشد")
        .regex(/^09\d{9}$/, "شماره تلفن همراه معتبر نیست")
        .optional(),

    email: z
        .string()
        .email("ایمیل را به درستی وارد کنید")
        .optional(),

    description: z
        .string()
        .min(10, "توضیحات حداقل باید 10 کاراکتر باشد")
        .max(1000, "توضیحات حداکثر میتواند 1000 کاراکتر باشد")
        .optional(),
});

export type CreateVendorRequestDtoType = z.infer<typeof CreateVendorRequestDto>;
export type UpdateVendorRequestDtoType = z.infer<typeof UpdateVendorRequestDto>;