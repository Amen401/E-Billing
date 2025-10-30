import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import type { ChangePasswordData, UpdateProfileData } from '@/Page/Types/admin';
import type { User } from '@/Page/Types/type';



interface AdminContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: UpdateProfileData) => Promise<void>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.adminLogin(username, password);
      
      const userData: User = {
        id: response.token, 
        name: response.userInfo.name,
        username: response.userInfo.username,
        role: 'admin',
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.token);
      
      toast.success('Login successful', {
        description: `Welcome back, ${response.userInfo.name}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error('Login failed', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData: UpdateProfileData): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('No user logged in');

      if (profileData.name) {
        await apiService.updateName(user.id, profileData.name);
      }

      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error('Update failed', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('No user logged in');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await apiService.updateUsernameOrPassword(
        user.id,
        user.username || '',
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      toast.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error('Password change failed', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminContext.Provider
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
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
