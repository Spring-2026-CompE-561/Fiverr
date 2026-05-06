const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type UserPublic = {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
  bio: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.error || "Registration failed");
  }
  const json = await res.json();
  if (json.token) saveToken(json.token);
  if (json.user) saveUser(json.user);
  return json;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.error || "Login failed");
  }
  const data = await res.json();
  const token = data.token || data.access_token;
  if (token) saveToken(token);
  if (data.user) saveUser(data.user);
  return { ...data, access_token: token };
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function saveUser(user: UserPublic) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getStoredUser(): UserPublic | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as UserPublic) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function validateSession(): Promise<UserPublic | null> {
  const token = getToken();
  if (!token) return null;
  const user = getStoredUser();
  return user;
}
