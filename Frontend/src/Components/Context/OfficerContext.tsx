import React, { createContext, useContext, useState, useEffect } from "react";
import { officerApi } from "@/lib/api";
import { toast } from "sonner";

interface OfficerUser {
  name: string;
  accountNumber: string;
}

interface OfficerAuthContextType {
  user: OfficerUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(undefined);

export const OfficerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OfficerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("officerUser");
    const token = localStorage.getItem("officerToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("officerUser");
        localStorage.removeItem("officerToken");
      }
    }
    setIsLoading(false);
  }, []);

const login = async (username: string, password: string) => {
  try {
    setIsLoading(true);
    const response = await officerApi.login(username, password);

    if (response.OfficerInfo && response.token) {
      const userData = {
        name: response.OfficerInfo.name,
        accountNumber: response.OfficerInfo.username, 
      };

      setUser(userData);
      localStorage.setItem("officerUser", JSON.stringify(userData));
      localStorage.setItem("officerToken", response.token);

      toast.success("Login successful");
    } else {
      throw new Error(response.message || "Invalid login response");
    }
  } catch (error: any) {
    toast.error(error.message || "Invalid credentials");
    throw error;
  } finally {
    setIsLoading(false);
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("officerUser");
    localStorage.removeItem("officerToken");
    toast.success("Logged out");
  };

  return (
    <OfficerAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </OfficerAuthContext.Provider>
  );
};

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (!context) throw new Error("useOfficerAuth must be used inside OfficerAuthProvider");
  return context;
};
