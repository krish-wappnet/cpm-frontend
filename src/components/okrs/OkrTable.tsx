import React, { useMemo } from 'react';
import { Table, Tag, Space, Button, Tooltip, Progress, Avatar } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import { getOkrStatusColor, getOkrTypeColor, calculateOkrProgress } from '../../utils/okr';
import type { Okr, OkrType, OkrStatus } from '../../types/okr';
import { useModal } from '../../hooks/useModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface OkrTableProps {
  data: Okr[];
  loading: boolean;
  pagination;
  onTableChange: (pagination, filters, sorter) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const OkrTable: React.FC<OkrTableProps> = ({
  data,
  loading,
  pagination,
  onTableChange,
  onDelete,
}) => {
  const navigate = useNavigate();
  const deleteModal = useModal<Okr>();
  
  const handleDelete = async (id: string) => {
    const success = await onDelete(id);
    if (success) {
      deleteModal.close();
    }
  };

  const columns: ColumnsType<Okr> = useMemo(() => [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string, record: Okr) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/okrs/${record.id}`)}
          className="p-0 font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Individual', value: 'individual' },
        { text: 'Team', value: 'team' },
        { text: 'Department', value: 'department' },
        { text: 'Company', value: 'company' },
      ],
      render: (type: string) => (
        <Tag color={getOkrTypeColor(type as OkrType)} className="capitalize">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      render: (status: string) => (
        <Tag color={getOkrStatusColor(status as OkrStatus)} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const progress = calculateOkrProgress(record);
        return (
          <div className="flex items-center">
            <Progress 
              percent={Math.round(progress)} 
              size="small" 
              strokeColor={getOkrStatusColor(record.status)}
              className="w-24 mr-2"
            />
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
        );
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: true,
      render: (date: string) => formatDate(date, 'MMM D, YYYY'),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar size="small" className="mr-2 bg-blue-500">
            {record.userId?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <span className="text-sm">
            {record.userId || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/okrs/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/okrs/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => deleteModal.open(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [navigate, deleteModal]);

  return (
    <>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={onTableChange}
        scroll={{ x: 'max-content' }}
        className="okr-table"
      />
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => handleDelete(deleteModal.data!.id)}
        title="Delete OKR"
        content={`Are you sure you want to delete "${deleteModal.data?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ danger: true }}
      />
    </>
  );
};
