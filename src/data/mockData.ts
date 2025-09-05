// Clean mock data for development and demo purposes
import type { User, Retailer, Courier, Order, Invoice } from "@/types";
import syuzanaImage from "@/assets/syuzana-real.png";
import aliImage from "@/assets/ali-real.png";
import trilogyImage from "@/assets/trilogy.png";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "USR001",
    name: "Syuzana O",
    email: "syuzana@street.london", 
    phone: "+447542016022",
    avatar: syuzanaImage,
    status: "active",
    joinDate: "2024-01-15",
    totalOrders: 47,
    totalSpent: 2840.50,
    deviceId: "DEV_iPhone_15_Pro_Max_001",
    uid: "uid_syuzana_001_2024"
  },
  {
    id: "USR002",
    name: "Ali Al Nasiri",
    email: "ali@street.london",
    phone: "+447770237011", 
    avatar: aliImage,
    status: "active",
    joinDate: "2024-02-20",
    totalOrders: 23,
    totalSpent: 1450.75,
    deviceId: "DEV_Samsung_Galaxy_S24_001",
    uid: "uid_ali_002_2024"
  }
];

// Mock Retailers
export const mockRetailers: Retailer[] = [
  {
    id: "RET001",
    name: "Trilogy London",
    email: "info@trilogylondon.com",
    phone: "020 7937 7972",
    avatar: trilogyImage,
    status: "active", 
    joinDate: "2023-08-20",
    totalOrders: 234,
    totalRevenue: 15680.75,
    deviceId: "DEV_iPad_Pro_Retail_001",
    uid: "uid_trilogy_ret_001_2023",
    address: "22 Kensington Church St, London W8 4EP",
    contact: "Lee",
    category: "Clothing",
    pocManager: "Sarah Johnson",
    signedUpBy: "Umaan Ali", 
    posSystem: "Shopify",
    commissionRate: "10%",
    owner: "John Doe"
  }
];

// Mock Couriers
export const mockCouriers: Courier[] = [
  {
    id: "COU001",
    name: "Ali Al Nasiri",
    email: "ali@street.london",
    phone: "+447770237011",
    avatar: aliImage,
    status: "online",
    joinDate: "2024-03-10", 
    totalDeliveries: 156,  
    averageRating: 4.8,
    deviceId: "DEV_Samsung_Galaxy_Courier_001",
    uid: "uid_ali_cou_001_2024"
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    amount: 45.99,
    location: "Covent Garden, London",
    dateTime: "2024-09-05T10:30:00Z",
    status: "delivered",
    rating: 5,
    items: ["Black T-Shirt", "Blue Jeans", "White Sneakers"]
  },
  {
    id: "ORD-002", 
    amount: 28.50,
    location: "Oxford Street, London",
    dateTime: "2024-09-04T15:45:00Z",
    status: "delivered",
    rating: 4,
    items: ["Red Lipstick", "Foundation"]
  },
  {
    id: "ORD-003",
    amount: 62.75,
    location: "Canary Wharf, London",
    dateTime: "2024-09-03T12:20:00Z", 
    status: "completed",
    rating: 5,
    items: ["Kids Dress", "Leather Boots", "Silver Necklace"]
  }
];

// Mock Invoices  
export const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    amount: 1250.00,
    paidAmount: 1250.00,
    dateTime: "2024-09-05T09:00:00Z",
    status: "paid",
    description: "Monthly commission payout"
  },
  {
    id: "INV-002", 
    amount: 850.75,
    paidAmount: 425.38,
    dateTime: "2024-09-04T14:30:00Z",
    status: "partial",
    description: "Weekly order commissions"
  },
  {
    id: "INV-003",
    amount: 2100.50,
    paidAmount: 0,
    dateTime: "2024-09-03T11:15:00Z",
    status: "pending",
    description: "Bi-weekly settlement"
  }
];