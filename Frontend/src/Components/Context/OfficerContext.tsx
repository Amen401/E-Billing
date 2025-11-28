import React, { createContext, useContext, useState, useEffect } from "react";
import { officerApi } from "@/lib/api";
import { toast } from "sonner";

interface OfficerUser {
  id: string;
  name: string;
  username: string;
  accountNumber: string;
  email?: string;
  photo?: string;
}

interface OfficerAuthContextType {
  user: OfficerUser | null;
  login: (username: string, password: string) => Promise<void>;
  updateNameOrEmail: (
    attribute: "name" | "email",
    value: string
  ) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  changeProfilePicture: (file: File) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(
  undefined
);

export const OfficerAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<OfficerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("officerUser");
    const token = localStorage.getItem("authToken");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("officerUser");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

 const login = async (username: string, password: string) => {
  try {
    setIsLoading(true);
    const response = await officerApi.login(username, password);

    if (response.OfficerInfo && response.token) {
      const fullUserData = {
        id: response.OfficerInfo._id,
        name: response.OfficerInfo.name,
        username: response.OfficerInfo.username,
        email: response.OfficerInfo.email,
        accountNumber: response.OfficerInfo.accountNumber,
        photo: response.OfficerInfo.photo?.secure_url || null,
      };

      setUser(fullUserData);
      localStorage.setItem("officerUser", JSON.stringify(fullUserData));
      localStorage.setItem("authToken", response.token);

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

  const updateNameOrEmail = async (
    attribute: "name" | "email",
    value: string
  ) => {
    if (!user) return;

    try {
      const response = await officerApi.updateNameOrEmail(attribute, value);
      const updatedUser = { ...user, [attribute]: value };
      setUser(updatedUser);
      localStorage.setItem("officerUser", JSON.stringify(updatedUser));
      toast.success(
        `${
          attribute.charAt(0).toUpperCase() + attribute.slice(1)
        } updated successfully`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) return;
    if (!oldPass || !newPass) {
      toast.error("Old password and new password are required");
      return;
    }
    try {
      const response = await officerApi.updateUsernameOrPassword({
        id: user.id,
        username: user.username,
        oldPass,
        newPass,
      });
      toast.success(response.message || "Password changed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
      throw error;
    }
  };

 const changeProfilePicture = async (file: File) => {
  if (!user) return;

  try {
    const response = await officerApi.changeProfilePicture(file);

    const updatedUser = { ...user, photo: response.photo.secure_url };
    setUser(updatedUser);
    localStorage.setItem("officerUser", JSON.stringify(updatedUser));
  } catch (error: any) {
    toast.error(error.message || "Failed to update profile picture");
    throw error;
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("officerUser");
    localStorage.removeItem("authToken");
    toast.success("Logged out");
  };

  return (
    <OfficerAuthContext.Provider
      value={{
        user,
        login,
        updateNameOrEmail,
        changePassword,
        changeProfilePicture,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </OfficerAuthContext.Provider>
  );
};

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (!context)
    throw new Error("useOfficerAuth must be used inside OfficerAuthProvider");
  return context;
};
