import axios from "axios";
import {
  INITIAL_MOCK_USER,
  INITIAL_MOCK_WORKSPACES,
  INITIAL_MOCK_PROJECTS,
  INITIAL_MOCK_TASKS,
  INITIAL_MOCK_MEMBERS,
  INITIAL_MOCK_INVITATIONS,
  INITIAL_MOCK_DOCUMENTS,
} from "./mockData";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const COLLAB_WS_URL = import.meta.env.VITE_COLLAB_WS_URL || "ws://localhost:1234";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "convergedesk_access_token",
  REFRESH_TOKEN: "convergedesk_refresh_token",
  USER: "convergedesk_user",
  DEMO_MODE: "convergedesk_demo_mode",
  DEMO_STATE: "convergedesk_demo_state",
};

// Demo State persistence in sessionStorage so user interactions feel live and responsive
function getInitialDemoState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEYS.DEMO_STATE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Could not parse saved demo state", e);
  }

  const state = {
    user: INITIAL_MOCK_USER,
    workspaces: [...INITIAL_MOCK_WORKSPACES],
    projects: [...INITIAL_MOCK_PROJECTS],
    tasks: [...INITIAL_MOCK_TASKS],
    members: [...INITIAL_MOCK_MEMBERS],
    invitations: [...INITIAL_MOCK_INVITATIONS],
    documents: [...INITIAL_MOCK_DOCUMENTS],
  };
  saveDemoState(state);
  return state;
}

function saveDemoState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.DEMO_STATE, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save demo state", e);
  }
}

export let demoStore = getInitialDemoState();

export function resetDemoStore() {
  sessionStorage.removeItem(STORAGE_KEYS.DEMO_STATE);
  demoStore = getInitialDemoState();
  return demoStore;
}

export function isDemoMode() {
  return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === "true";
}

export function setDemoMode(enabled) {
  localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("convergedesk:connection-changed"));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/token/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccess = refreshResponse.data.access;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccess);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new CustomEvent("convergedesk:auth-expired"));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to check whether backend is reachable
export async function testBackendConnection() {
  try {
    // Ping workspace list or token endpoint
    await axios.get(`${API_BASE_URL}/workspaces/`, { timeout: 2000 });
    return { online: true };
  } catch (err) {
    if (err.response && [401, 403, 405].includes(err.response.status)) {
      // Backend responded with HTTP status -> backend is alive!
      return { online: true };
    }
    return { online: false, error: err.message };
  }
}

