export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[]; // Optional, if API might omit it
  role?: string; // Optional, if API might use this instead
  position: string;
  department: string;
  avatar?: string;
  phone?: string;
  hireDate?: string;
  status?: "active" | "inactive" | "on_leave";
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
