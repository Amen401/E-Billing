import type { ComplaintType,ApiResponses, ReportFilters,ReportData } from "@/Page/Types/type";
import { get } from "react-hook-form";

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
export interface PaymentStatusResponse {
  status: "success" | "pending" | "failed";
  reading?: {
    id: string;
    month: string;
    consumption: number;
    amount: number;
    dueDate: string;
    status: string;
  };
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
        const errorMessage =
          data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error("API Error:", error);
      throw new Error(error.message || "Network error occurred");
    }
  }

  async get<T>(endpoint: string, p0: { params: { id: string; }; }): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any, p0?: { headers: { "Content-Type": string; }; }): Promise<T> {
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
  createOfficer: "/admin/add-officer",
  officerLogin: "/officer/login",
  customerLogin: "/customer/login",
  getstatus: "/admin/officer-info",
  systemActivities: "/admin/my-activities",
  searchmyactities: "/admin/search-my-activities",
  officerProfile: "/officer/profile",
  updateOfficerProfile: "/officer/update-profile",
  officerMeterReadings: "/officer/meter-readings",
  officerMeterReadingDetail: "/officer/meter-readings/:id",
  createCustomer: "/officer/add-customer",
  adminlogout: "/admin/admin-logout",
  searchCustomers: "/officer/search-customer",
  getcustomers: "/officer/get-customers",
  activateDeactivateCustomer: "/admin/ad-customer",
  officerLogout: "/officer/officer-logout",
  updateNameOrEmail: "/officer/update-name-or-email",
  changeProfilePic: "/officer/change-profile-pic",
  updatePassowrdOrUsername: "/officer/update-up",
  systemActivitiesofOfficer: "/officer/my-activities",
  searchmyactitiesofOfficer: "/officer/search-my-activities",
  updateComplaintstatus: "/officer/update-complient-status",
  searchcustomercomplaints: "/officer/search-customer-complients",
  customercomplaintInfo: "/officer/customer-complient-infos",
  getoficerstats: "/officer/get-officer-stats",
  createSchedule: "/officer/create-schedule",
  getSchedule: "/officer/get-schedule",
  closeSchedule: "/officer/close-schedule",
};

export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
};

export const adminApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(ENDPOINTS.login, { username, password });
    return response;
  },
  adminlogout: async () => {
    const response = await api.post(ENDPOINTS.adminlogout);
    return response;
  },
