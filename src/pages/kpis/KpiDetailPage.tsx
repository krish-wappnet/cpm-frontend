import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  fetchKpiById, 
  fetchKpiUpdates, 
  addKpiUpdate,
  deleteKpi 
} from '../../store/slices/kpiSlice';
import type { KpiUpdate } from '../../types/kpi';
import { KpiStatus } from '../../types/kpi';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Divider, 
  List, 
  Avatar, 
  Tooltip, 
  Form, 
  Input, 
  InputNumber, 
  message, 
  Popconfirm, 
  Progress, 
  Row, 
  Col, 
  Statistic,
  Descriptions
} from 'antd';
import { Comment as AntdComment } from '@ant-design/compatible';
import { 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { selectAuthUser } from '../../store/slices/authSlice';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TextArea } = Input;

const KpiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    throw new Error('KPI ID is required');
  }
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  
  const { currentKpi, kpiUpdates, loading } = useAppSelector((state) => ({
    currentKpi: state.kpis.currentKpi,
    kpiUpdates: state.kpis.kpiUpdates,
    loading: state.kpis.loading,
  }));
  
  const currentUser = useAppSelector(selectAuthUser);
  
  // Check if user has admin or manager role
  const isAdminOrManager = currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('manager');
  // Removed unused state
  
  useEffect(() => {
    if (id) {
      dispatch(fetchKpiById(id));
      dispatch(fetchKpiUpdates(id));
    }
  }, [dispatch, id]);
  
  const handleUpdateKpi = () => {
    if (id) {
      navigate(`/kpis/edit/${id}`);
    }
  };
  
  const handleDeleteKpi = async () => {
    if (id) {
      try {
        await dispatch(deleteKpi(id)).unwrap();
        message.success('KPI deleted successfully');
        navigate('/kpis');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete KPI';
        message.error(errorMessage);
      }
    }
  };
  
  const onFinish = async (values: { value: number; notes?: string }) => {
    if (!id) return;
    
    try {
      await dispatch(
        addKpiUpdate({
          kpiId: id,
          value: values.value,
          notes: values.notes,
        })
      ).unwrap();
      
      message.success('Update added successfully');
      form.resetFields();
      
      // Refresh KPI data
      dispatch(fetchKpiById(id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add update';
      message.error(errorMessage);
    }
  };
  
  if (!currentKpi) {
    return <div>Loading...</div>;
  }
  
  const progress = Math.min(
    Math.round(((currentKpi.currentValue || 0) / (currentKpi.targetValue || 1)) * 100),
    100
  );
  
  const progressStatus = progress >= 100 ? 'success' : 'active' as const;
  const isOverdue = dayjs(currentKpi.endDate).isBefore(dayjs()) && progress < 100 && currentKpi.status !== KpiStatus.COMPLETED;
  
  return (
    <div className="kpi-detail-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>{currentKpi.title}</Title>
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={handleUpdateKpi}
            disabled={!isAdminOrManager}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this KPI?"
            onConfirm={handleDeleteKpi}
            okText="Yes"
            cancelText="No"
            disabled={!isAdminOrManager}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              disabled={!isAdminOrManager}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      </div>
      
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Title level={4} style={{ marginBottom: 24 }}>Details</Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Description">
                {currentKpi.description || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag 
                  color={
                    currentKpi.status === KpiStatus.ACTIVE 
                      ? 'blue' 
                      : currentKpi.status === KpiStatus.COMPLETED 
                        ? 'green' 
                        : 'default'
                  }
                >
                  {currentKpi.status.toUpperCase()}
                </Tag>
                {isOverdue && <Tag color="red">OVERDUE</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {currentKpi.categoryId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {currentKpi.type.charAt(0).toUpperCase() + currentKpi.type.slice(1)}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {currentKpi.userId || 'Unassigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {currentKpi.createdById || 'System'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {dayjs(currentKpi.createdAt).format('MMM D, YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          
          <Col xs={24} md={12}>
            <Title level={4} style={{ marginBottom: 24 }}>Progress</Title>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Progress: {progress}%</Text>
                <Text>
                  {currentKpi.currentValue || 0} / {currentKpi.targetValue}
                </Text>
              </div>
              <Progress 
                percent={progress} 
                status={progressStatus}
                strokeColor={progress >= 100 ? '#52c41a' : undefined}
                format={() => `${progress}%`}
              />
            </div>
            
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Start Date"
                    value={dayjs(currentKpi.startDate).format('MMM D, YYYY')}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="End Date"
                    value={dayjs(currentKpi.endDate).format('MMM D, YYYY')}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Days Remaining"
                    value={Math.max(0, dayjs(currentKpi.endDate).diff(dayjs(), 'day'))}
                    valueStyle={{ color: isOverdue ? '#cf1322' : undefined }}
                    prefix={isOverdue ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                    suffix="days"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Weight"
                    value={currentKpi.weight}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      
      {currentKpi.type === 'quantitative' && currentKpi.metrics?.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Metrics</Title>
          <Row gutter={[16, 16]}>
            {currentKpi.metrics.map((metric, index) => (
              <Col xs={24} md={8} key={index}>
                <Card size="small" title={metric.name}>
                  <div style={{ marginBottom: 8 }}>
                    <Text>Target: {metric.target} {metric.unit || ''}</Text>
                  </div>
                  <Progress 
                    percent={Math.min(
                      Math.round(((metric.current || 0) / (metric.target || 1)) * 100),
                      100
                    )} 
                    status="active" 
                    showInfo={true}
                    format={(percent) => `${percent}%`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
      
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>Add Update</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                name="value"
                label="Current Value"
                rules={[{ required: true, message: 'Please enter the current value' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  max={currentKpi.targetValue ? currentKpi.targetValue * 1.5 : undefined}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={18}>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <TextArea rows={2} placeholder="Add any additional notes about this update" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={[KpiStatus.COMPLETED, KpiStatus.CANCELLED].includes(currentKpi.status)}
            >
              Add Update
            </Button>
          </Form.Item>
        </Form>
        
        <Divider>Update History</Divider>
        
        <List
          itemLayout="horizontal"
          dataSource={kpiUpdates}
          loading={loading}
          renderItem={(update: KpiUpdate) => (
            <AntdComment
              author={update.createdById || 'System'}
              avatar={
                <Avatar 
                  icon={<UserOutlined />} 
                  src={update.createdById ? `https://i.pravatar.cc/150?u=${update.createdById}` : undefined}
                />
              }
              content={
                <div>
                  <p>Updated value to: <strong>{update.value}</strong></p>
                  {update.notes && <p>{update.notes}</p>}
                </div>
              }
              datetime={
                <Tooltip title={dayjs(update.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                  <span>{dayjs(update.createdAt).fromNow()}</span>
                </Tooltip>
              }
            />
          )}
        />
      </Card>
    </div>
  );
};

export default KpiDetailPage;
