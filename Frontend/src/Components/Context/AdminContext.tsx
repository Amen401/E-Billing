import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    const token = localStorage.getItem("authToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("adminUser");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await adminApi.login(username, password);

      if (response.userInfo && response.token) {
        const userInfo: AdminUser = {
          id: response.userInfo.id,
          name: response.userInfo.name,
          username: response.userInfo.username,
          email: response.userInfo.email,
          role: response.userInfo.role,
        };

        setUser(userInfo);
        localStorage.setItem("adminUser", JSON.stringify(userInfo));
        localStorage.setItem("authToken", response.token);
        toast.success("Login successful");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
  try {
    const response = await adminApi.adminlogout(); 
    localStorage.removeItem("adminUser"); 
    localStorage.removeItem("authToken");
    setUser(null);
    toast.success("Logged out successfully");
    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    toast.error("Logout failed! Try again.");
  }
};


  const updateProfile = async (data: { name?: string }) => {
    if (!user) return;
    try {
      if (data.name && data.name !== user.name) {
        const response = await adminApi.updateName(user.id, data.name);
        const updatedUser = { ...user, name: response.result.name };
        setUser(updatedUser);
        localStorage.setItem("adminUser", JSON.stringify(updatedUser));
        toast.success(response.message || "Profile updated successfully");
      } else {
        toast("No changes detected");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return;
    try {
      await adminApi.updateUsernameOrPassword(
        user.id,
        user.username,
        oldPassword,
        newPassword
      );
      toast.success("Password changed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
