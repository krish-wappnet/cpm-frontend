export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  managerId?: string | null;
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
