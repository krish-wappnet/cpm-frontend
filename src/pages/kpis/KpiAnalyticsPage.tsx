import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchKpis } from '../../store/slices/kpiSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import type { Kpi } from '../../types/kpi';
import { KpiStatus } from '../../types/kpi';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Select, 
  DatePicker, 
  Progress, 
  Space, 
  Spin, 
  Table, 
  Tag 
} from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Using Kpi and KpiStatus from '../../types/kpi'

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  roles?: string[];
  managerId?: string | null;
  manager?: {
    name: string;
  };
}

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Color palette for charts
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'] as const;

const KpiAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { kpis, loading } = useAppSelector((state) => ({
    kpis: Array.isArray(state.kpis.kpis) ? state.kpis.kpis : [],
    loading: state.kpis.loading,
  }));
  
  const users = useAppSelector((state) => 
    Array.isArray(state.users.users) ? state.users.users : []
  ) as UserData[];
  
  const [completionRate, setCompletionRate] = useState<{rate: number; completed: number; total: number} | null>(null);
  const [progressByCategory, setProgressByCategory] = useState<Array<{category: string; avgProgress: number; totalKpis: number}>>([]);
  const [trends, setTrends] = useState<Array<{date: string; value: number; target: number}>>([]);
  
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  useEffect(() => {
    // Fetch users when component mounts
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    
    const params = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      userId: selectedUserId,
    };
    
    const loadData = async () => {
      try {
        await dispatch(fetchKpis({ filters: params }));
        
        // Mock data for completion rate
        setCompletionRate({
          rate: 0.75,
          completed: 15,
          total: 20
        });
        
        // Mock data for progress by category
        setProgressByCategory([
          { category: 'Sales', avgProgress: 65, totalKpis: 8 },
          { category: 'Marketing', avgProgress: 45, totalKpis: 5 },
          { category: 'Development', avgProgress: 85, totalKpis: 7 }
        ]);
        
        // Mock data for trends
        if (selectedUserId) {
          setTrends([
            { date: '2023-01', value: 30, target: 25 },
            { date: '2023-02', value: 50, target: 50 },
            { date: '2023-03', value: 70, target: 75 },
            { date: '2023-04', value: 90, target: 100 },
          ]);
        }
      } catch (error) {
        console.error('Error loading KPI analytics:', error);
      }
    };
    
    loadData();
  }, [dispatch, dateRange, selectedUserId]);
  
  const statusCounts = kpis.reduce<Record<string, number>>((acc, kpi) => {
    const status = kpi.status || '';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = [
    { name: 'Draft', value: statusCounts[KpiStatus.DRAFT] || 0, color: '#faad14' },
    { name: 'Active', value: statusCounts[KpiStatus.ACTIVE] || 0, color: '#1890ff' },
    { name: 'Completed', value: statusCounts[KpiStatus.COMPLETED] || 0, color: '#52c41a' },
    { name: 'Cancelled', value: statusCounts[KpiStatus.CANCELLED] || 0, color: '#f5222d' },
  ].filter(item => item.value > 0);
  
  const getStatusColor = (status: KpiStatus) => {
    switch (status) {
      case KpiStatus.DRAFT:
        return 'default';
      case KpiStatus.ACTIVE:
        return 'processing';
      case KpiStatus.COMPLETED:
        return 'success';
      case KpiStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: KpiStatus) => {
    switch (status) {
      case KpiStatus.DRAFT:
        return <ClockCircleOutlined />;
      case KpiStatus.ACTIVE:
        return <ClockCircleOutlined />;
      case KpiStatus.COMPLETED:
        return <CheckCircleOutlined />;
      case KpiStatus.CANCELLED:
        return <ExclamationCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Kpi) => (
        <a href={`/kpis/${record.id}`}>{text}</a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: KpiStatus) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: unknown, record: Kpi) => (
        <div>
          <div>{`${record.currentValue} / ${record.targetValue}`}</div>
          <Progress
            percent={Math.round((record.currentValue / record.targetValue) * 100)}
            status={record.status === KpiStatus.CANCELLED ? 'exception' : 'active'}
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
  ];
  
  // Transform KPI data for the table
  const tableData = kpis.map(kpi => ({
    ...kpi,
    key: kpi.id,
    progress: kpi.currentValue / kpi.targetValue * 100,
  }));
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div className="kpi-analytics-page" style={{ padding: '1rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <Title level={2}>KPI Analytics</Title>
        <div className="filters" style={{ marginBottom: '1rem' }}>
          <Space>
            <Select
              placeholder="Filter by user"
              style={{ width: 200 }}
              allowClear
              onChange={(value: string | undefined) => setSelectedUserId(value)}
              loading={loading}
            >
              {users?.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                } else {
                  setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
                }
              }}
            />
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Completion Rate" loading={loading}>
            {completionRate ? (
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={Math.round(completionRate.rate * 100)}
                  width={150}
                  strokeColor={
                    completionRate.rate >= 0.8 
                      ? '#52c41a' 
                      : completionRate.rate >= 0.5 
                        ? '#faad14' 
                        : '#f5222d'
                  }
                />
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '0.5rem' }} />
                    {completionRate.completed} Completed
                  </div>
                  <div>
                    <ClockCircleOutlined style={{ color: '#faad14', marginRight: '0.5rem' }} />
                    {completionRate.total - completionRate.completed} Pending
                  </div>
                </div>
              </div>
            ) : (
              <div>No data available</div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title="Status Distribution" loading={loading}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Progress by Category" loading={loading}>
            {progressByCategory.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="avgProgress" name="Avg. Progress %">
                      {progressByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="totalKpis" name="Total KPIs" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div>No category data available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col span={24}>
          <Card title="KPI Trends" loading={loading}>
            {trends.length > 0 ? (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Actual" fill="#8884d8" />
                    <Bar dataKey="target" name="Target" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div>No trend data available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card title="Recent KPIs" loading={loading}>
            <Table 
              columns={columns} 
              dataSource={tableData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              rowClassName={(record) => `kpi-status-${record.status}`}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KpiAnalyticsPage;
