export enum KpiStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum KpiType {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
}

export interface KpiMetric {
  name: string;
  target: number;
  current: number;
  unit?: string;
}

export interface Kpi {
  id: string;
  title: string;
  description: string;
  type: KpiType;
  metrics: KpiMetric[];
  targetValue: number;
  currentValue: number;
  weight: number;
  startDate: string;
  endDate: string;
  status: KpiStatus;
  categoryId?: string;
  userId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface KpiUpdate {
  id: string;
  kpiId: string;
  value: number;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface KpiCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKpiDto {
  title: string;
  description: string;
  type: KpiType;
  metrics: KpiMetric[];
  targetValue: number;
  weight: number;
  startDate: string;
  endDate: string;
  userId: string;
  categoryId?: string;
}

export interface UpdateKpiDto {
  title?: string;
  description?: string;
  type?: KpiType;
  metrics?: KpiMetric[];
  targetValue?: number;
  weight?: number;
  startDate?: string;
  endDate?: string;
  status?: KpiStatus;
  categoryId?: string | null;
}

export interface CreateKpiUpdateDto {
  kpiId: string;
  value: number;
  notes?: string;
}

export interface KpiFilterParams {
  userId?: string;
  status?: KpiStatus;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: never[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
