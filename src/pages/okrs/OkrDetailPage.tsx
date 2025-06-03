import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../store/store';
import type { RootState } from '../../store/rootReducer';
import { 
  fetchOKRById,
  clearCurrentOKR,
  fetchKeyResultUpdates
} from '../../store/slices/okrSlice';
import type { Okr } from '../../types/okr';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Progress, 
  message,
  Tabs,
  List,
  Descriptions,
  Badge,
  Dropdown,
  Menu
} from 'antd';
import type { KeyResult, KeyResultUpdate } from '../../types/okr';
import { 
  EditOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EllipsisOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import KeyResultForm from './KeyResultForm';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const OkrDetailPage: React.FC = () => {
  const { id: okrId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showKeyResultForm, setShowKeyResultForm] = useState(false);
  const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | undefined>(undefined);
  
  const okr = useSelector((state: RootState) => state.okrs.currentOKR as Okr | null);
  const keyResultUpdates = useSelector((state: RootState) => state.okrs.keyResultUpdates);

  useEffect(() => {
    if (okrId) {
      dispatch(fetchOKRById(okrId));
      dispatch(fetchKeyResultUpdates(okrId));
      setLoading(false);
    }

    return () => {
      dispatch(clearCurrentOKR());
    };
  }, [dispatch, okrId]);

  const handleEditOkr = () => {
    if (okr) {
      navigate(`/okrs/edit/${okr.id}`);
    }
  };

  const handleAddKeyResult = (): void => {
    setEditingKeyResult(undefined);
    setShowKeyResultForm(true);
  };

  const handleDeleteKeyResult = (id: string): void => {
    try {
      dispatch(clearCurrentOKR());
      console.log('Deleting key result:', id);
      message.success('Key result deleted successfully');
    } catch (error) {
      const err = error as Error;
      console.error('Failed to delete key result:', err);
      message.error('Failed to delete key result');
    }
  };

  const handleEditKeyResult = (keyResult: KeyResult): void => {
    setEditingKeyResult(keyResult);
    setShowKeyResultForm(true);
  };

  const handleKeyResultFormClose = (): void => {
    setShowKeyResultForm(false);
    setEditingKeyResult(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'on_track':
        return 'processing';
      case 'at_risk':
        return 'warning';
      case 'off_track':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!okr) {
    return <div>OKR not found</div>;
  }

  const keyResultsColumns = [
    {
      title: 'Key Result',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: KeyResult) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <div className="text-gray-500 text-sm">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (_: unknown, record: KeyResult) => {
        const progress = record.currentValue / record.targetValue * 100;
        return <Progress percent={Math.round(progress)} size="small" />;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        switch (status) {
          case 'on_track':
            color = 'green';
            break;
          case 'at_risk':
            color = 'orange';
            break;
          case 'off_track':
            color = 'red';
            break;
          case 'completed':
            color = 'blue';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, record: KeyResult) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditKeyResult(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteKeyResult(record.id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="okr-detail-page">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/okrs')}
        className="mb-4"
      >
        Back to OKRs
      </Button>

      <Card 
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="mb-0">{okr.title}</Title>
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEditOkr}
              >
                Edit OKR
              </Button>
            </Space>
          </div>
        }
        className="mb-6"
      >
        <div className="mb-6">
          <Paragraph>{okr.description}</Paragraph>
          
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }} className="mt-4">
            <Descriptions.Item label="Status">
              <Badge status={getStatusColor(okr.status)} text={okr.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Type">{okr.type}</Descriptions.Item>
            <Descriptions.Item label="Created By">{okr.userId || 'Unassigned'}</Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {new Date(okr.startDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {new Date(okr.endDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Progress">
              <Progress percent={okr.progress} size="small" style={{ width: '80%' }} />
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Tabs defaultActiveKey="key-results">
          <TabPane tab="Key Results" key="key-results">
            <div className="flex justify-end mb-4">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddKeyResult}
              >
                Add Key Result
              </Button>
            </div>
            
            <Table<KeyResult> 
              columns={keyResultsColumns} 
              dataSource={okr.keyResults || []} 
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane tab="Updates" key="updates">
            <List
              itemLayout="vertical"
              dataSource={keyResultUpdates}
              renderItem={(update: KeyResultUpdate) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${update.keyResultId} - ${update.value}%`}
                    description={
                      <>
                        <div>{update.comment}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          Updated on {new Date(update.updatedAt).toLocaleString()}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {showKeyResultForm && (
        <KeyResultForm
          visible={showKeyResultForm}
          onClose={handleKeyResultFormClose}
          okrId={okr.id}
          keyResult={editingKeyResult}
        />
      )}
    </div>
  );
};

export default OkrDetailPage;
