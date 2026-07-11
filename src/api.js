const API_BASE = '/api';

let currentToken = null;

export function setAuthToken(token) {
  currentToken = token;
}

/**
 * Shared fetch wrapper — returns parsed JSON or throws with a useful message.
 */
async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) {
      window.dispatchEvent(new Event('unauthorized'));
      throw new Error(`Unauthorized (${res.status}): Please log in again.`);
    }
    throw new Error(text || `Request failed (${res.status})`);
  }

  // Some endpoints return a plain integer (e.g. wait-time)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // Try parsing as a number first, fallback to text
  const raw = await res.text();
  const num = Number(raw);
  return Number.isNaN(num) ? raw : num;
}

/* ── Hospitals ── */
export function fetchHospitals(city = '') {
  const qs = city ? `?city=${encodeURIComponent(city)}` : '';
  return request(`/hospitals${qs}`);
}

/* ── Departments ── */
export function fetchDepartments(hospitalId) {
  return request(`/departments/hospital/${hospitalId}`);
}

/* ── Tokens ── */
export function createToken(departmentId, { patientName, emergency }) {
  return request(`/departments/${departmentId}/tokens`, {
    method: 'POST',
    body: JSON.stringify({ patientName, emergency }),
  });
}

export function callNext(departmentId) {
  return request(`/departments/${departmentId}/next`, { method: 'PUT' });
}

export function markComplete(tokenId) {
  return request(`/tokens/${tokenId}/complete`, { method: 'PUT' });
}

export function fetchWaitTime(tokenId) {
  return request(`/tokens/${tokenId}/wait-time`);
}

export function fetchMyTokens() {
  return request(`/tokens/my`);
}

/* ── Auth ── */
export function login(credentials) {
  return request(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function register(data) {
  return request(`/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
