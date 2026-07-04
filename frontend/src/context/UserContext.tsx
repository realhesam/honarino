"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { AccountService } from "@/lib/modules/account/account.service";
import { AuthService } from "@/lib/modules/auth/auth.service";
import { AppError } from "@/lib/core/errors/AppError";
import { redirect } from "next/navigation";

export type UserRole = "user" | "vendor" | "admin";

export interface UserData {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar: string;
  queriesCount: number;
  favoritesCount: number;
  notificationsCount: number;
  role: UserRole;
}

interface UserContextValue {
  user: UserData | null;
  setUser: (u: UserData) => void;
  isLoading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isBasicUser: boolean;
  fetchUserData: () => Promise<void>;
  updateProfile: (profileData: any, selectedFile: File | null) => Promise<boolean>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  user: initialUser,
  children,
}: {
  user: UserData;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserData | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      AuthService.requireAuth();
      const response = await AccountService.get_user_data();
      console.log(response);
      setUser({
        id: response.id || "0",
        username: response.username,
        name: response.name,
        phone: response.phone || "",
        email: response.email || "",
        address: response.address || "",
        avatar: response.profile_picture_url || "/images/default-user.jpg",
        queriesCount: response.queriesCount || 0,
        favoritesCount: response.favoritesCount || 0,
        notificationsCount: response.notificationsCount || 0,
        role: response.role as UserRole || "user",
      });
    } catch (error) {
      if (error instanceof AppError) {
        AuthService.logout();

        redirect("/auth/signin");
        
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const updateProfile = async (
    profileData: any, 
    selectedFile: File | null,
    onProgress?: (percent: number) => void
  ): Promise<boolean> => {
    let profileUrl = user?.avatar || "/images/default-user.jpg";
    let isUploaded = false;

    if (selectedFile) {
      const { publicUrl } = await AccountService.upload_file(selectedFile);
      profileUrl = publicUrl;
      isUploaded = true;
    }

    const dataToSend = {
      name: profileData.name || undefined,
      username: profileData.username || undefined,
      address: profileData.address || undefined,
      phone: profileData.phone || undefined,
      email: profileData.email || undefined,
      profile_picture_url: profileUrl || undefined,
      password: profileData.password || undefined,
    };

    await AccountService.update_user_data(dataToSend);

    setUser((prev) =>
      prev
        ? {
            ...prev,
            name: dataToSend.name ?? prev.name,
            username: dataToSend.username ?? prev.username,
            address: dataToSend.address ?? prev.address,
            phone: dataToSend.phone ?? prev.phone,
            email: dataToSend.email ?? prev.email,
            avatar: profileUrl,
          }
        : null
    );

    return isUploaded;
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    await AccountService.change_password(currentPass, newPass);
  };

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      setUser: (u) => setUser(u),
      isLoading,
      isAdmin: user?.role === "admin",
      isVendor: user?.role === "vendor" || user?.role === "admin",
      isBasicUser: user?.role === "user",
      fetchUserData,
      updateProfile,
      changePassword,
    }),
    [user, isLoading, fetchUserData]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}