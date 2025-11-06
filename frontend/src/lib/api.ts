// frontend/src/lib/api.ts
type Json = Record<string, unknown> | unknown[] | string | number | null;

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Token utilities (optional if you use cookies)
export function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Main API helper
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
<<<<<<< HEAD

  // Don't set Content-Type for FormData (browser will set it with boundary)
  const headers: Record<string, string> = {
=======
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
>>>>>>> origin/lakshmi
    ...authHeaders(),
    ...(options.headers as Record<string, string>),
  };

<<<<<<< HEAD
  // Only add Content-Type: application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

=======
>>>>>>> origin/lakshmi
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // ✅ include cookies for auth
  });

  // Try parse JSON even on errors
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  // Uniform error handling
  if (!res.ok) {
    const err: any = new Error(data?.message || res.statusText || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data as T;
}

// ✅ Convenience wrappers
export const apiGet = <T = any>(endpoint: string, init?: RequestInit): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "GET",
    ...(init || {}),
  });

export const apiPost = <T = any>(endpoint: string, json?: Json, init?: RequestInit): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "POST",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...(init || {}),
  });

export const apiPut = <T = any>(endpoint: string, json?: Json, init?: RequestInit): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "PUT",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...(init || {}),
  });

export const apiDelete = <T = any>(endpoint: string, init?: RequestInit): Promise<T> =>
  apiFetch<T>(endpoint, {
    method: "DELETE",
    ...(init || {}),
  });
