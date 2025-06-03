import type { Okr, KeyResult, OkrStatus, OkrType } from '../types/okr';

export const getOkrStatusColor = (status: OkrStatus): string => {
  switch (status) {
    case 'draft':
      return 'default';
    case 'active':
      return 'processing';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default' as const;
  }
};

export const getOkrTypeColor = (type: OkrType): string => {
  switch (type) {
    case 'individual':
      return 'blue';
    case 'team':
      return 'green';
    case 'department':
      return 'purple';
    case 'company':
      return 'gold';
    default:
      return 'default' as const;
  }
};

export const getKeyResultStatus = (keyResult: KeyResult): { status: string; color: string } => {
  const { currentValue = 0, targetValue = 100, startValue = 0 } = keyResult;
  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  
  if (progress >= 100) {
    return { status: 'Completed', color: 'success' };
  } else if (progress >= 75) {
    return { status: 'On Track', color: 'processing' };
  } else if (progress >= 50) {
    return { status: 'At Risk', color: 'warning' };
  } else {
    return { status: 'Off Track', color: 'error' };
  }
};

export const calculateOkrProgress = (okr: Okr): number => {
  if (!okr.keyResults || okr.keyResults.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  okr.keyResults.forEach(kr => {
    const weight = kr.weight || 1;
    const progress = ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100 || 0;
    
    totalWeight += weight;
    weightedSum += progress * weight;
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

export const getOkrStatus = (okr: Okr): { status: string; color: string } => {
  if (okr.status === 'completed') return { status: 'Completed', color: 'success' };
  if (okr.status === 'cancelled') return { status: 'Cancelled', color: 'error' };
  
  const progress = calculateOkrProgress(okr);
  
  if (progress >= 100) {
    return { status: 'Completed', color: 'success' };
  } else if (progress >= 75) {
    return { status: 'On Track', color: 'processing' };
  } else if (progress >= 50) {
    return { status: 'At Risk', color: 'warning' };
  } else {
    return { status: 'Off Track', color: 'error' };
  }
};

export const filterOkrs = (
  okrs: Okr[], 
  filters: {
    search?: string;
    status?: string;
    type?: string;
    userId?: string;
  }
): Okr[] => {
  return okrs.filter(okr => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        okr.title.toLowerCase().includes(searchLower) ||
        okr.description?.toLowerCase().includes(searchLower) ||
        okr.keyResults?.some(kr => 
          kr.title.toLowerCase().includes(searchLower) ||
          kr.description?.toLowerCase().includes(searchLower)
        );
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active' && okr.status !== 'active') return false;
      if (filters.status === 'completed' && okr.status !== 'completed') return false;
      if (filters.status === 'draft' && okr.status !== 'draft') return false;
      if (filters.status === 'cancelled' && okr.status !== 'cancelled') return false;
    }
    
    // Type filter
    if (filters.type && filters.type !== 'all' && okr.type !== filters.type) {
      return false;
    }
    
    // User filter
    if (filters.userId && okr.userId !== filters.userId) {
      return false;
    }
    
    return true;
  });
};

export const sortOkrs = (okrs: Okr[], sortBy: string, sortOrder: 'ascend' | 'descend' = 'ascend'): Okr[] => {
  const sorted = [...okrs];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'startDate':
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case 'endDate':
        comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        break;
      case 'progress':
        comparison = calculateOkrProgress(a) - calculateOkrProgress(b);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'ascend' ? comparison : -comparison;
  });
  
  return sorted;
};
