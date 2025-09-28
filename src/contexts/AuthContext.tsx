// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "@/lib/axios"; // your axios instance that has withCredentials = true

type User = {
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loading: boolean; // useful while rehydrating
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

  // Rehydrate on mount: call /api/auth/refresh to get new access token (refresh cookie will be sent automatically)
  useEffect(() => {
    let mounted = true;
    async function rehydrate() {
      try {
        const res = await axios.post("/auth/refresh", {}, { withCredentials: true });
        const { jwtToken } = res.data;
        // decode jwtToken to get user info OR your backend can return user data too.
        // If backend doesn't return user, you can decode using a small helper or ask API to return user
        const payload = parseJwt(jwtToken); // implement parseJwt below or return user from backend
        if (!mounted) return;
        setAuth({ name: payload.name, email: payload.email, role: payload.role }, jwtToken);
      } catch (error: any) {
        // not logged in / refresh failed
        if (!mounted) return;
        clearAuth();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    rehydrate();
    return () => { mounted = false; };
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

/** Helper to decode JWT payload without verifying (client-side only).
 *  You can also change backend to return user object with the token and skip this.
 */
function parseJwt(token: string) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}
