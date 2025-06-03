import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Select, 
  Input, 
  Tooltip, 
  Modal,
  message,
  type TableColumnType,
} from 'antd';
import { 
  CheckCircleOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { Toast } from '../../components/common/Toast';
import type {
  FeedbackType,
  RequestStatus
} from '../../types/feedback.types';
import type { FeedbackRequest, User } from '../../api/feedbackApi';
import { getFeedbackRequests } from '../../api/feedbackApi';
import { AxiosError } from 'axios';
import type { Key } from 'react';

const { Text } = Typography;

const FeedbackRequestsAdmin: FC = () => {
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(undefined);
  const [tableData, setTableData] = useState<FeedbackRequest[]>([]);
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [declineRequestId, setDeclineRequestId] = useState<string | null>(null);
  const navigate = useNavigate();

  type TableColumn = TableColumnType<FeedbackRequest>;

  const fetchRequests = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const response = await getFeedbackRequests({
        page,
        limit: pageSize,
        status: statusFilter,
      });

      let filteredData = response.items || [];
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        filteredData = filteredData.filter(
          (request) =>
            String(request.requester?.name || '').toLowerCase().includes(searchLower) ||
            String(request.recipient?.name || '').toLowerCase().includes(searchLower) ||
            String(request.subject?.name || '').toLowerCase().includes(searchLower) ||
            String(request.message || '').toLowerCase().includes(searchLower)
        );
      }

      setTableData(filteredData);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        current: page,
        pageSize: pageSize,
      }));
    } catch (error) {
      console.error('Error fetching feedback requests:', error);
      message.error('Failed to fetch feedback requests. Please try again.');
      setTableData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    fetchRequests(1, 10);
  }, [fetchRequests]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      setLoading(true);
      console.log('Approving request with ID:', requestId);
      
      // Get the current request to get the recipientId
      const request = await api.get(`/feedback/requests/${requestId}`);
      const recipientId = request.data.recipientId;
      
      // Update the request status to completed
      const response = await api.patch(`/feedback/requests/${requestId}`, {
        status: 'completed',
        recipientId: recipientId
      });
      
      console.log('Approve API response:', response.data);
      Toast.success('Feedback request approved successfully');
      
      // Force refresh the requests
      await fetchRequests(pagination.current, pagination.pageSize);
      console.log('Requests refreshed after approval');
    } catch (error) {
      console.error('Error approving feedback request:', error);
      if (error instanceof AxiosError) {
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        Toast.error(error.response?.data?.message || 'Failed to approve feedback request');
      } else {
        Toast.error('Failed to approve feedback request');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      setLoading(true);
      console.log('Declining request with ID:', requestId);
      
      // Get the current request to get the recipientId
      const request = await api.get(`/feedback/requests/${requestId}`);
      const recipientId = request.data.recipientId;
      
      // Update the request status to declined
      const response = await api.patch(`/feedback/requests/${requestId}`, {
        status: 'declined',
        recipientId: recipientId
      });
      
      console.log('Decline API response:', response.data);
      Toast.success('Feedback request declined successfully');
      
      // Force refresh the requests
      await fetchRequests(pagination.current, pagination.pageSize);
      console.log('Requests refreshed after decline');
    } catch (error) {
      console.error('Error declining feedback request:', error);
      if (error instanceof AxiosError) {
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        Toast.error(error.response?.data?.message || 'Failed to decline feedback request');
      } else {
        Toast.error('Failed to decline feedback request');
      }
    } finally {
      setLoading(false);
      setIsDeclineModalVisible(false);
      setDeclineRequestId(null);
    }
  };

  const showDeclineModal = (requestId: string) => {
    setDeclineRequestId(requestId);
    setIsDeclineModalVisible(true);
  };

  const handleTableChange = (pagination: { current?: number; pageSize?: number; total?: number }) => {
    const newPagination = {
      ...pagination,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      total: pagination.total || 0
    };
    
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
    
    fetchRequests(newPagination.current, newPagination.pageSize);
  };

  const handleStatusFilterChange = (value: RequestStatus | null): void => {
    const statusValue = value || undefined;
    setStatusFilter(statusValue);
    setFilterLoading(true);
    fetchRequests(1, pagination.pageSize).finally(() => {
      setFilterLoading(false);
    });
  };

  const handleClearFilter = (): void => {
    setStatusFilter(undefined);
    setFilterLoading(true);
    fetchRequests(1, pagination.pageSize).finally(() => {
      setFilterLoading(false);
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchRequests(1, pagination.pageSize);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests(pagination.current, pagination.pageSize).finally(() => {
      setRefreshing(false);
    });
  };

  const getUserDisplayName = (user: Partial<User> | string | undefined): string => {
    if (!user) return 'N/A';
    if (typeof user === 'string') return user;
    return user.name || user.email || 'Unknown User';
  };

  const columns: TableColumn[] = [
    {
      title: 'Requester',
      dataIndex: ['requester', 'name'],
      key: 'requester',
      render: (_, record: FeedbackRequest) => (
        <span className="text-gray-900">{getUserDisplayName(record.requester) || `User (${record.requesterId})`}</span>
      ),
    },
    {
      title: 'Recipient',
      dataIndex: ['recipient', 'name'],
      key: 'recipient',
      render: (_: unknown, record: FeedbackRequest) => (
        <span className="text-gray-900">{getUserDisplayName(record.recipient) || `User (${record.recipientId})`}</span>
      ),
    },
    {
      title: 'Subject',
      dataIndex: ['subject', 'name'],
      key: 'subject',
      render: (_: unknown, record: FeedbackRequest) => (
        <span className="text-gray-900">{getUserDisplayName(record.subject) || `User (${record.subjectId})`}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: unknown) => {
        const typeStr = typeof type === 'string' ? type : (type && typeof type === 'object' && 'toString' in type ? String(type) : '');
        return (
          <Tag color="blue" className="font-medium rounded-md">
            {typeStr ? typeStr.toLowerCase().replace(/_/g, ' ') : ''}
          </Tag>
        );
      },
      filters: [
        { text: 'Peer', value: 'PEER' as FeedbackType },
        { text: 'Manager', value: 'MANAGER' as FeedbackType },
        { text: 'Self', value: 'SELF' as FeedbackType },
        { text: 'Upward', value: 'UPWARD' as FeedbackType },
        { text: '360°', value: 'THREE_SIXTY' as FeedbackType },
      ],
      onFilter: (value: boolean | Key, record: FeedbackRequest) => {
        if (typeof value === 'boolean') return false;
        return record.type === value as FeedbackType;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: RequestStatus) => {
        let color = 'blue';
        switch (status) {
          case 'pending':
            color = 'orange';
            break;
          case 'completed':
            color = 'green';
            break;
          case 'declined':
            color = 'red';
            break;
          case 'expired':
            color = 'gray';
            break;
          default:
            color = 'blue';
        }
        return (
          <Tag color={color} className="font-medium rounded-md">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: {
        setSelectedKeys: (keys: Key[]) => void;
        selectedKeys: Key[];
        confirm: () => void;
      }) => (
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <Select
            className="w-48 mb-2"
            placeholder="Select status"
            value={selectedKeys[0] as RequestStatus | undefined}
            onChange={(value: RequestStatus | undefined) => {
              setSelectedKeys(value ? [value] : []);
              confirm();
              handleStatusFilterChange(value || null);
            }}
            allowClear
            loading={filterLoading}
            disabled={loading}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="declined">Declined</Select.Option>
            <Select.Option value="expired">Expired</Select.Option>
          </Select>
          <Button
            size="small"
            onClick={() => {
              setSelectedKeys([]);
              confirm();
              handleClearFilter();
            }}
            className="w-24 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Reset
          </Button>
        </div>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: FeedbackRequest, b: FeedbackRequest) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Requested On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: FeedbackRequest, b: FeedbackRequest) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: FeedbackRequest) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approve this feedback request">
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApproveRequest(record.id)}
                  loading={loading}
                  size="small"
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                />
              </Tooltip>
              <Tooltip title="Decline this feedback request">
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => showDeclineModal(record.id)}
                  loading={loading}
                  size="small"
                  className="bg-red-600 hover:bg-red-700 border-red-600"
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="View request details">
            <Button 
              type="link" 
              onClick={() => navigate(`/feedback/requests/${record.id}`)}
              icon={<EyeOutlined />}
              className="text-blue-600 hover:text-blue-800"
            >
              View
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 animate-slide-in">
          <Typography.Title level={2} className="text-4xl font-bold text-gray-900 tracking-tight">
            Feedback Requests Admin
          </Typography.Title>
          <Text className="mt-3 text-lg text-gray-600">
            Manage and review feedback requests from your team.
          </Text>
        </div>

        <Card className="bg-white rounded-2xl shadow-lg p-6 animate-slide-in">
          <div className="sticky top-0 bg-white z-10 pb-6 border-b border-gray-200">
            <Space direction="vertical" size="large" className="w-full">
              <Space wrap>
                <Input
                  placeholder="Search by name or message"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={() => handleSearch(searchText)}
                  disabled={loading}
                  size="large"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-80 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  onClick={() => handleSearch(searchText)}
                  loading={loading}
                  size="large"
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Search
                </Button>
                <Button 
                  onClick={() => {
                    setSearchText('');
                    setStatusFilter(undefined);
                    fetchRequests(1, pagination.pageSize);
                  }}
                  disabled={loading}
                  size="large"
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  Reset
                </Button>
                <Button 
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={handleRefresh}
                  disabled={loading}
                  size="large"
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  Refresh
                </Button>
              </Space>
            </Space>
          </div>

          <Table<FeedbackRequest>
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              className: 'mt-4'
            }}
            onChange={handleTableChange}
            scroll={{ x: 1300 }}
            className="mt-6"
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </Card>

        <Modal
          title={<span className="text-lg font-semibold text-gray-900">Decline Feedback Request</span>}
          open={isDeclineModalVisible}
          onOk={() => declineRequestId && handleDeclineRequest(declineRequestId)}
          onCancel={() => {
            setIsDeclineModalVisible(false);
            setDeclineRequestId(null);
          }}
          okText="Yes, Decline"
          cancelText="No, Cancel"
          okButtonProps={{
            danger: true,
            className: 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 rounded-lg'
          }}
          cancelButtonProps={{
            className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 rounded-lg'
          }}
        >
          <Text className="text-gray-600">
            Are you sure you want to decline this feedback request? This action cannot be undone.
          </Text>
        </Modal>
      </div>
    </div>
  );
};

export default FeedbackRequestsAdmin;