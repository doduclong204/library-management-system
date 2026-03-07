import React, { createContext, useContext } from "react";
import { useAuthStore } from "@/store/authStore";
import { MOCK_ALL_USERS } from "@/data/mockUsers";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Build DEMO_USERS lookup from MOCK_ALL_USERS
export const DEMO_USERS: Record<string, { user: User; password: string }> = {
  "student@library.com": {
    password: "student123",
    user: MOCK_ALL_USERS.find(u => u.id === "STU001")!,
  },
  "librarian@library.com": {
    password: "admin123",
    user: MOCK_ALL_USERS.find(u => u.id === "LIB001")!,
  },
  "minhanh@student.edu.vn": {
    password: "student123",
    user: MOCK_ALL_USERS.find(u => u.id === "STU001")!,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
