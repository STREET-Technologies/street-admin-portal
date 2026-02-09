import { api } from "@/lib/api-client";
import type { AuthUser } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/v1";

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

export const authApi = {
  /**
   * Validate the current token and get user info.
   * GET /auth/me -> { data: { email, ... } }
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const data = await api.get<MeResponse>("auth/me");
    const name =
      data.name ??
      [data.firstName, data.lastName].filter(Boolean).join(" ") ||
      data.email;
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

  /**
   * Get the URL to redirect the user to for Google OAuth login.
   */
  getGoogleLoginUrl: (): string => {
    return `${API_BASE_URL}/auth/admin/google`;
  },
};
