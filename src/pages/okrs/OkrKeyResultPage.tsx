import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectKeyResultById } from '../../store/slices/okrSlice';
import { Button, Card, Descriptions, Space, Typography, Progress, Tag,Table } from 'antd';
import { EditOutlined, ArrowLeftOutlined, BarChartOutlined } from '@ant-design/icons';
import { formatDate } from '../../utils/date';
import { getKeyResultStatus } from '../../utils/okr';

const { Title, Text } = Typography;

const OkrKeyResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const currentKeyResult = useAppSelector((state) => 
    id ? selectKeyResultById(id)(state) : null
  );
  const { loading, error } = useAppSelector((state) => ({
    loading: state.okrs.loading,
    error: state.okrs.error,
  }));

  useEffect(() => {
    if (id) {
      // No need to fetch since we're using the selector
    }
  }, [dispatch, id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !currentKeyResult) {
    return <div>Error loading key result: {error}</div>;
  }

  const {
    title,
    description,
    type,
    startValue,
    targetValue,
    currentValue,
    status,
    updates = [],
    createdAt,
    updatedAt,
  } = currentKeyResult;

  // Calculate progress
  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `${value}%`,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  return (
    <div className="okr-key-result-page">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Back
      </Button>

      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0">{title}</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/okrs/key-results/${id}/edit`)}
          >
            Edit
          </Button>
        </Space>
      </div>

      <Card className="mb-6">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Description">
            {description || 'No description provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color="blue">{type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getKeyResultStatus(currentKeyResult).color}>
              {status.replace('_', ' ').toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Progress">
            <div className="flex items-center gap-4">
              <Progress 
                type="circle" 
                percent={Math.round(progress * 100) / 100} 
                width={80} 
                format={(percent) => `${percent}%`}
              />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <Text>Start: {startValue}</Text>
                  <Text>Target: {targetValue}</Text>
                  <Text>Current: {currentValue}</Text>
                </div>
                <Progress 
                  percent={progress} 
                  status={progress >= 100 ? 'success' : 'active'} 
                />
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {formatDate(createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {formatDate(updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="mb-0">Progress Updates</Title>
        <Button 
          type="primary" 
          icon={<BarChartOutlined />}
          onClick={() => navigate(`/okrs/key-results/${id}/updates`)}
        >
          Add Update
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={updates} 
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default OkrKeyResultPage;
