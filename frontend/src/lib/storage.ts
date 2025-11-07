/**
 * Type-safe storage utilities
 * Centralized access to localStorage and sessionStorage
 */

import { STORAGE_KEYS } from "./constants";

/**
 * Generic storage getter with type safety
 */
function getItem<T>(key: string, storage: Storage = localStorage): T | null {
  try {
    const item = storage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

/**
 * Generic storage setter with type safety
 */
function setItem<T>(key: string, value: T, storage: Storage = localStorage): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

/**
 * Remove item from storage
 */
function removeItem(key: string, storage: Storage = localStorage): void {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

/**
 * Clear all items from storage
 */
function clear(storage: Storage = localStorage): void {
  try {
    storage.clear();
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

// Authentication storage utilities
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getUserData: <T = Record<string, unknown>>(): T | null => {
    return getItem<T>(STORAGE_KEYS.USER_DATA);
  },

  setUserData: <T>(userData: T): void => {
    setItem(STORAGE_KEYS.USER_DATA, userData);
  },

  removeUserData: (): void => {
    removeItem(STORAGE_KEYS.USER_DATA);
  },

  clearAll: (): void => {
    authStorage.removeToken();
    authStorage.removeRefreshToken();
    authStorage.removeUserData();
  },
};

// Cart storage utilities
export const cartStorage = {
  getCart: <T = unknown[]>(): T | null => {
    return getItem<T>(STORAGE_KEYS.CART);
  },

  setCart: <T>(cart: T): void => {
    setItem(STORAGE_KEYS.CART, cart);
  },

  clearCart: (): void => {
    removeItem(STORAGE_KEYS.CART);
  },
};

// Generic storage utilities (for custom keys)
export const storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
  clear,
};
