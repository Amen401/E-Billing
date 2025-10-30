import type { ApiResponse, LoginResponse, Officer } from "@/Page/Types/admin";
import axios from "axios";
import { toast } from "sonner";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/admin/login"; 
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

class ApiService {

  async adminLogin(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/admin/login', { username, password });
    return response.data;
  }


  async officerLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/officer/login', { email, password });
    return response.data;
  }


  async customerLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/customer/login', { email, password });
    return response.data;
  }

  async searchOfficers(name: string): Promise<Officer[]> {
    const response = await api.post('/admin/search-officer', { name });
    return response.data;
  }

  async toggleOfficerStatus(id: string, isActive: boolean): Promise<Officer> {
    const response = await api.post('/admin/ad-officer', { id, isActive });
    return response.data;
  }

  async resetOfficerPassword(id: string): Promise<ApiResponse> {
    const response = await api.post('/admin/orp', { id });
    return response.data;
  }


  async resetCustomerPassword(id: string): Promise<ApiResponse> {
    const response = await api.post('/admin/crp', { id });
    return response.data;
  }


  async updateName(id: string, name: string): Promise<ApiResponse> {
    const response = await api.post('/admin/update-name', { id, name });
    return response.data;
  }

  async updateUsernameOrPassword(
    id: string,
    username: string,
    oldPass: string,
    newPass: string
  ): Promise<ApiResponse> {
    const response = await api.post('/admin/update-up', { 
      id, 
      username, 
      oldPass, 
      newPass 
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default api;
