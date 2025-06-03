import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

export interface TableParams<T> {
  pagination?: TablePaginationConfig;
  sortField?: keyof T;
  sortOrder?: 'ascend' | 'descend' | null;
  filters?: Record<string, FilterValue | null>;
}

export const getTableParams = <T>(
  params: TableParams<T>,
  defaultPageSize = 10
): TableParams<T> => {
  return {
    pagination: {
      current: 1,
      pageSize: defaultPageSize,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total: number) => `Total ${total} items`,
      ...params.pagination,
    },
    ...params,
  };
};

export const handleTableChange = <T>(
  pagination: TablePaginationConfig,
  filters: Record<string, FilterValue | null>,
  sorter: SorterResult<T> | SorterResult<T>[],
  setTableParams: React.Dispatch<React.SetStateAction<TableParams<T>>>,
  onFilterChange?: (filters: Record<string, FilterValue | null>) => void
) => {
  const sorterResult = Array.isArray(sorter) ? sorter[0] : sorter;
  
  setTableParams((prev: TableParams<T>) => ({
    ...prev,
    sortField: sorterResult.field as keyof T,
    sortOrder: sorterResult.order,
    pagination: {
      ...prev.pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    },
    filters: {
      ...prev.filters,
      ...filters,
    },
  }));

  if (onFilterChange) {
    onFilterChange(filters);
  }
};
