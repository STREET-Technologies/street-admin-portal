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
  /** Call API login, server sets httpOnly cookies, then validate via /auth/me. */
  login: () => void;
  /** Call API logout (clears server-side cookies), then clear local state. */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  /**
   * Validate the session by calling /auth/me (cookie-based).
   * On success sets user state; on failure clears state.
   */
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  /**
   * On mount: always attempt to validate via cookie.
   * If the httpOnly cookie is valid, user is authenticated.
   */
  useEffect(() => {
    async function init() {
      await validateToken();
      setIsLoading(false);
    }

    void init();
  }, [validateToken]);

  /**
   * Login: server already set httpOnly cookies on the login response.
   * Just validate the session to populate user state.
   */
  const login = useCallback(() => {
    void validateToken();
  }, [validateToken]);

  /**
   * Logout: call API (which clears server-side cookies), then clear state.
   */
  const logout = useCallback(async () => {
    await authApi.logout();
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
