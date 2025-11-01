import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface AdminUser {
  name: string;
  username: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('authToken');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await adminApi.login(username, password);
      
      if (response.userInfo && response.token) {
        const userInfo = {
          name: response.userInfo.name,
          username: response.userInfo.username
        };
        
        setUser(userInfo);
        localStorage.setItem('adminUser', JSON.stringify(userInfo));
        localStorage.setItem('authToken', response.token);
        toast.success('Login successful');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        login,
        logout,
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
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};