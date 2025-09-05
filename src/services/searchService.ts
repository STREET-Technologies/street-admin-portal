// Clean search service for the STREET admin portal
import type { User, Retailer, Courier, EntityType, SearchResult } from "@/types";
import { mockUsers, mockRetailers, mockCouriers } from "@/data/mockData";

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
}