// Clean search service for the STREET admin portal
import type { User, Retailer, Courier, ReferralCode, EntityType, SearchResult } from "@/types";
import { mockUsers, mockRetailers, mockCouriers, mockReferralCodes } from "@/data/mockData";
import { ApiService } from "./api";

// Toggle between mock and real API
// Default to real API in production, mock in dev (unless explicitly set)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

export class SearchService {
  static async search(query: string, type: EntityType): Promise<SearchResult | null> {
    const normalizedQuery = query.toLowerCase().trim();

    switch (type) {
      case "user":
        return await this.searchUsers(normalizedQuery);
      case "retail":
        return await this.searchRetailers(normalizedQuery);
      case "courier":
        return await this.searchCouriers(normalizedQuery);
      case "settings":
        return { type: "settings" };
      default:
        return null;
    }
  }

  private static async searchUsers(query: string): Promise<SearchResult | null> {
    if (USE_MOCK_DATA) {
      const user = mockUsers.find(user =>
        this.matchesEntity(user, query)
      );
      return user ? { data: user, type: "user" } : null;
    }

    // Try to search users from API
    const users = await ApiService.searchUsers(query);
    if (users && users.length > 0) {
      return { data: users[0], type: "user" };
    }

    // If search returns nothing, try to get by ID if query looks like a UUID
    if (query.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const user = await ApiService.getUser(query);
      return user ? { data: user, type: "user" } : null;
    }

    return null;
  }

  private static async searchRetailers(query: string): Promise<SearchResult | null> {
    if (USE_MOCK_DATA) {
      const retailer = mockRetailers.find(retailer =>
        this.matchesEntity(retailer, query)
      );
      return retailer ? { data: retailer, type: "retail" } : null;
    }

    // Try to search vendors from API
    const vendors = await ApiService.searchVendors(query);

    if (vendors && vendors.length > 0) {
      return { data: vendors[0], type: "retail" };
    }

    // If search returns nothing, try to get by ID if query looks like a UUID
    if (query.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const vendor = await ApiService.getVendor(query);
      return vendor ? { data: vendor, type: "retail" } : null;
    }

    return null;
  }

  private static async searchCouriers(query: string): Promise<SearchResult | null> {
    if (USE_MOCK_DATA) {
      const courier = mockCouriers.find(courier =>
        this.matchesEntity(courier, query)
      );
      return courier ? { data: courier, type: "courier" } : null;
    }

    // Try to search couriers from API
    const couriers = await ApiService.searchCouriers(query);
    if (couriers && couriers.length > 0) {
      return { data: couriers[0], type: "courier" };
    }

    // If search returns nothing, try to get by ID if query looks like a UUID
    if (query.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const courier = await ApiService.getCourier(query);
      return courier ? { data: courier, type: "courier" } : null;
    }

    return null;
  }

  private static async searchReferralCodes(query: string): Promise<SearchResult | null> {
    if (USE_MOCK_DATA) {
      // For referral codes, return all codes by default, filter if query provided
      const filteredCodes = query ? mockReferralCodes.filter(code =>
        code.code.toLowerCase().includes(query) ||
        code.userName.toLowerCase().includes(query) ||
        code.userEmail.toLowerCase().includes(query)
      ) : mockReferralCodes;

      return { data: filteredCodes, type: "referralcode" };
    }

    // Fetch all referral codes from API
    const allCodes = await ApiService.getAllReferralCodes();

    // Filter locally if query provided
    const filteredCodes = query ? allCodes.filter(code =>
      code.code.toLowerCase().includes(query) ||
      code.userName.toLowerCase().includes(query) ||
      code.userEmail.toLowerCase().includes(query) ||
      code.userId.toLowerCase().includes(query)
    ) : allCodes;

    return { data: filteredCodes, type: "referralcode" };
  }

  private static matchesEntity(entity: User | Retailer | Courier, query: string): boolean {
    return (
      entity.name.toLowerCase().includes(query) ||
      entity.email.toLowerCase().includes(query) ||
      entity.phone.includes(query) ||
      entity.id.toLowerCase().includes(query) ||
      entity.uid.toLowerCase().includes(query)
    );
  }

  static async getSuggestions(query: string, type: EntityType): Promise<string[]> {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) return [];

    // For referral codes, use local suggestions
    if (type === "referralcode") {
      return this.getReferralCodeSuggestions(normalizedQuery);
    }

    // TODO: Backend doesn't have suggestions endpoint yet, so disable for now
    // Just return empty array - users can still use search button
    if (!USE_MOCK_DATA) {
      return []; // Disable suggestions when using real API
    }

    // Fall back to mock data suggestions
    let entities: (User | Retailer | Courier)[] = [];

    switch (type) {
      case "user":
        entities = mockUsers;
        break;
      case "retail":
        entities = mockRetailers;
        break;
      case "courier":
        entities = mockCouriers;
        break;
    }

    const suggestions: string[] = [];

    entities.forEach(entity => {
      if (entity.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.push(entity.name);
      }
      if (entity.email.toLowerCase().includes(normalizedQuery)) {
        suggestions.push(entity.email);
      }
      if (entity.phone.includes(normalizedQuery)) {
        suggestions.push(entity.phone);
      }
      if (entity.id.toLowerCase().includes(normalizedQuery)) {
        suggestions.push(entity.id);
      }
      if (entity.uid.toLowerCase().includes(normalizedQuery)) {
        suggestions.push(entity.uid);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }

  private static getReferralCodeSuggestions(query: string): string[] {
    const suggestions: string[] = [];

    mockReferralCodes.forEach(code => {
      if (code.code.toLowerCase().includes(query)) {
        suggestions.push(code.code);
      }
      if (code.userName.toLowerCase().includes(query)) {
        suggestions.push(code.userName);
      }
      if (code.userEmail.toLowerCase().includes(query)) {
        suggestions.push(code.userEmail);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}