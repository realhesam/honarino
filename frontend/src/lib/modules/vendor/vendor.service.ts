import { ApiError } from "@/lib/core/errors/ApiError";
import { AppError } from "@/lib/core/errors/AppError";
import { mapToAppError } from "@/lib/core/errors/errorMapper";
import { mapZodErrorToAppError } from "@/lib/core/errors/zodError";
import { ZodError } from "zod";
import { VendorAPI } from "./vendor.api";
import { CreateVendorRequestDto, UpdateVendorRequestDto, type CreateVendorRequestDtoType, type UpdateVendorRequestDtoType } from "./vendor.dto";

export const VendorService = {
    async create_request(data: CreateVendorRequestDtoType) {
        try {
            const parsed = CreateVendorRequestDto.parse(data);
            const response = await VendorAPI.create_request(parsed);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async get_my_request() {
        try {
            const response = await VendorAPI.get_my_request();
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async update_request(data: UpdateVendorRequestDtoType) {
        try {
            const parsed = UpdateVendorRequestDto.parse(data);
            const response = await VendorAPI.update_request(parsed);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async list_requests(limit: number, offset: number, search?: string) {
        try {
            const response = await VendorAPI.list_requests(limit, offset, search);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async approve_request(id: string) {
        try {
            const response = await VendorAPI.approve_request(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },

    async delete_request(id: string) {
        try {
            const response = await VendorAPI.delete_request(id);
            return response.data;
        } catch (err: unknown) {
            if (err instanceof AppError) throw err;
            if (err instanceof ApiError) throw err;
            if (err instanceof ZodError) throw mapZodErrorToAppError(err);
            throw mapToAppError(err);
        }
    },
};