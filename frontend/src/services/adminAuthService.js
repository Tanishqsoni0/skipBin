// services/adminAuthService.js
// Handles all admin auth API calls and token storage.
// Uses separate localStorage keys from customer auth so they never clash.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── token helpers ─────────────────────────────────────────────────────────────

export function getAdminToken() {
  return localStorage.getItem("jb_admin_token");
}

function saveAdminTokens(access, refresh) {
  localStorage.setItem("jb_admin_token", access);
  if (refresh) localStorage.setItem("jb_admin_refresh_token", refresh);
}

export function clearAdminTokens() {
  localStorage.removeItem("jb_admin_token");
  localStorage.removeItem("jb_admin_refresh_token");
  localStorage.removeItem("jb_admin");
}

export function saveAdminProfile(admin) {
  localStorage.setItem("jb_admin", JSON.stringify(admin));
}

export function getStoredAdmin() {
  try {
    const raw = localStorage.getItem("jb_admin");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn() {
  return !!getAdminToken();
}

// ── API wrapper ───────────────────────────────────────────────────────────────

async function adminFetch(path, options = {}) {
  const token = getAdminToken();
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

// ── auth calls ────────────────────────────────────────────────────────────────

/**
 * Log in as admin.
 * @param {string} username
 * @param {string} password
 * @returns {{ success, admin, error }}
 */
export async function adminLogin(username, password) {
  const { ok, data } = await adminFetch("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (ok) {
    saveAdminTokens(data.access_token, data.refresh_token);
    saveAdminProfile(data.admin);
    return { success: true, admin: data.admin };
  }
  return { success: false, error: data.error || "Login failed" };
}

/**
 * Fetch the logged-in admin's profile from server.
 * @returns {{ success, admin, error }}
 */
export async function fetchAdminMe() {
  const { ok, data } = await adminFetch("/api/admin/me");
  if (ok) {
    saveAdminProfile(data.admin);
    return { success: true, admin: data.admin };
  }
  return { success: false, error: data.error };
}

/**
 * Log out admin — clears tokens.
 */
export function adminLogout() {
  clearAdminTokens();
}

/**
 * Create a new staff account (super_admin only).
 * @param {{ name, username, password, role }} fields
 */
export async function createStaff(fields) {
  const { ok, data } = await adminFetch("/api/admin/create-staff", {
    method: "POST",
    body: JSON.stringify(fields),
  });
  return ok
    ? { success: true, admin: data.admin }
    : { success: false, error: data.error };
}

/**
 * List all admin accounts (super_admin only).
 */
export async function listAdmins() {
  const { ok, data } = await adminFetch("/api/admin/list");
  return ok
    ? { success: true, admins: data.admins }
    : { success: false, error: data.error };
}

/**
 * Deactivate a staff account (super_admin only).
 * @param {number} adminId
 */
export async function deactivateAdmin(adminId) {
  const { ok, data } = await adminFetch(`/api/admin/${adminId}/deactivate`, {
    method: "PATCH",
  });
  return ok
    ? { success: true }
    : { success: false, error: data.error };
}
