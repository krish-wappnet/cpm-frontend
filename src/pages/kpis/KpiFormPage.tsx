import React, { useState, useEffect} from 'react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { selectAuthUser } from '../../store/slices/authSlice';
import { 
  createKpi, 
  updateKpi, 
  fetchKpiById, 
  fetchCategories,
  createCategory
} from '../../store/slices/kpiSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { KpiType } from '../../types/kpi';
import type { KpiMetric, KpiStatus } from '../../types/kpi';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  InputNumber, 
  Card, 
  Row, 
  Col, 
  Divider, 
  Space, 
  Typography,
} from 'antd';
import { showSuccess, showError, showWarning } from '../../utils/toast';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { isAxiosError } from 'axios';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface KpiFormValues {
  title: string;
  description: string;
  type: KpiType;
  status: KpiStatus;
  userId: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  targetValue: number;
  currentValue: number;
  weight: number;
  metrics?: KpiMetric[];
}

const KpiFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  
  const { loading, categories = [] } = useAppSelector((state) => state.kpis);
  const currentUser = useAppSelector(selectAuthUser);
  const { users: usersResponse, loading: usersLoading } = useAppSelector((state) => state.users);
  const users = usersResponse || [];
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const isEditing = !!id;

  // Fetch categories and users on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchUsers({ page: 1, limit: 100 })); // Fetch first 100 users
  }, [dispatch]);

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        showWarning('Please enter a category name');
        return;
      }
      
      const resultAction = await dispatch(createCategory({
        name: newCategoryName.trim(),
        description: ''
      }));
      
      if (createCategory.fulfilled.match(resultAction)) {
        showSuccess('Category added successfully');
        setNewCategoryName('');
        setIsAddingCategory(false);
        
        // Set the newly created category as selected
        const newCategory = resultAction.payload;
        form.setFieldsValue({ categoryId: newCategory.id });
      } else if (createCategory.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || 'Failed to add category';
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error adding category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add category';
      showError(errorMessage);
    }
  };
  
  // Check if user has admin or manager role
  const isAdminOrManager = currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('manager');
  
  // Removed unused state
  const [kpiType, setKpiType] = useState<KpiType>(KpiType.QUANTITATIVE);
  
  useEffect(() => {
    dispatch(fetchCategories());
    
    if (id) {
      dispatch(fetchKpiById(id))
        .unwrap()
        .then((kpi) => {
          form.setFieldsValue({
            ...kpi,
            startDate: dayjs(kpi.startDate),
            endDate: dayjs(kpi.endDate),
          });
          setKpiType(kpi.type);
        })
        .catch(() => {
          showError('Failed to load KPI');
          navigate('/kpis');
        });
    }
  }, [dispatch, id, form, navigate]);
  
  const onFinish = async (values: KpiFormValues) => {
    try {
      const kpiData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        metrics: values.metrics?.map(m => ({
          name: m.name,
          target: m.target,
          current: 0,
          unit: m.unit
        })) || [],
        status: values.status.toLowerCase() as KpiStatus,
      };
      
      // If userId is not set and current user is not admin, use current user's ID
      if (!kpiData.userId && currentUser) {
        kpiData.userId = currentUser.id;
      }
      
      if (id) {
        await dispatch(updateKpi({ id, data: kpiData })).unwrap();
        showSuccess('KPI updated successfully');
      } else {
        await dispatch(createKpi(kpiData)).unwrap();
        showSuccess('KPI created successfully');
      }
      
      navigate('/kpis');
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to save KPI';
        showError(errorMessage);
      } else {
        const err = error as Error;
        showError(err.message || 'Failed to save KPI');
      }
    }
  };
  
  const onTypeChange = (type: KpiType) => {
    setKpiType(type);
    // Reset metrics when changing type
    if (form.getFieldValue('type') !== type) {
      form.setFieldsValue({ metrics: [] });
    }
  };
  
  const disabledDate = (current: dayjs.Dayjs) => {
    // Can not select days before today
    return current && current < dayjs().startOf('day');
  };
  
  const disabledEndDate = (current: dayjs.Dayjs) => {
    const startDate = form.getFieldValue('startDate');
    if (!startDate) {
      return current && current < dayjs().startOf('day');
    }
    return current && current < startDate.startOf('day');
  };
  

  return (
    <div className="kpi-form-page">
      <Title level={2}>{id ? 'Edit' : 'Create New'} KPI</Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: KpiType.QUANTITATIVE,
            status: 'draft',
            weight: 0,
            targetValue: 0,
            currentValue: 0,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="Enter KPI title" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Assigned To"
                name="userId"
                rules={[{ required: true, message: 'Please select an employee' }]}
              >
                <Select
                  placeholder="Select an employee"
                  loading={usersLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const label = String(option?.children || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {users.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {`${user.firstName} ${user.lastName}`} ({user.roles || 'No Role'})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true }]}
              >
                <Select onChange={onTypeChange}>
                  <Option value={KpiType.QUANTITATIVE}>Quantitative</Option>
                  <Option value={KpiType.QUALITATIVE}>Qualitative</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={3} placeholder="Enter KPI description" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Start Date"
                name="startDate"
                rules={[{ required: true, message: 'Please select a start date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={disabledDate}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                label="End Date"
                name="endDate"
                rules={[{ required: true, message: 'Please select an end date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={disabledEndDate}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true }]}
              >
                <Select>
                  {['draft', 'active', 'completed', 'cancelled'].map((status) => (
                    <Option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Target Value"
                name="targetValue"
                rules={[{ required: true, message: 'Please enter a target value' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                />
              </Form.Item>
            </Col>
            
            {id && (
              <Col xs={24} md={8}>
                <Form.Item
                  label="Current Value"
                  name="currentValue"
                  rules={[{ required: true, message: 'Please enter the current value' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={0} 
                    step={0.01} 
                  />
                </Form.Item>
              </Col>
            )}
            
            <Col xs={24} md={8}>
              <Form.Item
                label="Weight (0-5)"
                name="weight"
                rules={[
                  { required: true, message: 'Please enter a weight' },
                  {
                    validator: (_, value) => {
                      if (value < 0 || value > 5) {
                        return Promise.reject('Weight must be between 0 and 5');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber<number>
                  style={{ width: '100%' }}
                  min={0}
                  max={5}
                  precision={0}
                  step={1}
                  formatter={(value) => `${value}`}
                  parser={(value) => {
                    // Only allow whole numbers
                    const num = parseInt(value?.toString().replace(/\D/g, '') || '0', 10);
                    return isNaN(num) ? 0 : Math.min(5, Math.max(0, num));
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Category"
            name="categoryId"
          >
            <Select 
              placeholder="Select a category" 
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                    {isAddingCategory ? (
                      <Input
                        autoFocus
                        placeholder="Enter category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onPressEnter={handleAddCategory}
                        onBlur={() => {
                          if (!newCategoryName.trim()) {
                            setIsAddingCategory(false);
                          }
                        }}
                        style={{ flex: 'auto' }}
                      />
                    ) : (
                      <Button 
                        type="text" 
                        icon={<PlusOutlined />} 
                        onClick={() => setIsAddingCategory(true)}
                        style={{ width: '100%', textAlign: 'left' }}
                      >
                        Add new category
                      </Button>
                    )}
                  </div>
                </div>
              )}
            >
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {kpiType === KpiType.QUANTITATIVE && (
            <>
              <Divider orientation="left">Metrics</Divider>
              <Form.List name="metrics">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          rules={[{ required: true, message: 'Missing metric name' }]}
                        >
                          <Input placeholder="Metric name" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'target']}
                          rules={[{ required: true, message: 'Missing target' }]}
                        >
                          <InputNumber placeholder="Target" min={0} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'unit']}
                        >
                          <Input placeholder="Unit (optional)" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        Add Metric
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}
          
          {isAdminOrManager && (
            <Form.Item
              label="Assign To"
              name="userId"
              rules={[{ required: true, message: 'Please select a user' }]}
            >
              <Select placeholder="Select a user">
                {users?.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? 'Update' : 'Create'} KPI
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => navigate('/kpis')}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default KpiFormPage;
