import { MockUser } from "./mockAuth";

const KEY = "autobridge_user";

export function setUser(user: MockUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
}

export function logout() {
  localStorage.removeItem(KEY);
  window.location.href = "/";
}