validateToken: async (token: string) => {
    const response = await api.post("/admin/validate-token", { token });
    return response;
  },
  searchOfficer: async (query: string) => {
    const response = await api.get(
      `${ENDPOINTS.searchOfficer}?q=${encodeURIComponent(query)}`
    );
    return response;
  },
  searchCustomers: async (query: string) => {
    const response = await api.post(`${ENDPOINTS.searchCustomers}`, {
      searchBy: "name",
      value: query,
    });
    return response;
  },
  updateAdminProfile: async () => {
    const response = await api.put(`${ENDPOINTS.updateUsernameOrPassword}`);
    return response;
  },

  searchMyActivities: async (query: string, filter: string) => {
    const response = await api.get(
      `${ENDPOINTS.searchmyactities}?filter=activity&value=${encodeURIComponent(
        query
      )}`
    );
    return response;
  },
  activateDeactivateCustomer: async (
    id: string,
    isActive: boolean,
    adminId: string
  ) => {
    const response = await api.post(ENDPOINTS.activateDeactivateCustomer, {
      id,
      isActive,
      adminId,
    });
    return response;
  },

  activateDeactivateOfficer: async (
    id: string,
    isActive: boolean,
    adminId: string
  ) => {
    const response = await api.post(ENDPOINTS.activateDeactivateOfficer, {
      id,
      isActive,
      adminId,
    });
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
  getadmindashboard: async () => {
    const response = await api.post("/admin/admin-dashboard");
    return response;
  },

  generateReport: async (
  type: string,
  params: {
    startDate: string;
    endDate: string;
    department?: string;
    userGroup?: string;
  }
) => {
  const response = await api.post("/admin/report", {
    type,
    ...params, 
  });

  return response;
},


};
export const customerApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(ENDPOINTS.customerLogin, {
      username,
      password,
    });
    return response;
  },

  getProfile: async () => {
    return api.get("/customer/profile");
  },

  updatepassword: async (data: {
    id: string;
    oldPass: string;
    newPass: string;
  }) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(`${API_BASE_URL}/customer/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || "Failed to update password");
    }
    return resData;
  },

  submitMeterReading: async (formData: FormData) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const controller = new AbortController();

    setTimeout(() => controller.abort(), 180000); // 3 minutes

    const response = await fetch(`${API_BASE_URL}/customer/submit-reading`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Submission failed");
    }

    return data;
  },

  getMeterReadings: async () => {
    return api.get("/customer/meter-readings");
  },

  getMeterReadingDetail: async (id: string) => {
    return api.get(`/customer/meter-readings/${id}`);
  },

  submitComplaint: async (data: {
    subject: string;
    description: string;
    date?: string;
    status?: string;
  }) => {
    const response = await api.post("/customer/write-complain", data);
    return response;
  },

  getComplaints: async () => {
    const response = await api.get<{ myComplains: ComplaintType[] }>(
      "/customer/my-complain"
    );
    return response;
  },

  logout: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/customer/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || "Logout failed");
    }

    return resData;
  },
  getMonthlyUsage: async () => {
    const res = await api.get("/customer/my-monthly-usage-analysis");
    return res;
  },

  getConsumption: async ({ startDate, endDate }) => {
    const res = await api.get("/customer/my-monthly-usage-analysis", {
      params: { startDate, endDate },
    });
    return res;
  },

  getmymeterReading: async () => {
    const response = await api.get("/customer/my-meter-readings");
    return response;
  },
  payBill: async (readingId: string, paymentMethod: string) => {
    try {
      const response = await api.post("/customer/pay-bill", {
        rId: readingId,
        paymentMethod,
      });
      console.log("API Response:", response);
      return response;
    } catch (err) {
      console.error("payBill API error:", err);
      throw err;
    }
  },
  checkPaymentStatus: async (txRef: string): Promise<PaymentStatusResponse> => {
    const response = await api.get(`/customer/payment-status/${txRef}`);
    return response;
  },
  updateTestPayment: (readingId: string) => {
    const response = api.post("/customer/test-payment", { readingId });
    return response;
  },
  getReadingById: async (readingId: string) => {
    const response = await api.get(`/customer/meter-by-id/${readingId}`);
    return response;
  },
  getpaidbills: async () => {
    const response = await api.get("/customer/paid-bill");
    return response;
  },
  forceChapaCallback: async (tx_ref: string) => {
    const res = await api.get(`/customer/chapa-callback?tx_ref=${tx_ref}`);
    return res.json();
  },
  validateToken: async (token: string) => {
    const response = await api.get("/customer/validate-token", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },
};

export const officerApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(ENDPOINTS.officerLogin, {
      username,
      password,
    });
    return response;
  },
  getProfile: async () => {
    return api.get(ENDPOINTS.officerProfile);
  },

  updateProfile: async (data: { name: string }) => {
    return api.put(ENDPOINTS.updateOfficerProfile, data);
  },
  addMeterReading: async (data: FormData) => {
    const response = await api.post("/officer/meter-readings", data);
    return response;
  },
  getMeterReadings: async () => {
    const response = await api.get<{ data: MeterReading[] }>(
      ENDPOINTS.officerMeterReadings
    );
    return response;
  },

  getMeterReadingDetail: async (id: string) => {
    const response = await api.get(
      `${ENDPOINTS.officerMeterReadingDetail.replace(":id", id)}`
    );
    return response;
  },
  createCustomer: async (data: any) => {
    const token = localStorage.getItem("authToken");
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

  searchCustomers: async (query: string) => {
    const response = await api.post(`${ENDPOINTS.searchCustomers}`, {
      searchBy: "name",
      value: query,
    });
    return response;
  },
  getCustomers: async () => {
    const response = await api.get(ENDPOINTS.getcustomers);
    return response;
  },
  updateNameOrEmail: async (attribute: "name" | "email", value: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.updateNameOrEmail}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ atribute: attribute, value }),
      }
    );

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || "Failed to update profile");
    }

    return resData;
  },

  changeProfilePicture: async (file: File) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("image", file);
  console.log("FormData keys:", [...formData.keys()]);

  const response = await fetch(
    `${API_BASE_URL}${ENDPOINTS.changeProfilePic}`,
    {
      method: "POST",
       
      headers: {
        Authorization: `Bearer ${token}`, 
      },
       body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
},

  updateUsernameOrPassword: async (data: {
    id: string;
    username?: string;
    oldPass?: string;
    newPass?: string;
  }) => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.updatePassowrdOrUsername}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(
        resData.message || "Failed to update password or username"
      );
    }

    return resData;
  },

  logout: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.officerLogout}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const resData = await response.json();
      throw new Error(resData.message || "Logout failed");
    }

    return response.json();
  },
  getSystemActivities: async () => {
    const response = await api.get(ENDPOINTS.systemActivitiesofOfficer);
    return response;
  },

searchMyActivities: async (query: string, filter: string) => {
  const res = await api.post(
    `${ENDPOINTS.searchmyactitiesofOfficer}?filter=${filter}&value=${encodeURIComponent(query)}`
  );
  return res;
},


  updatecomplaintstatus: async (cId: string, status: string) => {
    const response = await api.put(ENDPOINTS.updateComplaintstatus, {
      cId,
      status,
    });
    return response;
  },
  searchcustomercomplaints: async (query: string) => {
    const url = `${ENDPOINTS.searchcustomercomplaints}?filter=customerName&value=${query}`;
    const response = await api.post(url);
    return response;
  },

  customercomplaintInfos: async () => {
    const response = await api.get<{ myComplains: ComplaintType[] }>(
      `${ENDPOINTS.customercomplaintInfo}`
    );
    return response;
  },
  getDashboardStats: async () => {
    const response = await api.get(ENDPOINTS.getoficerstats);
    return response;
  },
  createSchedule: async (data: any) => {
    const response = await api.post(ENDPOINTS.createSchedule, data);
    return response;
  },
  getSchedule: async () => {
    const response = await api.get(ENDPOINTS.getSchedule);
    return response;
  },
  closeSchedule: async (id: string) => {
    const response = await api.post(ENDPOINTS.closeSchedule, { id });
    return response;
  },

checkMissedMonths: async (customerId: string) => {
  if (!customerId) throw new Error("Customer ID is required");

  const response = await api.get(`/officer/get-missed-payments?customerId=${customerId}`);

  return response; 
}
,

PayManual: async (formData: FormData) => {
  const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const controller = new AbortController();

    setTimeout(() => controller.abort(), 180000);

    const response = await fetch(`${API_BASE_URL}/officer/pay-manualy`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Submission failed");
    }

    return data;
},



  chnageMeterReadingStatus: async (readingId: string) => {
    const response = await api.post("/officer/change-reading-status", {
      readingId,
    });
    return response;
  },
  searchMeterReadings: async (query: string) => {
    const response = await api.get(
      `/officer/search-meter-readings?q=${encodeURIComponent(query)}`
    );
    return response;
  },
  getAllMeterReadings: async () => {
    const response = await api.get("/officer/get-all-meter-readings");
    return response;
  },
 generateReport: async (
  reportType: string,
  params: {
    startDate: string;
    endDate: string;
    department?: string;
    userGroup?: string;
  }
) => {
  const response = await api.post("/officer/reports/generate", {
    reportType,
    ...params, 
  });

  return response;
},
validateToken: async (token: string) => {
  const response = await api.get("/officer/validate-token", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
},


};
