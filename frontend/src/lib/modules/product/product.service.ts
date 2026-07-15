import { ApiError } from "@/lib/core/errors/ApiError";
import { AppError } from "@/lib/core/errors/AppError";
import { mapToAppError } from "@/lib/core/errors/errorMapper";
import { mapZodErrorToAppError } from "@/lib/core/errors/zodError";
import { ZodError } from "zod";
import { ProductAPI } from "./product.api";
import {
  CreateProductDto,
  UpdateProductDto,
  AddProductMediaDto,
  CreateProductRequest,
  UpdateProductRequest,
  AddProductMediaRequest,
} from "./product.dto";
import { ProductAdminFilters } from "./product.types";

export const ProductService = {
  async list(
    limit: number,
    offset: number,
    filters?: { q?: string; categoryId?: string },
  ) {
    try {
      const response = await ProductAPI.list(limit, offset, filters);
      
      return response.data;
    } catch (err) {
      console.log("ProductService.list error:", err);
      handleServiceError(err);
    }
  },

  async listByCategory(categoryId: string, limit: number, offset: number) {
    try {
      const response = await ProductAPI.listByCategory(categoryId, limit, offset);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async listByShop(shopId: string, limit: number, offset: number) {
    try {
      const response = await ProductAPI.listByShop(shopId, limit, offset);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async listShopProducts(shopId: string, limit: number, offset: number) {
    try {
      const response = await ProductAPI.listShopProducts(shopId, limit, offset);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async getById(id: string) {
    try {
      const response = await ProductAPI.getById(id);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async getBySlug(shopId: string, slug: string) {
    try {
      const response = await ProductAPI.getBySlug(shopId, slug);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async adminList(
    limit: number,
    offset: number,
    filters?: ProductAdminFilters,
  ) {
    try {
      const response = await ProductAPI.adminList(limit, offset, filters);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async create(shopId: string, data: CreateProductRequest) {
    try {
      const parsed = CreateProductDto.parse(data);
      const response = await ProductAPI.create(shopId, parsed);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async update(shopId: string, productId: string, data: UpdateProductRequest) {
    try {
      const parsed = UpdateProductDto.parse(data);
      const response = await ProductAPI.update(shopId, productId, parsed);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async toggleActivate(shopId: string, productId: string, activate: boolean) {
    try {
      if (activate) {
        await ProductAPI.activate(shopId, productId);
      } else {
        await ProductAPI.deactivate(shopId, productId);
      }
    } catch (err) {
      handleServiceError(err);
    }
  },

  async delete(shopId: string, productId: string) {
    try {
      await ProductAPI.delete(shopId, productId);
    } catch (err) {
      handleServiceError(err);
    }
  },

  async getMediaUploadURL(
    shopId: string,
    productId: string,
    fileName: string,
    contentType: string,
  ) {
    try {
      const response = await ProductAPI.getMediaUploadURL(shopId, productId, {
        fileName,
        contentType,
      });
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async addMedia(
    shopId: string,
    productId: string,
    data: AddProductMediaRequest,
  ) {
    try {
      const parsed = AddProductMediaDto.parse(data);
      const response = await ProductAPI.addMedia(shopId, productId, parsed);
      return response.data;
    } catch (err) {
      handleServiceError(err);
    }
  },

  async deleteMedia(shopId: string, productId: string, mediaId: string) {
    try {
      await ProductAPI.deleteMedia(shopId, productId, mediaId);
    } catch (err) {
      handleServiceError(err);
    }
  },
};

function handleServiceError(err: unknown): never {
  console.log(err);
  if (err instanceof AppError) throw err;
  if (err instanceof ApiError) throw err;
  if (err instanceof ZodError) throw mapZodErrorToAppError(err);
  throw mapToAppError(err);
}