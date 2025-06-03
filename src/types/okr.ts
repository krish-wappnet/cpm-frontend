export type OkrStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type OkrType = 'individual' | 'team' | 'company' | 'department';
export type KeyResultType = 'number' | 'percentage' | 'currency';
export type KeyResultStatus = 'on_track' | 'at_risk' | 'off_track' | 'completed';

export interface Okr {
  id: string;
  title: string;
  description?: string;
  type: OkrType;
  status: OkrStatus;
  startDate: string;
  endDate: string;
  userId: string;
  departmentId?: string;
  parentOkrId?: string;
  frequency: 'quarterly' | 'annual' | 'custom';
  keyResults?: KeyResult[];
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOkrDto {
  title: string;
  description?: string;
  type: OkrType;
  status?: OkrStatus;
  startDate: string;
  endDate: string;
  departmentId?: string;
  parentOkrId?: string;
  frequency: 'quarterly' | 'annual' | 'custom';
  keyResults?: Array<Omit<CreateKeyResultDto, 'okrId'>>;
}

export type UpdateOkrDto = Partial<CreateOkrDto>;

export interface KeyResult {
  unit: string;
  id: string;
  title: string;
  description?: string;
  type: 'number' | 'percentage' | 'currency';
  targetValue: number;
  currentValue: number;
  startValue: number;
  weight?: number;
  okrId: string;
  status: KeyResultStatus;
  updates?: KeyResultUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyResultDto {
  title: string;
  description?: string;
  type: 'number' | 'percentage' | 'currency';
  targetValue: number;
  currentValue?: number;
  startValue: number;
  weight?: number;
  okrId: string;
  unit: string;
}

export interface UpdateKeyResultDto extends Partial<CreateKeyResultDto> {
  status?: KeyResultStatus;
}

export interface KeyResultUpdate {
  id: string;
  keyResultId: string;
  userId: string;
  value: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyResultUpdateDto {
  keyResultId: string;
  value: number;
  comment?: string;
}

export interface OkrFilterParams {
  status?: string;
  type?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface KeyResultFormValues {
  title: string;
  description?: string;
  type: KeyResultType;
  startValue: number;
  currentValue: number;
  targetValue: number;
  weight: number;
  okrId?: string;
}
