// Constants for the STREET admin portal

export const TEAM_MEMBERS = [
  "Ali Al Nasiri",
  "Syuzana Oganesyan", 
  "Umaan Ali"
] as const;

export const POS_SYSTEMS = [
  "Shopify",
  "Square", 
  "Lightspeed",
  "Toast",
  "Clover"
] as const;

export const RETAIL_CATEGORIES = [
  "Fashion",
  "Clothing", 
  "Shoes",
  "Kids Wear",
  "Beauty",
  "Accessories"
] as const;

export const RETAIL_STATUS_OPTIONS = [
  "active",
  "blocked", 
  "withdrawn",
  "onboarding"
] as const;

export const USER_STATUS_OPTIONS = [
  "active",
  "inactive",
  "pending"
] as const;

export const COURIER_STATUS_OPTIONS = [
  "active", 
  "inactive",
  "pending",
  "online"
] as const;

export const ORDER_STATUS_OPTIONS = [
  "delivered",
  "completed", 
  "pending",
  "cancelled",
  "in-progress"
] as const;

export const INVOICE_STATUS_OPTIONS = [
  "paid",
  "partial",
  "pending", 
  "overdue"
] as const;

export const NOTE_PRIORITIES = [
  "low",
  "medium",
  "high"
] as const;