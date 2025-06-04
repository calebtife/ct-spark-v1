export interface User {
  uid: string;
  email: string;
  username: string;
  locationId?: string;
  balance?: number;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  locationId: string;
  agreeTerms: boolean;
} 