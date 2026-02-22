const API = "http://127.0.0.1:8000/api";

export function getToken() {
  return localStorage.getItem("paylink_token") || "";
}

export function setToken(token) {
  localStorage.setItem("paylink_token", token);
}

export function clearToken() {
  localStorage.removeItem("paylink_token");
}

export async function apiFetch(path, { method = "GET", body, token, headers } = {}) {
  const finalHeaders = {
    ...(headers || {}),
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}