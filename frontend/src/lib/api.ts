import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export function getApiBase() {
  return API_BASE_URL;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = getToken();
  const { auth = true, ...fetchOptions } = options;
  const headers = new Headers(options.headers);

  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred");
  }

  return response.json();
}
