import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuthStore } from "@/store/authStore";
import authService, { parseAuthError } from "@/services/authService";
import type { User, LoginRequest } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setAuth,
    updateUser,
    logout: storeLogout,
  } = useAuthStore();

  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (!accessToken || user) return;
    setIsLoading(true);
    authService
      .getMe()
      .then(({ data }) => {
        setAuth(data.data, accessToken, refreshToken ?? "");
      })
      .catch(() => storeLogout())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const { data: res } = await authService.login(credentials);
        // backend: ApiResponse<AuthenticationResponse> → res.data
        const { access_token, refresh_token, user: userData } = res.data;

        if (!access_token || !userData) {
          throw new Error("Phản hồi từ server không hợp lệ");
        }

        setAuth(userData, access_token, refresh_token);
      } catch (err) {
        throw new Error(parseAuthError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
    } finally {
      storeLogout();
    }
  }, [refreshToken, storeLogout]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};