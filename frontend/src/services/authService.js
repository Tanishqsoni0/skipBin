// services/authService.js
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── token helpers ─────────────────────────────────────────────────────────────

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

// ── API call wrapper ──────────────────────────────────────────────────────────

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

// ── fetchMe cache + deduplication ────────────────────────────────────────────
// Problem: Navbar, BookingWebsite, and other components all call fetchMe()
// on mount at the same time — flooding the backend with simultaneous requests.
//
// Solution:
//   1. Deduplication  — if a fetchMe() is already in flight, all other callers
//      wait for that same promise instead of making new requests.
//   2. Cache (30s TTL) — after a successful fetch, return the cached result
//      for the next 30 seconds without hitting the server again.
//   3. invalidateMeCache() — call this after login, logout, or booking so the
//      next fetchMe() gets fresh data from the server.

let _meCache = null; // { result, timestamp }
let _meInFlight = null; // Promise | null
const ME_TTL_MS = 30000; // 30 seconds

export function invalidateMeCache() {
  _meCache = null;
  _meInFlight = null;
}

export async function fetchMe() {
  // 1 — Return cache if still fresh
  if (_meCache && Date.now() - _meCache.timestamp < ME_TTL_MS) {
    return _meCache.result;
  }

  // 2 — If a request is already in flight, wait for it instead of firing another
  if (_meInFlight) {
    return _meInFlight;
  }

  // 3 — Fire a new request and share the promise with any concurrent callers
  _meInFlight = apiFetch("/api/auth/me")
    .then(({ ok, data }) => {
      _meInFlight = null; // clear in-flight flag when done

      if (ok) {
        saveCustomer(data.customer);
        const result = {
          success: true,
          customer: data.customer,
          loyalty: data.loyalty,
        };
        // Store in cache
        _meCache = { result, timestamp: Date.now() };
        return result;
      }

      // Failed — don't cache errors
      _meCache = null;
      return { success: false, error: data.error || "Could not fetch profile" };
    })
    .catch(() => {
      _meInFlight = null;
      _meCache = null;
      return { success: false, error: "Network error" };
    });

  return _meInFlight;
}

// ── auth calls ────────────────────────────────────────────────────────────────

export async function register(fields) {
  const { ok, data } = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(fields),
  });

  if (ok) {
    saveTokens(data.access_token, data.refresh_token);
    saveCustomer(data.customer);
    invalidateMeCache(); // force fresh fetch on next call
    return { success: true, customer: data.customer };
  }
  return { success: false, error: data.error || "Registration failed" };
}

export async function login(email, password) {
  const { ok, data } = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (ok) {
    saveTokens(data.access_token, data.refresh_token);
    saveCustomer(data.customer);
    invalidateMeCache(); // force fresh fetch on next call
    return { success: true, customer: data.customer };
  }
  return { success: false, error: data.error || "Login failed" };
}

export async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  clearTokens();
  invalidateMeCache(); // clear cache on logout
}
