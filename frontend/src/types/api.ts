/**
 * API Types - Matching backend response structure
 */

/**
 * Item type (nested in shops and standalone)
 */
export interface Item {
  id: string;
  name: string;
  price: string;  // Format: "$25"
}

/**
 * Shop type (with nested items)
 */
export interface Shop {
  id: string;
  name: string;
  details: string;
  address: string;
  contact_number: string;
  operating_hours: string;
  items: Item[];
}

/**
 * Review type
 */
export interface Review {
  id: string;
  itemId: string;
  rating: number;  // 1-5
  comment: string;
}

/**
 * API Error type
 */
export interface ApiError {
  error: string;
  message?: string;
}
