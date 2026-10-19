
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

interface SavedSession {
  user: User;
  token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_KEY = "retain_session";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);

      if (!savedSession) return null;

      const session: SavedSession = JSON.parse(savedSession);
      return session.user;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);

      if (!savedSession) return null;

      const session: SavedSession = JSON.parse(savedSession);
      return session.token;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  function saveSession(data: AuthResponse) {
    const session: SavedSession = {
      user: data.user,
      token: data.token,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(data.user);
    setToken(data.token);
  }

  async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed.");
    }

    saveSession(data);
  }

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Registration failed.");
    }

    saveSession(data);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
