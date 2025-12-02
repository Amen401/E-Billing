import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi, officerApi, customerApi, authApi } from "@/lib/api";
import { toast } from "sonner";

export type Role = "customer" | "officer" | "admin";

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  accountNumber?: string;
  role: Role;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<Role>;
  logout: () => void;


  updateNameOrEmail?: (attribute: "name" | "email", value: string) => Promise<void>;
  updateProfile?: (data: { name?: string }) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  changeProfilePicture?: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const saved = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    if (saved && token) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);


  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await authApi.login(username, password);

      if (!response.userInfo || !response.token) {
        throw new Error("Invalid login response");
      }

      const userData: User = {
        id: response.userInfo.id,
        name: response.userInfo.name,
        username: response.userInfo.username,
        role: response.role,
        email: response.userInfo.email,
        accountNumber: response.userInfo.accountNumber,
        photo: response.userInfo.photo,
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


  const logout = async () => {
    try {
      if (!user) return;
      if (user.role === "admin") await adminApi.adminlogout?.();
      if (user.role === "officer") await officerApi.logout?.();
      if (user.role === "customer") await customerApi.logout?.();
    } catch {
      toast.error("Logout failed");
    }

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    toast.success("Logged out");
  };

 

  const updateNameOrEmail = async (attribute: "name" | "email", value: string) => {
    if (!user) return;

    try {
      if (user.role === "officer") {
        await officerApi.updateNameOrEmail(attribute, value);
        const updatedUser = { ...user, [attribute]: value };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else if (user.role === "admin") {
        if (attribute === "name") {
          const response = await adminApi.updateName(user.id, value);
          const updatedUser = { ...user, name: response.result.name };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
      toast.success(`${attribute.charAt(0).toUpperCase() + attribute.slice(1)} updated successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
      throw err;
    }
  };

  const updateProfile = async (data: { name?: string }) => {
    if (!user) return;

    try {
      if (user.role === "admin" && data.name && data.name !== user.name) {
        const response = await adminApi.updateName(user.id, data.name);
        const updatedUser = { ...user, name: response.result.name };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success(response.message || "Profile updated successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
      throw err;
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) return;

    try {
      if (user.role === "officer") {
        await officerApi.updateUsernameOrPassword({ id: user.id, username: user.username, oldPass, newPass });
      } else if (user.role === "customer") {
        await customerApi.updatepassword({ id: user.id, oldPass, newPass });
      } else if (user.role === "admin") {
        await adminApi.updateUsernameOrPassword(user.id, user.username, oldPass, newPass);
      }
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
      throw err;
    }
  };

  const changeProfilePicture = async (file: File) => {
    if (!user || user.role !== "officer") return;

    try {
      const response = await officerApi.changeProfilePicture(file);
      const updatedUser = { ...user, photo: response.photo.secure_url };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile picture");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        updateNameOrEmail,
        updateProfile,
        changePassword,
        changeProfilePicture,
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
