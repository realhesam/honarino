import { ApiError } from "@/lib/core/errors/ApiError";
import { AppError } from "@/lib/core/errors/AppError";
import { mapToAppError } from "@/lib/core/errors/errorMapper";
import { mapZodErrorToAppError } from "@/lib/core/errors/zodError";
import { ZodError } from "zod";
import { CategoryAPI } from "./category.api";
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    type CreateCategoryDtoType,
    type UpdateCategoryDtoType,
} from "./category.dto";

export const CategoryService = {
    async list_root_categories() {
        try {
            const response = await CategoryAPI.list_root_categories();
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async list_child_categories(id: string) {
        try {
            const response = await CategoryAPI.list_child_categories(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async get_category(id: string) {
        try {
            const response = await CategoryAPI.get_category(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async get_category_by_slug(slug: string) {
        try {
            const response = await CategoryAPI.get_category_by_slug(slug);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async get_category_ancestors(id: string) {
        try {
            const response = await CategoryAPI.get_category_ancestors(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async get_category_descendants(id: string) {
        try {
            const response = await CategoryAPI.get_category_descendants(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async list_all_categories() {
        try {
            const response = await CategoryAPI.list_all_categories();
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async create_category(data: CreateCategoryDtoType) {
        try {
            const parsed = CreateCategoryDto.parse(data);
            const response = await CategoryAPI.create_category(parsed);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async update_category(id: string, data: UpdateCategoryDtoType) {
        try {
            const parsed = UpdateCategoryDto.parse(data);
            const response = await CategoryAPI.update_category(id, parsed);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async delete_category(id: string) {
        try {
            const response = await CategoryAPI.delete_category(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async activate_category(id: string) {
        try {
            const response = await CategoryAPI.activate_category(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async deactivate_category(id: string) {
        try {
            const response = await CategoryAPI.deactivate_category(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async list_all_categories_admin(limit: number, offset: number, search?: string, status?: string) {
        try {
            const response = await CategoryAPI.list_all_categories_admin(limit, offset, search, status);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },
};