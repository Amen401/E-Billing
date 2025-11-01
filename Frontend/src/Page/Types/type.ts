export type UserRole = 'admin' | 'officer' | 'customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  meterNumber: string;
  accountNumber: string;
  status: 'active' | 'inactive';
  registeredBy?: string;
  createdAt: Date;
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
