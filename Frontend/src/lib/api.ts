const API_BASE_URL = "http://localhost:3000";

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}
interface OfficerStats {
  total: number;
  active: number;
  inactive: number;
}
interface MeterReading {
  _id: string;
  account_number: string;
  meter_number: string;
  reading_kwh: number;
  reading_date: string;
  ai_status: "Normal" | "Anomaly" | "Need Investigation";
  customer_id?: string;
  createdAt?: string;
  updatedAt?: string;
}


class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("authToken");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error("API Error:", error);
      throw new Error(error.message || "Network error occurred");
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiService();

const ENDPOINTS = {
  login: "/admin/login",
  searchOfficer: "/admin/search-officer",
  activateDeactivateOfficer: "/admin/ad-officer",
  updateName: "/admin/update-name",
  updateUsernameOrPassword: "/admin/update-up",
  officerResetPassword: "/admin/orp",
  customerResetPassword: "/admin/crp",
  createAdmin: "/admin/add-admin",
  createOfficer: "/admin/create-officer",
  officerLogin: "/officer/login",
  customerLogin: "/customer/login",
  getstatus:"/admin/officers/stats",
    systemActivities: "/admin/system-activities",
      officerProfile: "/officer/profile",
  updateOfficerProfile: "/officer/update-profile",
   officerMeterReadings: "/officer/meter-readings",
  officerMeterReadingDetail: "/officer/meter-readings/:id",
  createCustomer:"/officer/add-customer"
};

export const adminApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(ENDPOINTS.login, { username, password });
    return response;
  },

searchOfficer: async (query: string) => {
  const response = await api.get(`${ENDPOINTS.searchOfficer}?query=${encodeURIComponent(query)}`);
  return response;
},


  activateDeactivateOfficer: async (id: string, isActive: boolean) => {
    const response = await api.post(ENDPOINTS.activateDeactivateOfficer, { id, isActive });
    return response;
  },

  updateName: async (id: string, name: string) => {
    const response = await api.post(ENDPOINTS.updateName, { id, name });
    return response;
  },

  updateUsernameOrPassword: async (
    id: string,
    username: string,
    oldPass: string,
    newPass: string
  ) => {
    const response = await api.post(ENDPOINTS.updateUsernameOrPassword, {
      id,
      username,
      oldPass,
      newPass,
    });
    return response;
  },

  officerResetPassword: async (id: string) => {
    const response = await api.post(ENDPOINTS.officerResetPassword, { id });
    return response;
  },

  customerResetPassword: async (id: string) => {
    const response = await api.post(ENDPOINTS.customerResetPassword, { id });
    return response;
  },

  createAdmin: async (data: any) => {
    const response = await api.post(ENDPOINTS.createAdmin, data);
    return response;
  },

  createOfficer: async (data: any) => {
    const response = await api.post(ENDPOINTS.createOfficer, data);
    return response;
  },

getOfficerStats: async () => {
  const response = await api.get<OfficerStats>(ENDPOINTS.getstatus);
  return response; 
},
 getSystemActivities: async () => {
    const response = await api.get(ENDPOINTS.systemActivities);
    return response; 
  },

};
export const customerApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(ENDPOINTS.customerLogin, { username, password });
    return response;
  },
};
export const officerApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(ENDPOINTS.officerLogin, { username, password });
    return response;
  },
   getProfile: async () => {
    const response = await api.get(ENDPOINTS.officerProfile);
    return response;
  },

  updateProfile: async (data: { name: string }) => {
    const response = await api.put(ENDPOINTS.updateOfficerProfile, data);
    return response;
  },
   getMeterReadings: async () => {
    const response = await api.get<{ data: MeterReading[] }>(ENDPOINTS.officerMeterReadings);
    return response;
  },

  getMeterReadingDetail: async (id: string) => {
    const response = await api.get(`${ENDPOINTS.officerMeterReadingDetail.replace(':id', id)}`);
    return response;
  },
createCustomer: async (data: any) => {
const token = localStorage.getItem("officerToken");
if (!token) throw new Error("No officer token found, please login");

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.createCustomer}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Failed to create customer");
  }

  return resData;
},



};
