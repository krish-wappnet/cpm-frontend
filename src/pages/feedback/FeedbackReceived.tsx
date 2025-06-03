import React, { useMemo } from 'react';
import { Card, Table, Tag, Avatar, Rate, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

interface FeedbackItem {
  id: string;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
}

// Mock data for feedback
const mockFeedback: FeedbackItem[] = [
  {
    id: '1',
    fromUser: {
      id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'manager@example.com',
    },
    rating: 4.5,
    comment: 'Great work on the project! Your attention to detail really made a difference.',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestId: 'req1',
  },
  {
    id: '2',
    fromUser: {
      id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'admin@example.com',
    },
    rating: 5,
    comment: 'Excellent collaboration and communication throughout the sprint.',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    requestId: 'req2',
  },
];

const FeedbackReceived: React.FC = () => {
  // Transform data to include a key for each row
  const tableData = useMemo(() => 
    mockFeedback.map(item => ({
      key: item.id,
      ...item
    })),
    []
  );

  // Ensure data is in correct format
  
  const columns = [
    {
      title: 'From',
      dataIndex: 'fromUser',
      key: 'from',
      render: (_: unknown, record: FeedbackItem) => {
        const initials = `${record.fromUser.firstName[0]}${record.fromUser.lastName[0]}`.toUpperCase();
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];
        const colorIndex = (record.fromUser.firstName.length + record.fromUser.lastName.length) % colors.length;
        const bgColor = colors[colorIndex];
        
        return (
          <div className="flex items-center group">
            <div className="relative mr-3">
              {record.fromUser.email ? (
                <Avatar 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.fromUser.firstName + ' ' + record.fromUser.lastName)}&background=${bgColor.replace('#', '')}&color=fff&size=128`}
                  className="transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                  size={42}
                >
                  {initials}
                </Avatar>
              ) : (
                <Avatar 
                  style={{ backgroundColor: bgColor }}
                  className="flex items-center justify-center text-white font-medium transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                  size={42}
                >
                  {initials}
                </Avatar>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                {`${record.fromUser.firstName} ${record.fromUser.lastName}`}
              </span>
              <a 
                href={`mailto:${record.fromUser.email}`}
                className="text-xs text-gray-500 hover:text-blue-500 transition-colors flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {record.fromUser.email}
              </a>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 180,
      render: (rating: number) => (
        <div className="flex items-center">
          <Rate disabled allowHalf value={rating} className="text-sm" />
          <span className="ml-2 text-sm">{rating.toFixed(1)}/5</span>
        </div>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string) => (
        <div className="whitespace-pre-line">{comment}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag 
          color={
            status.toLowerCase() === 'completed' ? 'green' : 
            status.toLowerCase() === 'pending' ? 'orange' : 'blue'
          }
          className="capitalize w-full text-center"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 120,
      render: (date: string) => (
        <div className="text-sm">
          <div className="font-medium">{dayjs(date).format('MMM D, YYYY')}</div>
          <div className="text-gray-500 text-xs">
            {dayjs(date).format('h:mm A')}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">Feedback Received</h2>
          <Text type="secondary">View all feedback you've received from your colleagues</Text>
          <div className="mt-2">
            <Text type="secondary">
              Showing <Text strong>{tableData.length}</Text> feedback items
            </Text>
          </div>
        </div>

        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `Total ${total} feedback items`,
            }}
            className="w-full"
            scroll={{ x: 'max-content' }}
            rowClassName="hover:bg-gray-50 transition-colors"
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <Text type="secondary">No feedback data available</Text>
                </div>
              )
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default FeedbackReceived;
