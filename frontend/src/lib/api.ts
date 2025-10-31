// frontend/src/lib/api.ts
type Json = Record<string, unknown> | unknown[] | string | number | null;

const API_BASE = import.meta.env.VITE_API_BASE_URL; // keep at module scope

export function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // ensure endpoint has a leading slash
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // make sure headers are all strings (avoid TS undefined types)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    // Optional global handler:
    // clearAuth();
    // window.location.assign("/login");
    throw new Error("Unauthorized");
  }

  // Try to parse JSON if present; fall back to text
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? ((await res.json()) as T) : ((await res.text()) as unknown as T);

  if (!res.ok) {
    const msg = (typeof body === "object" && body && (body as any).message) || (typeof body === "string" ? body : `Request failed (${res.status})`);
    throw new Error(msg);
  }

  return body;
}

// Convenience helpers (nice DX)
export const apiGet = <T = any>(endpoint: string, init?: RequestInit) => apiFetch<T>(endpoint, { method: "GET", ...(init || {}) });

export const apiPost = <T = any>(endpoint: string, json?: Json, init?: RequestInit) =>
  apiFetch<T>(endpoint, {
    method: "POST",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...(init || {}),
  });

export const apiDelete = <T = any>(endpoint: string, json?: Json, init?: RequestInit) =>
  apiFetch<T>(endpoint, {
    method: "DELETE",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...(init || {}),
  });
