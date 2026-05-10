import { getToken, logout } from "@/lib/auth";

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

function errorBodyToMessage(body: Record<string, unknown>, status: number): string {
  const raw = body.detail ?? body.error;
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as { msg?: string };
    if (typeof first?.msg === "string") {
      return first.msg;
    }
  }
  return `Request failed: ${status}`;
}

type ApiFetchOptions = {
  auth?: boolean;
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, method = "GET", body, headers = {} } = options;

  const reqHeaders: Record<string, string> = { ...headers };

  if (body && !reqHeaders["Content-Type"]) {
    reqHeaders["Content-Type"] = "application/json";
  }

  if (auth !== false) {
    const token = getToken();
    if (token) reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    method,
    headers: reqHeaders,
    body,
  });

  if (!res.ok) {
    // A 401 from an authenticated request means the token is no longer valid.
    if (auth !== false && res.status === 401) {
      logout();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }

    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      throw new Error(text || `Request failed: ${res.status}`);
    }
    throw new Error(errorBodyToMessage(parsed, res.status));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }

  return (await res.text()) as T;
}
