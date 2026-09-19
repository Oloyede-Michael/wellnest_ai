import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, usersApi, clearToken, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | guest

  const loadProfile = useCallback(async () => {
    try {
      const profile = await usersApi.getMe();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      clearToken();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      loadProfile();
    } else {
      setStatus("guest");
    }
  }, [loadProfile]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setStatus("guest");
    };
    window.addEventListener("wellnest:auth-expired", onExpired);
    return () => window.removeEventListener("wellnest:auth-expired", onExpired);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      setToken(data.accessToken);
      await loadProfile();
    },
    [loadProfile],
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      setToken(data.accessToken);
      await loadProfile();
    },
    [loadProfile],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("guest");
  }, []);

  const refreshProfile = loadProfile;

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
