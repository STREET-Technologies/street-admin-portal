// Clean search service for the STREET admin portal
import type { User, Retailer, Courier, ReferralCode, EntityType, SearchResult } from "@/types";
import { mockUsers, mockRetailers, mockCouriers, mockReferralCodes } from "@/data/mockData";

export class SearchService {
  static search(query: string, type: EntityType): SearchResult | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    switch (type) {
      case "user":
        return this.searchUsers(normalizedQuery);
      case "retail":  
        return this.searchRetailers(normalizedQuery);
      case "courier":
        return this.searchCouriers(normalizedQuery);
      case "referralcode":
        return this.searchReferralCodes(normalizedQuery);
      default:
        return null;
    }
  }

  private static searchUsers(query: string): SearchResult | null {
    const user = mockUsers.find(user => 
      this.matchesEntity(user, query)
    );
    
    return user ? { data: user, type: "user" } : null;
  }

  private static searchRetailers(query: string): SearchResult | null {
    const retailer = mockRetailers.find(retailer =>
      this.matchesEntity(retailer, query)
    );
    
    return retailer ? { data: retailer, type: "retail" } : null;
  }

  private static searchCouriers(query: string): SearchResult | null {
    const courier = mockCouriers.find(courier =>
      this.matchesEntity(courier, query)
    );
    
    return courier ? { data: courier, type: "courier" } : null;
  }

  private static searchReferralCodes(query: string): SearchResult | null {
    // For referral codes, return all codes by default, filter if query provided
    const filteredCodes = query ? mockReferralCodes.filter(code =>
      code.code.toLowerCase().includes(query) ||
      code.createdBy.toLowerCase().includes(query) ||
      code.belongsTo.toLowerCase().includes(query) ||
      (code.usedBy && code.usedBy.toLowerCase().includes(query))
    ) : mockReferralCodes;
    
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

  static getSuggestions(query: string, type: EntityType): string[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) return [];

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
      case "referralcode":
        // For referral codes, return code suggestions differently
        return this.getReferralCodeSuggestions(normalizedQuery);
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
      if (code.createdBy.toLowerCase().includes(query)) {
        suggestions.push(code.createdBy);
      }
      if (code.belongsTo.toLowerCase().includes(query)) {
        suggestions.push(code.belongsTo);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  }
}