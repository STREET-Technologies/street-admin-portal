// Clean type definitions for the STREET admin portal

export interface BaseEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  joinDate: string;
  deviceId: string;
  uid: string;
}

export interface User extends BaseEntity {
  totalOrders: number;
  totalSpent: number;
  ssoProvider?: string;
}

export interface Retailer extends BaseEntity {
  totalOrders: number;
  totalRevenue: number;
  address: string;
  postcode?: string;
  contact: string;
  category: string;
  pocManager?: string;
  signedUpBy?: string;
  posSystem?: string;
  commissionRate?: string;
  owner?: string;
}

export interface Courier extends BaseEntity {
  totalDeliveries: number;
  averageRating: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: string | number;
  totalPrice: string | number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  totalAmount: string | number;
  subtotal: string | number;
  status: string;
  shippingAddress?: any;
  paymentStatus: string;
  paymentMethod: string;
  stuartJobId?: string | null;
  deliveryDetails?: any;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    storeName: string;
    logo?: string;
  };
  orderItems?: OrderItem[];
}

export interface Invoice {
  id: string;
  amount: number;
  paidAmount: number;
  dateTime: string;
  status: InvoiceStatus;
  description: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  priority: NotePriority;
}

export interface ReferralCode {
  id: string;
  code: string;
  status: ReferralCodeStatus;
  expiryDate: string;
  creditAmount?: number;
  freeDeliveries?: number;
  createdBy: string;
  belongsTo: string;
  usedBy?: string;
  usedDate?: string;
  createdDate: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Status types
export type EntityStatus = "active" | "inactive" | "pending" | "blocked" | "withdrawn" | "onboarding" | "online";
export type OrderStatus = "delivered" | "completed" | "pending" | "cancelled" | "in-progress";
export type InvoiceStatus = "paid" | "partial" | "pending" | "overdue";
export type NotePriority = "low" | "medium" | "high";
export type ReferralCodeStatus = "active" | "expired" | "used" | "disabled";
export type EntityType = "user" | "retail" | "courier" | "referralcode";

// Search types
export interface SearchResult {
  data: User | Retailer | Courier | ReferralCode[];
  type: EntityType;
}