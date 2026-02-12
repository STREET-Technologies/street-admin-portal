import ky, { type Options, HTTPError } from "ky";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/v1";

/**
 * Custom error class for API errors.
 * Carries status code, status text, and optional response body.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Unwrap the backend's { data: T } response envelope.
 * If the response body has a `data` property, return it.
 * Otherwise return the body as-is.
 */
function unwrapEnvelope<T>(body: unknown): T {
  if (
    body !== null &&
    typeof body === "object" &&
    "data" in (body as Record<string, unknown>)
  ) {
    return (body as Record<string, unknown>).data as T;
  }
  return body as T;
}

/**
 * Pre-configured ky instance with auth header injection,
 * 401 redirect, and sensible defaults.
 */
/** Flag to prevent concurrent refresh attempts */
let isRefreshing = false;

/** Flag set during logout to prevent the interceptor from re-authenticating */
let isLoggingOut = false;

export function markLoggingOut() {
  isLoggingOut = true;
}

export function clearLoggingOut() {
  isLoggingOut = false;
}

/**
 * Attempt a silent token refresh via the httpOnly refresh_token cookie.
 * Returns true if refresh succeeded, false otherwise.
 */
async function silentRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pre-configured ky instance with cookie-based auth,
 * silent token refresh on 401, and sensible defaults.
 */
const kyInstance = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30_000,
  credentials: "include",
  retry: {
    limit: 2,
    methods: ["get"],
  },
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // Don't attempt refresh on login page or during logout
          if (window.location.pathname === "/login" || isLoggingOut) return;

          // Prevent infinite refresh loops
          if (isRefreshing) {
            window.location.href = "/login";
            return;
          }

          isRefreshing = true;
          const refreshed = await silentRefresh();
          isRefreshing = false;

          if (refreshed) {
            // Retry the original request with fresh cookies
            return kyInstance(request, options);
          }

          // Refresh failed — redirect to login
          window.location.href = "/login";
        }
      },
    ],
  },
});

/**
 * Make a request and return parsed + unwrapped JSON.
 * Catches ky HTTPError and re-throws as ApiError with status info.
 */
async function request<T>(
  method: "get" | "post" | "patch" | "delete",
  endpoint: string,
  options?: Options,
): Promise<T> {
  try {
    const response = await kyInstance[method](endpoint, options);
    const body: unknown = await response.json();
    return unwrapEnvelope<T>(body);
  } catch (error) {
    if (error instanceof HTTPError) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      let data: unknown;
      try {
        data = await error.response.json();
      } catch {
        // Response body may not be JSON
      }
      throw new ApiError(status, statusText, data);
    }
    throw error;
  }
}

/**
 * Make a request and return parsed JSON WITHOUT envelope unwrapping.
 * Use for paginated responses where both `data` and `meta` are needed.
 */
async function requestRaw<T>(
  method: "get" | "post" | "patch" | "delete",
  endpoint: string,
  options?: Options,
): Promise<T> {
  try {
    const response = await kyInstance[method](endpoint, options);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof HTTPError) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      let data: unknown;
      try {
        data = await error.response.json();
      } catch {
        // Response body may not be JSON
      }
      throw new ApiError(status, statusText, data);
    }
    throw error;
  }
}

/**
 * Centralized API client.
 * All feature-level API modules import and use this.
 */
export const api = {
  get: <T>(endpoint: string) => request<T>("get", endpoint),

  /**
   * GET without envelope unwrapping. Use for paginated endpoints
   * where the response has both `data` and `meta` at the same level.
   */
  getRaw: <T>(endpoint: string) => requestRaw<T>("get", endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>("post", endpoint, body !== undefined ? { json: body } : undefined),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>("patch", endpoint, body !== undefined ? { json: body } : undefined),

  delete: <T>(endpoint: string) => request<T>("delete", endpoint),
};
