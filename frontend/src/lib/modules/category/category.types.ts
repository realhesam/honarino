export interface CategoryResponse {
    id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CategoryWithParentResponse extends CategoryResponse {
    parent: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    } | null;
}

export interface CategoryAncestorResponse {
    id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    depth: number;
}

export interface CategoryDescendantResponse {
    id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    depth: number;
}

export interface CategoryAdminResponse extends CategoryResponse {
    parent_name: string | null;
    deleted_at: string | null;
}

export interface CategoryCreate {
    parent_id?: string | null;
    name: string;
    slug: string;
    description?: string;
    active?: boolean;
}

export interface CategoryUpdate {
    parent_id?: string | null;
    name?: string;
    slug?: string;
    description?: string;
}