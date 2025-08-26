// Constants used across the application

// Protected jewel types that should not be deleted (only modified)
export const PROTECTED_JEWEL_TYPE_CODES = [
  "GOLD22K",
  "GOLD18K", 
  "SILVER",
  "DIAMOND"
];

// Protected product categories related to the protected jewel types
export const PROTECTED_CATEGORY_CODES = [
  "CAT-GOLD22K",
  "CAT-GOLD18K",
  "CAT-SILVER",
  "CAT-DIAMOND",
  // Include platinum to prevent accidental deletion of base category
  "CAT-PLATINUM"
];
