import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthUser, UserRole } from "../types";
import { authApi } from "../services/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (body: unknown) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("token"));

  // On mount, verify stored token
  useEffect(() => {
    if (!token) return;
    authApi.me().then((res) => {
      if (res.success && res.data) {
        const raw = res.data as Record<string, unknown>;
        setUser(normalise(raw));
      } else {
        logout();
      }
      setIsLoading(false);
    });
  }, []);

  function normalise(raw: Record<string, unknown>): AuthUser {
    return {
      _id: (raw._id ?? raw.userId ?? "") as string,
      name: (raw.name ?? "") as string,
      email: (raw.email ?? "") as string,
      role: (raw.role ?? "student") as UserRole,
      gender: (raw.gender ?? "") as string,
      department: (raw.department ?? "") as string,
      yearOfStudy: (raw.yearOfStudy ?? 1) as number,
      createdAt: (raw.createdAt ?? "") as string,
    };
  }

  async function login(email: string, password: string): Promise<string | null> {
    const res = await authApi.login(email, password);
    if (!res.success || !res.data) return res.message ?? "Login failed";
    const { user: rawUser, token: tok } = res.data as { user: Record<string, unknown>; token: string };
    localStorage.setItem("token", tok);
    setToken(tok);
    setUser(normalise(rawUser));
    return null;
  }

  async function register(body: unknown): Promise<string | null> {
    const res = await authApi.register(body);
    if (!res.success || !res.data) return res.message ?? "Registration failed";
    const { user: rawUser, token: tok } = res.data as { user: Record<string, unknown>; token: string };
    localStorage.setItem("token", tok);
    setToken(tok);
    setUser(normalise(rawUser));
    return null;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
