import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import type { ChangePasswordData, UpdateProfileData } from '@/Page/Types/admin';
import type { User } from '@/Page/Types/type';


interface CustomerContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: UpdateProfileData) => Promise<void>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const storedUser = localStorage.getItem('customer_user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'customer') {
          setUser(userData);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.customerLogin(email, password);
      
      const userData: User = {
        id: response.token,
        name: response.userInfo.name,
        email: email,
        username: response.userInfo.username,
        role: 'customer',
      };

      setUser(userData);
      localStorage.setItem('customer_user', JSON.stringify(userData));
      localStorage.setItem('customer_token', response.token);
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
    localStorage.removeItem('customer_user');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData: UpdateProfileData): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('No user logged in');

      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('customer_user', JSON.stringify(updatedUser));
      
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
    <CustomerContext.Provider
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
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
