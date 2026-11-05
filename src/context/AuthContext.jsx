import React, { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";
import { isDemoMode, setDemoMode, demoStore } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("convergedesk_user");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return isDemoMode() ? demoStore.user : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("convergedesk_access_token"));
  const [demoActive, setDemoActive] = useState(() => isDemoMode());
  const [isLoading, setIsLoading] = useState(false);
  const [backendHealth, setBackendHealth] = useState({ checked: false, online: false });

  const logout = useCallback(() => {
    localStorage.removeItem("convergedesk_access_token");
    localStorage.removeItem("convergedesk_refresh_token");
    localStorage.removeItem("convergedesk_user");
    setToken(null);
    setUser(null);
  }, []);

  // Initial check of backend health
  useEffect(() => {
    let mounted = true;
    authApi.checkHealth().then((res) => {
      if (mounted) {
        setBackendHealth({ checked: true, online: res.online });
        if (!res.online && !localStorage.getItem("convergedesk_access_token")) {
          setDemoMode(true);
          setDemoActive(true);
          setUser(demoStore.user);
        }
      }
    });

    const handleAuthExpired = () => {
      logout();
    };

    const handleConnChanged = () => {
      setDemoActive(isDemoMode());
    };

    window.addEventListener("convergedesk:auth-expired", handleAuthExpired);
    window.addEventListener("convergedesk:connection-changed", handleConnChanged);

    return () => {
      mounted = false;
      window.removeEventListener("convergedesk:auth-expired", handleAuthExpired);
      window.removeEventListener("convergedesk:connection-changed", handleConnChanged);
    };
  }, [logout]);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem("convergedesk_access_token", res.access);
      localStorage.setItem("convergedesk_refresh_token", res.refresh);
      localStorage.setItem("convergedesk_user", JSON.stringify(res.user));
      setToken(res.access);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(username, email, password);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDemoMode = (enabled) => {
    setDemoMode(enabled);
    setDemoActive(enabled);
    if (enabled) {
      setUser(demoStore.user);
    } else {
      setUser(null);
      setToken(null);
      localStorage.removeItem("convergedesk_access_token");
      localStorage.removeItem("convergedesk_refresh_token");
      localStorage.removeItem("convergedesk_user");
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token || demoActive),
    isDemoMode: demoActive,
    isLoading,
    backendHealth,
    login,
    register,
    logout,
    toggleDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from "./useAuth";
