import { z } from "zod";

const ProductBase = z.object({
  title: z.string().min(2, "عنوان محصول حداقل باید ۲ کاراکتر باشد"),
  slug: z.string().min(2, "اسلاگ الزامی است"),
  description: z.string().min(10, "توضیحات محصول حداقل باید ۱۰ کاراکتر باشد"),
  is_price_hidden: z.boolean(),
  from_price: z.number().nullable(),
  to_price: z.number().nullable(),
  material: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  production_time_days: z.number().nullable().optional(),
  is_customizable: z.boolean(),
  category_ids: z.array(z.string()).min(1, "حداقل یک زیردسته باید انتخاب شود"),
});

// Create (strict validation)
export const CreateProductDto = ProductBase.refine((data) => {
  if (!data.is_price_hidden) {
    if (data.from_price === null || data.to_price === null) return false;
    return data.from_price <= data.to_price;
  }
  return true;
}, {
  message: "قیمت شروع نباید از قیمت پایان بیشتر باشد و مقادیر در حالت نمایش قیمت الزامی هستند",
  path: ["from_price"],
});

// Update (partial + adjusted validation)
export const UpdateProductDto = ProductBase.partial().superRefine((data, ctx) => {
  if (data.is_price_hidden === false) {
    if (data.from_price == null || data.to_price == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "قیمت شروع و پایان الزامی هستند وقتی قیمت نمایش داده شود",
        path: ["from_price"],
      });
    } else if (data.from_price > data.to_price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "قیمت شروع نباید از قیمت پایان بیشتر باشد",
        path: ["from_price"],
      });
    }
  }
});

export const AddProductMediaDto = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url("فرمت آدرس رسانه نامعتبر است"),
  sort_order: z.number().default(0),
  alt_text: z.string().optional(),
});

export type CreateProductRequest = z.infer<typeof CreateProductDto>;
export type UpdateProductRequest = z.infer<typeof UpdateProductDto>;
export type AddProductMediaRequest = z.infer<typeof AddProductMediaDto>;