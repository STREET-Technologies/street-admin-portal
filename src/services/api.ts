// API service for STREET backend integration
import type { User, Retailer, Courier } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/v1";

// Backend entity types
interface BackendVendor {
  id: string;
  storeName: string;
  storeUrl: string;
  logo: string | null;
  storeImage: string | null;
  description: string | null;
  vendorType: string;
  email: string;
  phone: string;
  country: string | null;
  postcode: string | null;
  address: string | null;
  vendorCategory: string | null;
  latitude: number | null;
  longitude: number | null;
  referredBy: string | null;
  externalId: string | null;
  metadata: any;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendUser {
  id: string;
  phone: string | null;
  profileImage: string | null;
  language: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Transform backend Vendor to frontend Retailer
const transformVendorToRetailer = (vendor: BackendVendor): Retailer => {
  return {
    id: vendor.id,
    name: vendor.storeName,
    email: vendor.email || 'No email',
    phone: vendor.phone || 'No phone',
    avatar: vendor.logo || vendor.storeImage || undefined,
    status: vendor.isOnline ? 'active' : 'inactive',
    joinDate: vendor.createdAt || new Date().toISOString(),
    deviceId: vendor.externalId || '',
    uid: `vendor_${vendor.id.split('-')[0]}`,
    totalOrders: 0, // TODO: This should come from backend
    totalRevenue: 0, // TODO: This should come from backend
    address: vendor.address || '',
    contact: vendor.phone || 'No contact',
    category: vendor.vendorCategory || vendor.vendorType || '',
    pocManager: vendor.referredBy || '',
    signedUpBy: vendor.referredBy || '',
    posSystem: vendor.vendorType,
    commissionRate: '10%', // TODO: Should come from backend
    owner: '', // TODO: Should come from backend
  };
};

// Transform backend User to frontend User
const transformBackendUser = (user: BackendUser): User => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown User';
  return {
    id: user.id,
    name: fullName,
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.profileImage || undefined,
    status: 'active', // TODO: Backend doesn't have status field
    joinDate: user.createdAt,
    deviceId: '', // TODO: Backend doesn't have deviceId
    uid: `user_${user.id.split('-')[0]}`,
    totalOrders: 0, // TODO: Should come from backend
    totalSpent: 0, // TODO: Should come from backend
  };
};

// Get auth token from localStorage or cookie
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token") || null;
};

interface BackendResponse<T> {
  message?: string;
  data: T;
  statusCode?: number;
  timestamp?: string;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Bearer token if available
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Backend wraps responses in { message, data } format
      if (result && typeof result === 'object' && 'data' in result) {
        return result.data as T;
      }

      return result as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // User endpoints
  static async getUser(userId: string): Promise<User | null> {
    try {
      // Backend endpoint: GET /v1/admin/users/:id (no auth required)
      const user = await this.request<BackendUser>(`/admin/users/${userId}`);
      return transformBackendUser(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    try {
      // Backend endpoint: GET /v1/admin/users?search=query (no auth required)
      interface UserSearchResponse {
        users: BackendUser[];
        total: number;
        page: number;
        limit: number;
      }
      const response = await this.request<UserSearchResponse>(
        `/admin/users?search=${encodeURIComponent(query)}&limit=10`
      );
      return (response.users || []).map(transformBackendUser);
    } catch (error) {
      console.error("Failed to search users:", error);
      return [];
    }
  }

  static async updateUser(userId: string, data: Partial<User>): Promise<User> {
    // Backend endpoint: PATCH /v1/users/:id
    // Accepts: { firstName, lastName, email, phone, language, profileImage }
    const updateData = {
      firstName: data.name?.split(' ')[0],
      lastName: data.name?.split(' ').slice(1).join(' '),
      email: data.email,
      phone: data.phone,
      language: (data as any).language,
      profileImage: data.avatar,
    };

    return await this.request<User>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  // Vendor/Retailer endpoints
  static async getVendor(vendorId: string): Promise<Retailer | null> {
    try {
      // Backend endpoint: GET /v1/admin/vendors/:vendorId (no auth required)
      const vendor = await this.request<BackendVendor>(`/admin/vendors/${vendorId}`);
      return transformVendorToRetailer(vendor);
    } catch (error) {
      console.error("Failed to fetch vendor:", error);
      return null;
    }
  }

  static async searchVendors(query: string): Promise<Retailer[]> {
    try {
      // Backend endpoint: GET /v1/admin/vendors?name=query (no auth required)
      interface VendorListResponse {
        data: BackendVendor[];  // Backend returns 'data' not 'vendors'
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }
      const response = await this.request<VendorListResponse>(
        `/admin/vendors?name=${encodeURIComponent(query)}&limit=10`
      );

      return (response.data || []).map(transformVendorToRetailer);
    } catch (error) {
      console.error("Failed to search vendors:", error);
      return [];
    }
  }

  static async updateVendor(vendorId: string, data: Partial<Retailer>): Promise<Retailer> {
    // Backend endpoint: PATCH /v1/vendors/:vendorId
    // Transform frontend Retailer fields to backend Vendor fields
    const backendData: any = {};

    if (data.name) backendData.storeName = data.name;
    if (data.email) backendData.email = data.email;
    if (data.phone) backendData.phone = data.phone;
    if (data.avatar) backendData.logo = data.avatar;
    if (data.address) backendData.address = data.address;
    if (data.category) backendData.vendorCategory = data.category;
    if (data.status) backendData.isOnline = data.status === 'active';

    const updated = await this.request<BackendVendor>(`/vendors/${vendorId}`, {
      method: "PATCH",
      body: JSON.stringify(backendData),
    });

    return transformVendorToRetailer(updated);
  }

  // Courier endpoints - These don't exist in the backend yet
  // You'll need to create these endpoints in the backend
  static async getCourier(courierId: string): Promise<Courier | null> {
    try {
      return await this.request<Courier>(`/couriers/${courierId}`);
    } catch (error) {
      console.error("Failed to fetch courier:", error);
      return null;
    }
  }

  static async searchCouriers(query: string): Promise<Courier[]> {
    try {
      const response = await this.request<Courier[]>(
        `/couriers?search=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error("Failed to search couriers:", error);
      return [];
    }
  }

  static async updateCourier(courierId: string, data: Partial<Courier>): Promise<Courier> {
    return await this.request<Courier>(`/couriers/${courierId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Autocomplete/suggestions - These endpoints don't exist yet
  static async getSuggestions(query: string, type: "user" | "retail" | "courier"): Promise<string[]> {
    try {
      const endpoint = type === "retail" ? "vendors" : type === "courier" ? "couriers" : "users";
      const response = await this.request<{ suggestions: string[] }>(
        `/${endpoint}/suggestions?q=${encodeURIComponent(query)}`
      );
      return response.suggestions || [];
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      return [];
    }
  }
}
