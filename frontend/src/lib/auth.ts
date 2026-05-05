export { type UserPublic } from "./types";
import { UserPublic } from "./types";

const TOKEN_KEY = "giglink_token";
const USER_KEY = "giglink_user";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserPublic["role"];
};

export function saveToken(token: string, user?: UserPublic) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    saveUser(user);
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveUser(user: UserPublic) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): UserPublic | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export const getStoredUser = getUser;

export async function validateSession(): Promise<UserPublic | null> {
  // In a real app, this would call the API to verify the token.
  // For now, we trust the local storage.
  const token = getToken();
  const user = getUser();
  if (!token || !user) return null;
  return user;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(email: string, password: string) {
  // This is a placeholder. Real login happens via apiFetch.
  // This is just to satisfy imports.
  console.log("loginUser called", email, password);
}

export async function registerUser(data: RegisterPayload) {
  // This is a placeholder.
  console.log("registerUser called", data);
}
