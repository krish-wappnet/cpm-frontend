import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Row, Col, Badge, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { TablePaginationConfig } from 'antd/es/table';
import type { ColumnsType } from 'antd/es/table';
import type { Okr, OkrStatus, OkrType } from '../../types/okr';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchOKRs, selectOKRs, selectTotalOKRs, selectOKRsLoading, selectOKRFilters, setFilters } from '../../store/slices/okrSlice';

const { Option } = Select;

const OkrListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });
  const okrs = useSelector(selectOKRs);
  const loading = useSelector(selectOKRsLoading);
  const filters = useSelector(selectOKRFilters);

  // Get OKRs and loading state from Redux store
  const { total } = useSelector((state: RootState) => ({
    total: selectTotalOKRs(state)
  }));

  // Fetch OKRs when filters or pagination changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          ...filters,
          page: pagination.current || 1,
          limit: pagination.pageSize || 10,
          search: search || undefined
        };
        await dispatch(fetchOKRs(params)).unwrap();
      } catch {
        message.error('Failed to load OKRs');
      }
    };
    fetchData();
  }, [dispatch, filters, pagination, search]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      setPagination(prev => ({ ...prev, current: 1 }));
    },
    []
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      dispatch(setFilters({
        status: status as OkrStatus || undefined,
      }));
      setPagination(prev => ({ ...prev, current: 1 }));
    },
    [dispatch]
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      dispatch(setFilters({
        type: type as OkrType || undefined,
      }));
      setPagination(prev => ({ ...prev, current: 1 }));
    },
    [dispatch]
  );

  const handleTableChange = (pagination: TablePaginationConfig) => {
    dispatch(setFilters({
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  const columns: ColumnsType<Okr> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Okr) => (
        <Link to={`/okrs/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: "Owner",
      dataIndex: "userId",
      key: "owner",
      render: (userId: string) => userId || 'Unknown',
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={
            status === "completed"
              ? "success"
              : status === "active"
              ? "processing"
              : status === "draft"
              ? "default"
              : "warning"
          }
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress?: number) => `${progress || 0}%`,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Okr) => (
        <div className="space-x-2">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/okrs/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/okrs/${record.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="mb-0">
          OKRs
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/okrs/new")}
        >
          Create OKR
        </Button>
      </div>

      <div className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Search OKRs..."
              value={search}
              onChange={handleSearchChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
              value={filters.status}
            >
              <Option value="draft">Draft</Option>
              <Option value="active">Active</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Select
              placeholder="Filter by type"
              allowClear
              style={{ width: '100%' }}
              onChange={handleTypeChange}
              value={filters.type}
            >
              <Option value="individual">Individual</Option>
              <Option value="team">Team</Option>
              <Option value="company">Company</Option>
              <Option value="department">Department</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={okrs}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total: total,
          showTotal: (total) => `Total ${total} items`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default OkrListPage;
