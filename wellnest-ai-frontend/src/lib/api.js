const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4100/api";
const TOKEN_KEY = "wellnest_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent("wellnest:auth-expired"));
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  return payload?.data;
}

export const authApi = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
};

export const usersApi = {
  getMe: () => request("/users/me"),
  updateMe: (payload) => request("/users/me", { method: "PATCH", body: payload }),
  getVitals: () => request("/users/me/vitals"),
  getPreferences: () => request("/users/me/preferences"),
  updatePreferences: (payload) => request("/users/me/preferences", { method: "PATCH", body: payload }),
};

export const documentsApi = {
  list: () => request("/documents"),
  upload: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    return request("/documents", { method: "POST", body: formData, isFormData: true });
  },
};

export const medicationsApi = {
  getSchedule: () => request("/medications"),
  getWeekAdherence: () => request("/medications/adherence/week"),
  toggleBlockActive: (blockId) => request(`/medications/blocks/${blockId}/active`, { method: "PATCH" }),
  toggleItemTaken: (itemId) => request(`/medications/items/${itemId}/taken`, { method: "PATCH", body: {} }),
};

export const chatApi = {
  getHistory: () => request("/chat/messages"),
  sendMessage: (text) => request("/chat/messages", { method: "POST", body: { text } }),
  getQuickPrompts: () => request("/chat/quick-prompts"),
};

export const familyApi = {
  list: () => request("/family"),
  invite: (email) => request("/family/invite", { method: "POST", body: { email } }),
};

export const timelineApi = {
  getTimeline: () => request("/timeline"),
  getRecentActivity: (limit) => request(`/activity/recent${limit ? `?limit=${limit}` : ""}`),
};

export const emergencyApi = {
  getWallet: () => request("/emergency"),
};
