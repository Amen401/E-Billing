export type UserRole = 'admin' | 'officer' | 'customer';



export interface Officer {
  _id: string;
  name: string;
  email: string;
  officerId: string;
  department: string;
  isActive: boolean;
  assignedArea: string;
  password?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  customerId: string;
  meterNo: string;
  isActive: boolean;
  outstanding: number;
  address?: string;
  phoneNumber?: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  message: string;
  userInfo: {
    name: string;
    username: string;
  };
  token: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}
