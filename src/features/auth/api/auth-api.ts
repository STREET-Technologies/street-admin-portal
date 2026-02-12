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

export const authApi = {
  /**
   * Admin email/password login.
   * POST /auth/admin/login -> server sets httpOnly cookies.
   * Response JSON still contains tokens but we don't use them client-side.
   */
  login: async (email: string, password: string): Promise<void> => {
    await api.post<unknown>("auth/admin/login", { email, password });
  },

  /**
   * Validate the current session (cookie-based) and get user info.
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
   * Change the current user's password.
   * POST /auth/change-password (JwtAuthGuard)
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await api.post<unknown>("auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Logout the current session.
   * Server clears httpOnly cookies and invalidates refresh token in Redis.
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
