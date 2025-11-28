import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api"; 
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  accountNumber?: string;
  role: "customer" | "officer" | "admin";
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<"customer" | "officer" | "admin">;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  // -------------------------
  // LOGIN (UNIFIED)
  // -------------------------
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await authApi.login(username, password);

      if (!response.user || !response.token) {
        throw new Error("Invalid login response");
      }

      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        username: response.user.username,
        email: response.user.email,
        accountNumber: response.user.accountNumber,
        role: response.user.role,
        photo: response.user.photo,
      };

      setUser(userData);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("authToken", response.token);

      toast.success("Login successful");

      return userData.role;

    } catch (err: any) {
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
