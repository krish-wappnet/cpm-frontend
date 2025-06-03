import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  DatePicker, 
  message, 
  Typography, 
  Row, 
  Col, 
  Space, 
  Tag,
} from 'antd';
import { 
  SaveOutlined, 
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { 
  getFeedbackCycleById, 
  createFeedbackCycle, 
  updateFeedbackCycle
} from '../../api/feedbackApi';
import { 
  CycleType, 
  CycleStatus 
} from '../../types/feedback.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const statusColors = {
  [CycleStatus.PLANNED]: 'orange',
  [CycleStatus.ACTIVE]: 'green',
  [CycleStatus.COMPLETED]: 'blue',
  [CycleStatus.CANCELLED]: 'red'
};

const statusIcons = {
  [CycleStatus.PLANNED]: <ClockCircleOutlined />,
  [CycleStatus.ACTIVE]: <CheckCircleOutlined />,
  [CycleStatus.COMPLETED]: <CheckCircleOutlined />,
  [CycleStatus.CANCELLED]: <StopOutlined />
};

interface FeedbackTemplate {
  id: string;
  name: string;
  description?: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'rating' | 'text' | 'multiple_choice';
    options?: string[];
  }>;
}

interface FeedbackCycleFormValues {
  name: string;
  description: string;
  type: CycleType;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  status: CycleStatus;
  feedbackTemplates: {
    questions: string[];
    ratingCategories: string[];
  };
}

const FeedbackCycleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const initialValues = {
    name: '',
    description: '',
    type: CycleType.QUARTERLY,
    startDate: dayjs(),
    endDate: dayjs().add(3, 'months'),
    status: CycleStatus.PLANNED,
    feedbackTemplates: {
      questions: ['', ''],
      ratingCategories: ['Communication', 'Technical Skills', 'Teamwork']
    }
  };

  const onFinish = async (values: FeedbackCycleFormValues) => {
    try {
      setLoading(true);
      
      const feedbackTemplate: FeedbackTemplate = {
        id: 'template-1',
        name: 'Default Template',
        description: 'Default feedback template',
        questions: [
          ...values.feedbackTemplates.questions.map((q, index) => ({
            id: `q-${index}`,
            text: q,
            type: 'text' as const
          })),
          ...values.feedbackTemplates.ratingCategories.map((c, index) => ({
            id: `r-${index}`,
            text: c,
            type: 'rating' as const
          }))
        ]
      };
      
      const payload = {
        name: values.name,
        description: values.description,
        type: values.type.toLowerCase(),
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        status: values.status.toLowerCase(),
        feedbackTemplates: [feedbackTemplate]
      };
      
      if (id) {
        await updateFeedbackCycle(id, payload);
        message.success('Feedback cycle updated successfully');
      } else {
        await createFeedbackCycle(payload);
        message.success('Feedback cycle created successfully');
      }
      
      navigate('/feedback/cycles');
      
    } catch (error: unknown) {
      console.error('Error saving feedback cycle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save feedback cycle';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    const loadFeedbackCycle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getFeedbackCycleById(id);
        
        // Transform the feedback templates data for the form
        const template = data.feedbackTemplates?.[0];
        const questions = template?.questions?.filter(q => q.type === 'text').map(q => q.text) || [''];
        const ratingCategories = template?.questions?.filter(q => q.type === 'rating').map(q => q.text) || ['Communication', 'Technical Skills', 'Teamwork'];
        
        form.setFieldsValue({
          ...data,
          startDate: data.startDate ? dayjs(data.startDate) : dayjs(),
          endDate: data.endDate ? dayjs(data.endDate) : dayjs().add(3, 'months'),
          feedbackTemplates: {
            questions,
            ratingCategories
          }
        });
      } catch (error: unknown) {
        console.error('Error loading feedback cycle:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load feedback cycle';
        message.error(errorMessage);
        // Redirect to cycles list if the cycle is not found
        if (error instanceof Error && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404) {
          navigate('/feedback/cycles');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadFeedbackCycle();
  }, [id, form, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-slide-in">
          <Title level={2} className="text-3xl font-bold text-gray-900 tracking-tight">
            {id ? 'Edit Feedback Cycle' : 'New Feedback Cycle'}
          </Title>
          <Text className="mt-2 text-lg text-gray-600">
            {id ? 'Update the feedback cycle details below' : 'Create a new feedback cycle to gather insights'}
          </Text>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
          className="space-y-8"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                className="bg-white rounded-2xl shadow-xl p-6 animate-slide-in"
                title={<span className="text-xl font-semibold text-gray-900">Cycle Information</span>}
                loading={loading}
              >
                <div className="space-y-6">
                  <Form.Item
                    name="name"
                    label={<span className="text-gray-700 font-semibold">Cycle Name</span>}
                    rules={[{ required: true, message: 'Please enter cycle name' }]}
                  >
                    <Input 
                      placeholder="e.g., Q4 2025 Performance Review" 
                      size="large" 
                      className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </Form.Item>
                
                  <Form.Item
                    name="description"
                    label={<span className="text-gray-700 font-semibold">Description</span>}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Describe the purpose and goals of this feedback cycle..." 
                      className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </Form.Item>
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Form.Item
                      name="startDate"
                      label={<span className="text-gray-700 font-semibold">Start Date</span>}
                      rules={[{ required: true, message: 'Please select start date' }]}
                    >
                      <DatePicker
                        size="large"
                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabledDate={(current) => {
                          const endDate = form.getFieldValue('endDate');
                          return endDate ? current && current > dayjs(endDate) : false;
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="endDate"
                      label={<span className="text-gray-700 font-semibold">End Date</span>}
                      rules={[{ required: true, message: 'Please select end date' }]}
                    >
                      <DatePicker
                        size="large"
                        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabledDate={(current) => {
                          const startDate = form.getFieldValue('startDate');
                          return startDate ? current && current < dayjs(startDate) : false;
                        }}
                      />
                    </Form.Item>
                  </div>
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Form.Item
                      name="type"
                      label={<span className="text-gray-700 font-semibold">Cycle Type</span>}
                      rules={[{ required: true, message: 'Please select type' }]}
                    >
                      <Select 
                        size="large" 
                        placeholder="Select cycle type"
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <Option value={CycleType.QUARTERLY}>Quarterly</Option>
                        <Option value={CycleType.ANNUAL}>Annual</Option>
                        <Option value={CycleType.MONTHLY}>Monthly</Option>
                        <Option value={CycleType.THREE_SIXTY}>360°</Option>
                        <Option value={CycleType.CUSTOM}>Custom</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="status"
                      label={<span className="text-gray-700 font-semibold">Status</span>}
                      rules={[{ required: true, message: 'Please select status' }]}
                    >
                      <Select 
                        size="large" 
                        placeholder="Select status"
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <Option value={CycleStatus.PLANNED}>
                          <Space>
                            <ClockCircleOutlined className="text-orange-500" />
                            <span>Planned</span>
                          </Space>
                        </Option>
                        <Option value={CycleStatus.ACTIVE}>
                          <Space>
                            <CheckCircleOutlined className="text-green-500" />
                            <span>Active</span>
                          </Space>
                        </Option>
                        <Option value={CycleStatus.COMPLETED}>
                          <Space>
                            <CheckCircleOutlined className="text-blue-500" />
                            <span>Completed</span>
                          </Space>
                        </Option>
                        <Option value={CycleStatus.CANCELLED}>
                          <Space>
                            <StopOutlined className="text-red-500" />
                            <span>Cancelled</span>
                          </Space>
                        </Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </Card>
              
              <Card 
                className="mt-6 bg-white rounded-2xl shadow-xl p-6 animate-slide-in"
                title={<span className="text-xl font-semibold text-gray-900">Feedback Questions</span>}
                loading={loading}
              >
                <Form.List name={['feedbackTemplates', 'questions']}>
                  {(fields, { add, remove }) => (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.key} className="flex items-start gap-2">
                          <Form.Item
                            {...field}
                            className="flex-1 mb-0"
                            rules={[
                              { required: true, message: 'Question is required' },
                              { max: 500, message: 'Question cannot exceed 500 characters' }
                            ]}
                          >
                            <Input.TextArea 
                              placeholder={`Enter question ${index + 1}`} 
                              rows={2}
                              className="w-full"
                            />
                          </Form.Item>
                          {fields.length > 1 && (
                            <Button 
                              type="text" 
                              danger 
                              onClick={() => remove(field.name)}
                              icon={<CloseOutlined />}
                              className="mt-1"
                            />
                          )}
                        </div>
                      ))}
                      <Button 
                        type="dashed" 
                        onClick={() => add('')} 
                        block 
                        className="mt-2"
                      >
                        Add Question
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Card>

              <Card 
                className="mt-6 bg-white rounded-2xl shadow-xl p-6 animate-slide-in"
                title={<span className="text-xl font-semibold text-gray-900">Rating Categories</span>}
                loading={loading}
              >
                <Form.List name={['feedbackTemplates', 'ratingCategories']}>
                  {(fields, { add, remove }) => (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.key} className="flex items-center gap-2">
                          <Form.Item
                            {...field}
                            className="flex-1 mb-0"
                            rules={[
                              { required: true, message: 'Category is required' },
                              { max: 100, message: 'Category cannot exceed 100 characters' }
                            ]}
                          >
                            <Input 
                              placeholder={`Category ${index + 1}`} 
                              className="w-full"
                            />
                          </Form.Item>
                          {fields.length > 1 && (
                            <Button 
                              type="text" 
                              danger 
                              onClick={() => remove(field.name)}
                              icon={<CloseOutlined />}
                            />
                          )}
                        </div>
                      ))}
                      <Button 
                        type="dashed" 
                        onClick={() => add('')} 
                        block 
                        className="mt-2"
                      >
                        Add Category
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Card>
              
              <Card 
                className="mt-6 bg-white rounded-2xl shadow-xl p-6 animate-slide-in"
                title={<span className="text-xl font-semibold text-gray-900">Cycle Preview</span>}
                loading={loading}
              >
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Text strong className="text-gray-700">Name:</Text>
                    <Text className="text-gray-900">{form.getFieldValue('name') || 'N/A'}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text strong className="text-gray-700">Type:</Text>
                    <Text className="text-gray-900">{form.getFieldValue('type') || 'N/A'}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text strong className="text-gray-700">Status:</Text>
                    {form.getFieldValue('status') ? (
                      <Tag 
                        color={statusColors[form.getFieldValue('status')]}
                        icon={statusIcons[form.getFieldValue('status')]}
                        className="font-medium"
                      >
                        {form.getFieldValue('status')}
                      </Tag>
                    ) : (
                      <Text className="text-gray-900">N/A</Text>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Text strong className="text-gray-700">Duration:</Text>
                    <Text className="text-gray-900">
                      {form.getFieldValue('startDate') && form.getFieldValue('endDate')
                        ? `${form.getFieldValue('startDate').format('MMM DD, YYYY')} - ${form.getFieldValue('endDate').format('MMM DD, YYYY')}`
                        : 'N/A'}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card 
                className="sticky top-4 bg-white rounded-2xl shadow-xl p-6 animate-slide-in"
                title={<span className="text-xl font-semibold text-gray-900">Actions</span>}
              >
                <Space direction="vertical" size="large" className="w-full">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                    className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 rounded-lg"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    icon={<CloseOutlined />}
                    size="large"
                    className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 rounded-lg"
                  >
                    Cancel
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default FeedbackCycleForm;