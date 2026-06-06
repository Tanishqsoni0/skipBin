// services/authService.js
// Central place for all auth API calls.
// Import this wherever you need login / register / profile data.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── token helpers ────────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem("jb_access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("jb_refresh_token");
}

function saveTokens(access, refresh) {
  localStorage.setItem("jb_access_token", access);
  if (refresh) localStorage.setItem("jb_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("jb_access_token");
  localStorage.removeItem("jb_refresh_token");
  localStorage.removeItem("jb_customer");
}

export function saveCustomer(customer) {
  localStorage.setItem("jb_customer", JSON.stringify(customer));
}

export function getStoredCustomer() {
  try {
    const raw = localStorage.getItem("jb_customer");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAccessToken();
}

// ── API call wrapper ─────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ── auth calls ───────────────────────────────────────────────────────────────

/**
 * Register a new customer account.
 * @param {object} fields - { first_name, last_name, email, mobile, password, account_type, business_name? }
 * @returns {{ success, customer, error }}
 */
export async function register(fields) {
  const { ok, data } = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(fields),
  });

  if (ok) {
    saveTokens(data.access_token, data.refresh_token);
    saveCustomer(data.customer);
    return { success: true, customer: data.customer };
  }
  return { success: false, error: data.error || "Registration failed" };
}

/**
 * Log in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {{ success, customer, error }}
 */
export async function login(email, password) {
  const { ok, data } = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (ok) {
    saveTokens(data.access_token, data.refresh_token);
    saveCustomer(data.customer);
    return { success: true, customer: data.customer };
  }
  return { success: false, error: data.error || "Login failed" };
}

/**
 * Fetch the logged-in user's profile + loyalty progress from the server.
 * Call this on page load to get fresh data.
 * @returns {{ success, customer, loyalty, error }}
 */
export async function fetchMe() {
  const { ok, data } = await apiFetch("/api/auth/me");
  if (ok) {
    saveCustomer(data.customer);
    return { success: true, customer: data.customer, loyalty: data.loyalty };
  }
  return { success: false, error: data.error || "Could not fetch profile" };
}

/**
 * Log out — clears local tokens and tells the server.
 */
export async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  clearTokens();
}
