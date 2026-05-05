import { getToken } from "@/lib/auth";

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
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
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? err.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
