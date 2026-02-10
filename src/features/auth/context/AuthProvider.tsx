import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth-api";
import type { AuthState, AuthUser } from "../types";

export interface AuthContextValue extends AuthState {
  /** Store tokens and validate via /auth/me. */
  login: (accessToken: string, refreshToken?: string) => void;
  /** Call API logout THEN clear local state (fixes existing logout bug) */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  /**
   * Validate a token by calling /auth/me.
   * On success sets user state; on failure clears tokens.
   */
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return true;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      return false;
    }
  }, []);

  /**
   * On mount: check localStorage for existing token and validate.
   */
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("access_token");
      if (token) {
        await validateToken();
      }
      setIsLoading(false);
    }

    void init();
  }, [validateToken]);

  /**
   * Login: store tokens, validate, set user.
   */
  const login = useCallback(
    (accessToken: string, refreshToken?: string) => {
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      void validateToken();
    },
    [validateToken],
  );

  /**
   * Logout: call API FIRST (while token still in localStorage),
   * THEN clear tokens and state.
   * This fixes the existing bug where token was cleared before API call.
   */
  const logout = useCallback(async () => {
    // Step 1: Call API with token still in localStorage
    await authApi.logout();

    // Step 2: NOW clear localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Step 3: Clear state
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
