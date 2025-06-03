import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Feedback } from '../../types/feedback.types';
import { format } from 'date-fns';
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Tooltip, 
  Spin, 
  Empty,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ReloadOutlined, 
  MessageOutlined, 
  UserOutlined,
  StarFilled,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { message } from 'antd';
import api from '../../services/api';

const { Title, Text } = Typography;

const AllFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });
  
  const [stats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    averageRating: 0
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create stable references to pagination values
  const paginationRef = useRef(pagination);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedbacks', {
        params: {
          page: paginationRef.current.current,
          limit: paginationRef.current.pageSize,
        },
      });
      setFeedbacks(response.data.items);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
      }));
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      message.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed since we use ref

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeedbacks()
      .finally(() => setIsRefreshing(false));
  };

  const getStatusTag = (status: string) => {
    let color = 'default';
    switch (status.toLowerCase()) {
      case 'submitted':
        color = 'success';
        break;
      case 'draft':
        color = 'warning';
        break;
      case 'pending':
        color = 'processing';
        break;
      default:
        color = 'default';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const renderRating = (value: number | undefined) => {
    if (!value) return 'N/A';
    return (
      <Space>
        {[...Array(5)].map((_, i) => (
          i < Math.floor(value) ? 
          <StarFilled key={i} style={{ color: '#faad14' }} /> : 
          <StarOutlined key={i} style={{ color: '#d9d9d9' }} />
        ))}
        <span>({value.toFixed(1)})</span>
      </Space>
    );
  };

  const columns: ColumnsType<Feedback> = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ maxWidth: '300px' }} ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Ratings',
      key: 'ratings',
      width: 200,
      render: (_, record) => (
        <div>
          <div>Comm: {renderRating(record.ratings?.communication)}</div>
          <div>Team: {renderRating(record.ratings?.teamwork)}</div>
          <div>Tech: {renderRating(record.ratings?.technical)}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'From',
      key: 'from',
      width: 150,
      render: (_, record) => (
        record.fromUser ? (
          <Space>
            <UserOutlined />
            {`${record.fromUser.firstName} ${record.fromUser.lastName}`}
          </Space>
        ) : 'Anonymous'
      ),
    },
    {
      title: 'To',
      key: 'to',
      width: 150,
      render: (_, record) => (
        record.toUser ? (
          <Space>
            <UserOutlined />
            {`${record.toUser.firstName} ${record.toUser.lastName}`}
          </Space>
        ) : 'N/A'
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 120,
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            <MessageOutlined /> All Feedback
          </Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Feedback" 
              value={stats.total} 
              prefix={<MessageOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Submitted" 
              value={stats.submitted} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Pending" 
              value={stats.pending} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Avg. Rating" 
              value={stats.averageRating} 
              precision={1}
              valueStyle={{ color: '#faad14' }}
              prefix={<StarFilled />} 
              suffix="/5"
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <MessageOutlined />
            <span>Feedback List</span>
            {loading && <Spin size="small" />}
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
            size="small"
          >
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total: number) => `Total ${total} items`,
          }}
          loading={loading || isRefreshing}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No feedback found"
              />
            ),
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default AllFeedback;
