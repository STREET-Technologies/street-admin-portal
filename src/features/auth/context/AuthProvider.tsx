import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { authApi } from "../api/auth-api";
import type { AuthState, AuthUser } from "../types";

export interface AuthContextValue extends AuthState {
  /** Store token and validate via /auth/me */
  login: (token: string) => void;
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
   * Handle OAuth callback: parse tokens from URL hash.
   * Returns true if tokens were found and processing started.
   */
  const handleOAuthCallback = useCallback(async (): Promise<boolean> => {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error");

    // Clear hash from URL regardless
    window.history.replaceState({}, "", window.location.pathname);

    if (error) {
      toast.error(decodeURIComponent(error));
      return true; // We handled it (even though it was an error)
    }

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      const valid = await validateToken();
      if (valid) {
        toast.success("Successfully logged in!");
      }
      return true;
    }

    return false;
  }, [validateToken]);

  /**
   * On mount:
   * 1. Check URL hash for OAuth callback tokens
   * 2. If no callback, check localStorage for existing token
   * 3. If token found, validate via /auth/me
   */
  useEffect(() => {
    async function init() {
      // First, check for OAuth callback
      const wasCallback = await handleOAuthCallback();
      if (wasCallback) {
        setIsLoading(false);
        return;
      }

      // Otherwise, check for existing token
      const token = localStorage.getItem("access_token");
      if (token) {
        await validateToken();
      }
      setIsLoading(false);
    }

    void init();
  }, [handleOAuthCallback, validateToken]);

  /**
   * Login: store token, validate, set user.
   */
  const login = useCallback(
    (token: string) => {
      localStorage.setItem("access_token", token);
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
