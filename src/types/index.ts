export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  position?: string;
  department?: string;
  managerId?: string | null;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}
