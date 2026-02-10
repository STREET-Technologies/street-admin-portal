import { api } from "@/lib/api-client";
import type { AuthUser } from "../types";

/**
 * Backend shape returned by GET /auth/me.
 * We transform this to AuthUser at the call site.
 */
interface MeResponse {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  /**
   * Admin email/password login.
   * POST /auth/admin/login -> { data: { accessToken, refreshToken } }
   */
  login: async (
    email: string,
    password: string,
  ): Promise<LoginResponse> => {
    return api.post<LoginResponse>("auth/admin/login", { email, password });
  },

  /**
   * Validate the current token and get user info.
   * GET /auth/me -> { data: { email, ... } }
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const data = await api.get<MeResponse>("auth/me");
    const name =
      data.name ??
      ([data.firstName, data.lastName].filter(Boolean).join(" ") ||
        data.email);
    return { email: data.email, name };
  },

  /**
   * Logout the current session.
   * CRITICAL: This must be called BEFORE clearing localStorage tokens.
   * The api client's beforeRequest hook attaches the Bearer token from localStorage.
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post<unknown>("auth/logout");
    } catch {
      // Logout should succeed even if the API call fails
      // (e.g., token already expired on the server)
    }
  },
};
