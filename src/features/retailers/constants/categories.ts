/**
 * Vendor (retailer) business categories.
 *
 * Mirrors the hardcoded list in street-vendor-portal's
 * lib/validations/vendor.ts. Keep these in sync if either side adds or
 * renames a category.
 *
 * The backend accepts vendorCategory as a free-string column, so this
 * list is the source of truth for which values are considered valid.
 */
export const VENDOR_CATEGORIES = [
  "Fashion",
  "Streetwear",
  "Footwear",
  "Activewear",
  "Jewellery",
  "Beauty",
  "Home & Living",
  "Health & Wellness",
  "Kids & Babywear",
  "Other",
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];
