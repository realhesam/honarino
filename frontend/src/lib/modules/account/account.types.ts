import type { User } from "../auth/auth.types";

export interface AccountResponse extends User {
    admin?: string;
    phone?: string;
    address?: string;
    profile_picture_url?: string;
}

export interface AccountUpdate {
    name?: string | undefined;
    email?: string | undefined;
    username?: string | undefined;
    password?: string | undefined;
    profile_picture_url?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
}