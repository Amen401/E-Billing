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
  urgentComplients: number;
  pendingComplients: number;
  resolvedComplients: number;
}


export interface ComplaintFormData {
  subject: string;
  description: string;
}

