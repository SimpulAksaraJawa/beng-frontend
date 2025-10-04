// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "@/api/axios"; // your axios instance that has withCredentials = true

export type User = {
  name: string;
  email: string;
  role: string;
  permissions: {
    [key: string]: string[];
  };
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loading: boolean; // useful while refreshing
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function setAuth(u: User, token: string) {
    setUser(u);
    setAccessToken(token);
    // attach token for future axios requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  function clearAuth() {
    setUser(null);
    setAccessToken(null);
    delete axios.defaults.headers.common["Authorization"];
  }

  useEffect(() => {
    async function refresh() {
      try {
        const res = await axios.post("/auth/refresh", {}, { withCredentials: true });
        const { jwtToken, user } = res.data;
        setAuth(user, jwtToken);
      } catch (error: any) {
        // not logged in / refresh failed
        clearAuth();
      } finally {
        setLoading(false);
      }
    }

    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuth, clearAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
