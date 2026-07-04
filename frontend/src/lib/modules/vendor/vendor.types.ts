export interface VendorRequestResponse {
    id: string;
    user_id: string;
    fullname: string;
    nid: string;
    phone: string;
    email: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface VendorRequestCreate {
    fullname: string;
    nid: string;
    phone: string;
    email: string;
    description?: string;
}

export interface VendorRequestUpdate {
    fullname?: string;
    phone?: string;
    email?: string;
    description?: string;
}