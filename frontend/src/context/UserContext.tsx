"use client";

import { createContext, useContext, useMemo } from "react";


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
  user: UserData;
  isAdmin: boolean;
  isVendor: boolean;
  isBasicUser: boolean;
}


const UserContext = createContext<UserContextValue | null>(null);


export function UserProvider({
  user,
  children,
}: {
  user: UserData;
  children: React.ReactNode;
}) {
  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isAdmin: user.role === "admin",
      isVendor: user.role === "vendor" || user.role === "admin",
      isBasicUser: user.role === "user",
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}


export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}