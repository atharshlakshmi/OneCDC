import type { Shop, Item, Review } from '../types/api';

/**
 * API Service for OneCDC Backend
 * Centralizes all API calls to the Express backend
 */

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Service Class
 * Provides methods for all backend endpoints
 */
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request handler with error handling
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      console.log(`[API] ${options?.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      console.log(`[API] Success:`, data);

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      console.error('[API] Request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        undefined,
        error
      );
    }
  }

  /**
   * GET request helper
   */
  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  private post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  private put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // =====================================================
  // SHOP ENDPOINTS
  // =====================================================

  /**
   * Get all shops
   * @returns Array of shops with their items
   */
  async getAllShops(): Promise<Shop[]> {
    return this.get<Shop[]>('/shops');
  }

  /**
   * Get a single shop by ID
   * @param id - Shop ID
   * @returns Shop details with items
   */
  async getShop(id: string): Promise<Shop> {
    return this.get<Shop>(`/shops/${id}`);
  }

  // =====================================================
  // ITEM ENDPOINTS
  // =====================================================

  /**
   * Get all items (flat list across all shops)
   * @returns Array of items
   */
  async getAllItems(): Promise<Item[]> {
    return this.get<Item[]>('/items');
  }

  /**
   * Get a single item by ID
   * @param id - Item ID
   * @returns Item details
   */
  async getItem(id: string): Promise<Item> {
    return this.get<Item>(`/items/${id}`);
  }

  /**
   * Get reviews for a specific item
   * @param itemId - Item ID
   * @returns Array of reviews
   */
  async getItemReviews(itemId: string): Promise<Review[]> {
    return this.get<Review[]>(`/items/${itemId}/reviews`);
  }

  // =====================================================
  // SEARCH ENDPOINTS (Future)
  // =====================================================

  /**
   * Search shops by query
   * @param query - Search query string
   * @returns Filtered shops
   */
  async searchShops(query: string): Promise<Shop[]> {
    return this.get<Shop[]>(`/shops?search=${encodeURIComponent(query)}`);
  }

  /**
   * Search items by query
   * @param query - Search query string
   * @returns Filtered items
   */
  async searchItems(query: string): Promise<Item[]> {
    return this.get<Item[]>(`/items?search=${encodeURIComponent(query)}`);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    return this.get('/health');
  }

  /**
   * Get the current API base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update the API base URL (useful for switching environments)
   */
  setBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl;
    console.log(`[API] Base URL updated to: ${newUrl}`);
  }
}

// Export singleton instance
export const api = new ApiService();

// Export the class for testing or custom instances
export default ApiService;
