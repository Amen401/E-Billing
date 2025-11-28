import React, { createContext, useContext, useState, useEffect } from "react";
import { customerApi } from "@/lib/api";

interface Customer {
  id: string;
  accountNumber: string;
  name: string;
  username: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customerInfo");
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
    setIsLoading(false);
  }, []);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (username: string, password: string) => {
    const result = await customerApi.login(username, password);

    if (result.message !== "login successful") {
      throw new Error(result.message || "Invalid credentials");
    }

    localStorage.setItem("authToken", result.token);
    localStorage.setItem("customerInfo", JSON.stringify(result.customerInfo));
    localStorage.setItem("customerId", result.id);
    localStorage.setItem("accountNumber", result.accountNumber);

    setCustomer(result.customerInfo);
  };

  
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerInfo");
    localStorage.removeItem("customerId");
    localStorage.removeItem("accountNumber");

    setCustomer(null);
  };


  const updatePassword = async (oldPass: string, newPass: string) => {
    if (!customer) throw new Error("Not authenticated");

    const data = {
      id: customer.id,
      oldPass,
      newPass,
    };

    const result = await customerApi.updatepassword(data);

    return result;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        login,
        logout,
        updatePassword,
        isAuthenticated: !!customer,
        isLoading,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      "useCustomerAuth must be used within CustomerAuthProvider"
    );
  }
  return context;
};
