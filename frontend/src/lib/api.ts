// frontend/src/lib/api.ts
import { authStorage } from "./storage";

type Json = Record<string, unknown> | unknown[] | string | number | null;

// Export API_BASE for use in other modules
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Token utilities (optional if you use cookies)
export function getToken() {
  return authStorage.getToken() || "";
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Main API helper
export async function apiFetch<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Don't set Content-Type for FormData (browser will set it with boundary)
  const headers: Record<string, string> = {
    ...authHeaders(),
    ...(options.headers as Record<string, string>),
  };

  // Only add Content-Type: application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // include cookies for auth
  });

  // Try parse JSON even on errors
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  // Uniform error handling
  if (!res.ok) {
    const errorData = data as { message?: string };
    const err = new Error(errorData?.message || res.statusText || `Request failed (${res.status})`);
    (err as Error & { status?: number; payload?: unknown }).status = res.status;
    (err as Error & { status?: number; payload?: unknown }).payload = data;
    throw err;
  }

  return data as T;
}

// Convenience wrappers
export const apiGet = <T = Record<string, unknown>>(
  endpoint: string,
  init?: RequestInit
): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "GET",
    ...(init || {}),
  });

export const apiPost = <T = Record<string, unknown>>(
  endpoint: string,
  json?: Json,
  init?: RequestInit
): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "POST",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...(init || {}),
  });

export const apiPut = <T = Record<string, unknown>>(
  endpoint: string,
  json?: Json,
  init?: RequestInit
): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "PUT",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...(init || {}),
  });

export const apiDelete = <T = Record<string, unknown>>(
  endpoint: string,
  init?: RequestInit
): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "DELETE",
    ...(init || {}),
  });
