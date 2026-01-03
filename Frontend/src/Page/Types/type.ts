export type UserRole = 'admin' | 'officer' | 'customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
}

export interface Customer {
  _id: string;
  name: string;
  region: string;
  serviceCenter: string;
  addressRegion: string;
  zone: string;
  woreda: string;
  town: string;
  purpose: string;
  powerApproved: number;
  killowat: number;
  applicableTarif: number;
  volt: number;
  depositBirr: number;
  accountNumber: string;
  meterReaderSN: string;
  isActive: boolean;
  createdAt: string;
}


export interface Officer {
  _id: string;
  name: string;
  email?: string;
  username: string;
  department?: string;
  isActive: boolean;
  assignedArea?: string;
  createdAt?: string;
  deactivatedAt?: string;        
  lastPasswordReset?: string;    
}

export interface MeterReading {
  id: string;
  customerId: string;
  meterNumber: string;
  reading: number;
  previousReading?: number;
  consumption: number;
  readingDate: Date;
  photoUrl?: string;
  officerId?: string;
  status: 'pending' | 'verified' | 'billed';
}

export interface Bill {
  id: string;
  customerId: string;
  billNumber: string;
  consumption: number;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  billDate: Date;
  paymentDate?: Date;
}

export interface Complaint {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: 'billing' | 'technical' | 'service' | 'other';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  timestamp: Date;
  details?: string;
}

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";

export interface ComplaintType {
  id: string;
  subject: string;
  description: string;
  date: string;
  status: ComplaintStatus;
  customerName?: string;
  customerAccNumber?: string;
  resolvedBy?: string;
}
export interface ComplaintsApiResponse {
  someComplients: ComplaintType[];
  allComplients: number;
  InProgress: number;
  pendingComplients: number;
  resolvedComplients: number;
}


export interface ComplaintFormData {
  subject: string;
  description: string;
}
export interface MissedMonth {
  month: string;
  year: number;
  isSelected: boolean;
}

export interface BillRow {
  _id: string;
  killowatRead: number;
  monthlyUsage: number;
  fee: number;
  monthName: string;
  dateOfSubmission: string;
  paymentStatus: "Paid" | "Unpaid" | "Pending";
  anomalyStatus: "Normal" | "Anomaly";
  txRef?: string;
  photo?: {
    secure_url: string;
    public_id: string;
  };
  customerId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;

  month?: string;        
  consumption?: number;  
  amount?: number;      
  status?: string;     
}
export interface DashboardStats {
  users: {
    officers: {
      total: number;
      active: number;
      inactive: number;
    };
    customers: {
      total: number;
      active: number;
      inactive: number;
    };
  };
  payments: {
    paid: number;
    pending: number;
    failed: number;
  };
  complaints: {
    pending: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recent: {
    officers: Officer[];
    customers: Customer[];
    unpaidBills: unknown[];
  };
}
export interface ReportFilters {
  startDate: string;
  endDate: string;
  department?: string;
  userGroup?: string;
}

export interface ApiResponses<T> {
  success: boolean;
  message?: string;
  reportType?: string;
  generatedBy?: string;
  generatedAt?: string;
  filters?: ReportFilters;
  data: T;
}
export interface ReportData {
  reportType: string;               // e.g., "officer-report", "revenue", etc.
  generatedBy?: string;             // e.g., "Admin"
  generatedAt: string;              // ISO string timestamp
  filters?: {
    startDate: string;              // "YYYY-MM-DD"
    endDate: string;                // "YYYY-MM-DD"
    department?: string;            // optional, e.g., "IT"
    userGroup?: string;             // optional, e.g., "Manager"
  };
  data: unknown;                        // actual report content, can be array or object
}
