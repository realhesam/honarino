import { ApiError } from "@/lib/core/errors/ApiError";
import { AppError } from "@/lib/core/errors/AppError";
import { mapToAppError } from "@/lib/core/errors/errorMapper";
import { mapZodErrorToAppError } from "@/lib/core/errors/zodError";
import { ZodError } from "zod";
import { ProductionAPI } from "./production.api";
import {
    CreateProductionDto,
    UpdateProductionDto,
    AddMemberDto,
    UpdateMemberRoleDto,
    UploadImageDto,
    type CreateProductionRequest,
    type UpdateProductionRequest,
    type AddMemberRequest,
    type UpdateMemberRoleRequest,
    type UploadImageRequest
} from "./production.dto";
import { ProductionFilters } from "./production.types";

export const ProductionService = {
    async create(data: CreateProductionRequest) {
        try {
            const parsed = CreateProductionDto.parse(data);
            const response = await ProductionAPI.create(parsed);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async list(limit: number, offset: number) {
        try {
            const response = await ProductionAPI.list(limit, offset);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async adminList(limit: number, offset: number, filters?: ProductionFilters) {
        try {
            const response = await ProductionAPI.adminList(limit, offset, filters);
            return response.data; 
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },
    
    async getById(id: string) {
        try {
            const response = await ProductionAPI.getById(id);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async update(id: string, data: UpdateProductionRequest) {
        try {
            const parsed = UpdateProductionDto.parse(data);
            const response = await ProductionAPI.update(id, parsed);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async delete(id: string) {
        try {
            await ProductionAPI.delete(id);
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async getMembers(id: string, limit: number = 20, offset: number = 0) {
        try {
            const response = await ProductionAPI.getMembers(id, limit, offset);
            const payload = response.data as {
                data?: Array<any>;
                total?: number;
                limit?: number;
                offset?: number;
            } | undefined;

            const normalizedData = (payload?.data ?? []).map((member: any) => ({
                ...member,
                user: {
                    name: member.user?.name ?? member.name ?? "کاربر",
                    username: member.user?.username ?? member.username ?? "",
                    email: member.user?.email ?? member.email ?? "",
                    phone: member.user?.phone ?? member.phone ?? null,
                    profile_picture_url: member.user?.profile_picture_url ?? member.profile_picture_url ?? null,
                },
            }));

            return {
                ...(payload ?? {}),
                data: normalizedData,
            };
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async searchUsersForMembership(id: string, query: string) {
        try {
            const response = await ProductionAPI.searchUsersForMembership(id, query);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async addMember(id: string, data: AddMemberRequest) {
        try {
            const parsed = AddMemberDto.parse(data);
            await ProductionAPI.addMember(id, parsed);
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async updateMemberRole(id: string, userId: string, data: UpdateMemberRoleRequest) {
        try {
            const parsed = UpdateMemberRoleDto.parse(data);
            await ProductionAPI.updateMemberRole(id, userId, parsed);
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async removeMember(id: string, userId: string) {
        try {
            await ProductionAPI.removeMember(id, userId);
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async getUploadUrl(id: string, data: UploadImageRequest) {
        try {
            const parsed = UploadImageDto.parse(data);
            const response = await ProductionAPI.getUploadUrl(id, parsed);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async confirmUpload(id: string, data: UploadImageRequest) {
        try {
            const parsed = UploadImageDto.parse(data);
            const response = await ProductionAPI.confirmUpload(id, parsed);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async toggleActivate(id: string, activate: boolean) {
        try {
            if(activate == true)
            {
                await ProductionAPI.active(id);
            }else{
                await ProductionAPI.deactive(id);
            }
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async isProductionActive(id: string) {
        try {
            const response = await ProductionAPI.isProductionActive(id);
            return response.data
        } catch (err: unknown) {
            handleServiceError(err);
        }
    },

    async getMembersCount(id: string) {
        try {
            const response = await ProductionAPI.getMembersCount(id);
            console.log(response.data);
            return response.data;
        } catch (err: unknown) {
            handleServiceError(err);
        }
    }
};

function handleServiceError(err: unknown): never {
    if (err instanceof AppError) throw err;
    if (err instanceof ApiError) throw err;
    if (err instanceof ZodError) throw mapZodErrorToAppError(err);
    throw mapToAppError(err);
}