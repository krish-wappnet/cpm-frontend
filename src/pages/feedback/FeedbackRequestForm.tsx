import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Form, message, Spin, Button, Card, DatePicker, Modal, Space, Typography, Select, Input, Switch } from 'antd';
import { LoadingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '../../services/api';
import { createFeedbackRequest, updateFeedbackRequest } from '../../api/feedbackApi';
import { FeedbackType } from '../../types/feedback.types';
import type { RequestStatus, FeedbackRequestFormData } from '../../types/feedback.types';
 
const { Option } = Select;
 
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}
 
interface FeedbackFormValues {
  type: FeedbackType;
  recipientId: string;
  subjectId: string;
  requesterId: string;
  dueDate: Dayjs;
  message: string;
  status: RequestStatus;
  cycleId?: string;
}
 
const FeedbackRequestForm: React.FC = () => {
  const { user: currentUser, loading: loadingUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<FeedbackFormValues>();
 
  const initialValues: Partial<FeedbackFormValues> = {
    type: FeedbackType.PEER,
    status: 'pending' as RequestStatus,
    recipientId: undefined,
    subjectId: currentUser?.id,
    dueDate: undefined,
    message: '',
    cycleId: undefined
  };
 
  interface FeedbackCycle {
    id: string;
    name: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
    feedbackTemplates: {
      questions: string[];
      ratingCategories: string[];
    } | null;
    createdAt: string;
    updatedAt: string;
  }
 
  const [employees, setEmployees] = useState<User[]>([]);
  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
 
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users', {
        params: {
          page: 1,
          limit: 100
        }
      });
     
      if (response.data?.items) {
        setEmployees(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  const fetchCycles = useCallback(async () => {
    try {
      setIsLoadingCycles(true);
      const response = await api.get('/feedback/cycles', {
        params: {
          page: 1,
          limit: 10
        }
      });
      // Filter active cycles on the client side if needed
      const activeCycles = response.data.items.filter((cycle: FeedbackCycle) => cycle.status === 'active');
      response.data.items = activeCycles;
      if (response.data?.items) {
        setCycles(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching feedback cycles:', error);
      message.error('Failed to load feedback cycles');
    } finally {
      setIsLoadingCycles(false);
    }
  }, []);
 
  useEffect(() => {
    if (currentUser?.id) {
      fetchEmployees();
      fetchCycles();
      form.setFieldsValue({
        subjectId: currentUser.id,
        requesterId: currentUser.id
      });
    }
  }, [currentUser?.id, form, fetchEmployees, fetchCycles]);
 
  const handleSelfFeedbackChange = useCallback((checked: boolean) => {
    if (checked) {
      form.setFieldsValue({
        recipientId: currentUser?.id,
        type: FeedbackType.SELF
      });
    } else {
      form.setFieldsValue({
        recipientId: undefined,
        type: FeedbackType.PEER
      });
    }
  }, [currentUser?.id, form]);
 
  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    navigate('/feedback/requests');
  }, [navigate]);
 
  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);
 
  useEffect(() => {
    if (!id || !currentUser?.id) return;
   
    const fetchRequest = async () => {
      try {
        setIsFormLoading(true);
        const response = await api.get(`/feedback/requests/${id}`);
        const request = response.data;
       
        form.setFieldsValue({
          ...request,
          dueDate: dayjs(request.dueDate)
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading feedback request';
        message.error(errorMessage);
        console.error('Error fetching feedback request:', error);
        navigate('/feedback/requests');
      } finally {
        setIsFormLoading(false);
      }
    };
   
    fetchRequest();
  }, [id, form, navigate, currentUser?.id]);
 
const handleSubmit = useCallback(async (values: FeedbackFormValues) => {
  if (!currentUser?.id) {
    message.error('User not authenticated');
    return;
  }
 
  // Client-side validation for due date
  if (values.dueDate && values.dueDate.isBefore(dayjs())) {
    message.error('Due date must be in the future');
    return;
  }
 
  try {
    setIsLoading(true);
 
    const requestData: FeedbackRequestFormData = {
      type: values.type,
      recipientId: values.recipientId,
      subjectId: values.subjectId,
      dueDate: values.dueDate.toISOString(),
      message: values.message,
      cycleId: values.cycleId,
      isAnonymous: false
    };
 
    if (id) {
      await updateFeedbackRequest(id, { status: values.status });
    } else {
      await createFeedbackRequest(requestData);
    }
 
    message.success(`Feedback request ${id ? 'updated' : 'created'} successfully`);
    navigate('/feedback/requests');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error submitting feedback request';
    message.error(errorMessage);
    console.error('Error submitting feedback request:', error);
  } finally {
    setIsLoading(false);
  }
}, [currentUser?.id, id, navigate]);
 
if (!currentUser) {
  return null;
}
 
  if (loadingUser || isFormLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }
 
  return (
    <div className="feedback-request-form">
      <Card
        title={
          <Typography.Title level={4}>
            {id ? 'Update Feedback Request' : 'New Feedback Request'}
          </Typography.Title>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="type"
            label="Feedback Type"
            rules={[{ required: true, message: 'Please select feedback type' }]}
          >
            <Select placeholder="Select feedback type">
              <Option value="peer">Peer Feedback</Option>
              <Option value="manager">Manager Feedback</Option>
              <Option value="self">Self Feedback</Option>
              <Option value="upward">Upward Feedback</Option>
              <Option value="360">360° Feedback</Option>
            </Select>
          </Form.Item>
 
          <Form.Item
            name="isSelfFeedback"
            label="Request Self-Feedback"
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<UserOutlined />}
              unCheckedChildren={<TeamOutlined />}
              onChange={handleSelfFeedbackChange}
            />
          </Form.Item>
 
          <Form.Item
            name="recipientId"
            label="Recipient"
            rules={[{ required: true, message: 'Please select a recipient' }]}
          >
            <Select
              placeholder="Select a recipient"
              loading={isLoading}
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={isLoading ? <Spin size="small" /> : "No employees found"}
            >
              {employees.map((employee) => {
                const fullName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                const email = employee.email || '';
               
                return (
                  <Option key={employee.id} value={employee.id}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ marginRight: 12 }}>
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={fullName}
                            style={{ width: 24, height: 24, borderRadius: '50%' }}
                          />
                        ) : (
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: '#f0f2f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666'
                          }}>
                            <UserOutlined style={{ fontSize: 12 }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{fullName}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {email}
                          {employee.role && (
                            <span style={{
                              marginLeft: 8,
                              padding: '2px 6px',
                              background: '#f0f2f5',
                              borderRadius: 4,
                              fontSize: 11
                            }}>
                              {employee.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
 
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[
              { required: true, message: 'Please select due date' },
              {
                validator: (_, value) => {
                  if (!value || value.isAfter(dayjs())) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Due date must be in the future'));
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => {
                // Disable dates before today
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>
 
          <Form.Item
            name="cycleId"
            label="Feedback Cycle"
            rules={[{ required: true, message: 'Please select a feedback cycle' }]}
          >
            <Select
              placeholder="Select feedback cycle"
              loading={isLoadingCycles}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const children = option?.children ? String(option.children) : '';
                return children.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {cycles.map((cycle) => {
                const cycleLabel = (
                  <div>
                    <div style={{ fontWeight: 500 }}>{cycle.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                      <span style={{
                        marginLeft: 8,
                        padding: '2px 6px',
                        background: cycle.status === 'active' ? '#e6f7ff' : '#f0f0f0',
                        color: cycle.status === 'active' ? '#1890ff' : '#666',
                        borderRadius: 4,
                        fontSize: 11,
                        textTransform: 'capitalize'
                      }}>
                        {cycle.status}
                      </span>
                    </div>
                  </div>
                );
 
                return (
                  <Option key={cycle.id} value={cycle.id} label={cycle.name}>
                    {cycleLabel}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
 
          <Form.Item
            name="message"
            label="Message to Recipient"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter your message to the recipient" />
          </Form.Item>
 
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {id ? 'Update' : 'Submit'}
              </Button>
              <Button onClick={() => setIsModalVisible(true)} loading={isLoading}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Modal
          title="Cancel Request"
          open={isModalVisible}
          onOk={handleCancel}
          onCancel={handleModalCancel}
          okText="Yes, Cancel"
          cancelText="No, Continue"
        >
          <Typography.Text>
            Are you sure you want to cancel this request? Any unsaved changes will be lost.
          </Typography.Text>
        </Modal>
      </Card>
    </div>
  );
};
 
export default FeedbackRequestForm;
 