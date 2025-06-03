export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  position: string;
  department: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
