export interface User {
  uid: string;
  email: string;
  username: string;
  locationId: string;
  balance: number;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'cash' | 'card';
  locationId?: string;
  note?: string;
  createdAt: string;
  recipientId?: string;
  senderId?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  locationId?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalLocations: number;
  totalRevenue: number;
  recentTransactions: Transaction[];
  recentUsers: User[];
  locationStats: {
    locationId: string;
    locationName: string;
    totalTransactions: number;
    totalRevenue: number;
  }[];
}

export type UserRole = 'user' | 'admin' | 'super-admin'; 