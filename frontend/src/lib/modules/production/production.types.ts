interface Category {
  id: string;
  name?: string;
}
export interface Production {
    id: string;
    shop_id: string;
    shop_name: string;
    shop_description: string;
    categories: Category[];
    production_address: string;
    production_phone: string;
    production_email: string;
    owner_id: string;
    owner_name: string;
    telegram?: string;
    rubika?: string;
    eitaa?: string;
    whatsapp?: string;
    website?: string;
    logo_url: string | null;
    banner_url: string | null;
    cover_url: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductionListResponse {
    data: (Production & { member_role: string })[];
    total: number;
    limit: number;
    offset: number;
}

export interface ProductionMember {
    id?: string;
    production_id?: string;
    user_id: string;
    role: "owner" | "admin" | "editor";
    created_at?: string;
    updated_at?: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string | null;
    profile_picture_url?: string | null;
    user?: {
        name?: string;
        username?: string;
        email?: string;
        phone?: string | null;
        profile_picture_url?: string | null;
    };
}

export interface ProductionMembersListResponse {
    data: ProductionMember[];
    total: number;
    limit: number;
    offset: number;
}

export type ImageType = "logo" | "banner" | "cover";

export interface UploadUrlResponse {
    uploadUrl: string;
    publicUrl: string;
}

export interface ConfirmUploadResponse {
    url: string;
}

export interface isProductionActiveResponse {
    active: string;
}

export interface ProductionFilters {
    search?: string;
    status?: string;
}