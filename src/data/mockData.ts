// Clean mock data for development and demo purposes
import type { User, Retailer, Courier, Order, Invoice, ReferralCode } from "@/types";
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

// Mock Referral Codes
export const mockReferralCodes: ReferralCode[] = [
  {
    id: "REF-001",
    code: "ANNIE20",
    status: "active",
    expiryDate: "2024-12-31",
    creditAmount: 20,
    createdBy: "Ali Al Nasiri",
    belongsTo: "Annie Smith",
    createdDate: "2024-09-01T10:00:00Z"
  },
  {
    id: "REF-002",
    code: "WELCOME10",
    status: "used",
    expiryDate: "2024-11-30",
    creditAmount: 10,
    createdBy: "Syuzana O",
    belongsTo: "New Users",
    usedBy: "John Doe",
    usedDate: "2024-09-05T14:30:00Z",
    createdDate: "2024-08-15T09:00:00Z"
  },
  {
    id: "REF-003",
    code: "FREEDELIVERY5",
    status: "expired",
    expiryDate: "2024-09-01",
    freeDeliveries: 5,
    createdBy: "Umaan Ali",
    belongsTo: "VIP Customers",
    usedBy: "Sarah Johnson",
    usedDate: "2024-08-28T16:45:00Z",
    createdDate: "2024-07-01T12:00:00Z"
  },
  {
    id: "REF-004",
    code: "STUDENT15",
    status: "active",
    expiryDate: "2024-12-31",
    creditAmount: 15,
    createdBy: "Ali Al Nasiri",
    belongsTo: "Students",
    createdDate: "2024-09-03T11:30:00Z"
  },
  {
    id: "REF-005",
    code: "TRILOGY25",
    status: "used",
    expiryDate: "2024-10-31",
    creditAmount: 25,
    createdBy: "Syuzana O",
    belongsTo: "Trilogy Customers",
    usedBy: "Mike Wilson",
    usedDate: "2024-09-02T13:20:00Z",
    createdDate: "2024-08-20T15:00:00Z"
  },
  {
    id: "REF-006",
    code: "SUMMER30",
    status: "active",
    expiryDate: "2024-10-15",
    creditAmount: 30,
    createdBy: "Umaan Ali",
    belongsTo: "Summer Promo",
    createdDate: "2024-08-01T09:00:00Z"
  },
  {
    id: "REF-007",
    code: "BIRTHDAY50",
    status: "disabled",
    expiryDate: "2024-12-25",
    creditAmount: 50,
    createdBy: "Ali Al Nasiri",
    belongsTo: "Birthday Special",
    createdDate: "2024-07-15T12:00:00Z"
  },
  {
    id: "REF-008",
    code: "FASTTRACK",
    status: "active",
    expiryDate: "2025-01-31",
    freeDeliveries: 10,
    createdBy: "Syuzana O",
    belongsTo: "Premium Users",
    createdDate: "2024-09-07T16:30:00Z"
  },
  {
    id: "REF-009",
    code: "LOYALTY100",
    status: "used",
    expiryDate: "2024-11-15",
    creditAmount: 100,
    createdBy: "Umaan Ali",
    belongsTo: "Emma Thompson",
    usedBy: "Emma Thompson",
    usedDate: "2024-09-06T11:45:00Z",
    createdDate: "2024-08-10T14:20:00Z"
  },
  {
    id: "REF-010",
    code: "NEWBIE5",
    status: "expired",
    expiryDate: "2024-08-31",
    freeDeliveries: 3,
    createdBy: "Ali Al Nasiri",
    belongsTo: "First Time Users",
    createdDate: "2024-07-01T10:00:00Z"
  }
];