import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Select, message, Spin } from 'antd';
import axios from 'axios';
import type { Department } from '../../services/departmentService';
import api from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface DepartmentFormProps {
  isEdit?: boolean;
}

interface DepartmentFormValues {
  name: string;
  description?: string;
  managerId?: string;
}

const DepartmentForm = ({ isEdit = false }: DepartmentFormProps) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position?: string;
    department?: string;
    roles?: string[];
  }>>([]);
  const [, setDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        
        console.log('Current token:', token);
        console.log('User from localStorage:', localStorage.getItem('user'));
        
        if (!token) {
          console.error('No token found in localStorage');
          throw new Error('Authentication required. Please log in again.');
        }
        
        const authAxios = axios.create({
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const response = await authAxios.get('/users', {
          params: {
            page: 1,
            limit: 100
          }
        });
        
        if (response.data && response.data.items) {
          const managers = response.data.items.filter((user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            position?: string;
            department?: string;
            roles?: string[];
          }) => 
            user.roles && user.roles.includes('manager')
          );
          
          setManagers(managers);
          console.log('Managers fetched successfully:', managers);
        } else {
          console.error('Unexpected response format:', response.data);
          throw new Error('Failed to fetch users. Invalid response format.');
        }

        if (isEdit && id) {
          const response = await api.get(`/departments/${id}`, {
            params: { include: 'manager' },
          });
          const department = response.data;
          setDepartment(department);
          form.setFieldsValue({
            name: department.name,
            description: department.description,
            managerId: department.managerId || undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load data', 3);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, form]);

  const onFinish = async (values: DepartmentFormValues) => {
    try {
      setSubmitting(true);
      
      if (isEdit && id) {
        await api.put(`/departments/${id}`, values);
        message.success('Department updated successfully', 3);
      } else {
        await api.post('/departments', values);
        message.success('Department created successfully', 3);
      }
      
      navigate('/departments');
    } catch (error) {
      console.error('Error saving department:', error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} department`, 3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter p-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Department' : 'Create New Department'}
        </h2>
        
        <Card className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all animate-fadeIn p-4 sm:p-6">
          <Spin spinning={loading} tip="Loading data..." className="text-secondary">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ managerId: undefined }}
              className="space-y-6"
            >
              <Form.Item
                name="name"
                label={<span className="text-gray-700 font-medium">Department Name</span>}
                rules={[
                  { required: true, message: <span className="text-red-600 text-sm">Please enter department name</span> },
                  { max: 100, message: <span className="text-red-600 text-sm">Name must be less than 100 characters</span> },
                ]}
                className="space-y-1"
              >
                <Input
                  placeholder="Enter department name"
                  className="border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-secondary focus:ring-offset-1 focus:border-secondary transition-all text-gray-900 placeholder-gray-400 px-4 py-2"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-gray-700 font-medium">Description</span>}
                rules={[
                  { max: 500, message: <span className="text-red-600 text-sm">Description must be less than 500 characters</span> },
                ]}
                className="space-y-1"
              >
                <TextArea
                  rows={4}
                  placeholder="Enter department description"
                  className="border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-secondary focus:ring-offset-1 focus:border-secondary transition-all text-gray-900 placeholder-gray-400 px-4 py-2"
                />
              </Form.Item>

              <Form.Item
                name="managerId"
                label={<span className="text-gray-700 font-medium">Department Manager</span>}
                className="space-y-1"
              >
                <Select
                  showSearch
                  placeholder="Select a manager"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.props.children.props.children[0].props.children as string)
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0 ||
                    (option?.props['data-email'] as string || '').toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                  className="border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-secondary focus:ring-offset-1 focus:border-secondary transition-all text-gray-900 placeholder-gray-400 h-10"
                  dropdownClassName="rounded-lg"
                  optionLabelProp="label"
                >
                  {managers.map((manager) => (
                    <Option 
                      key={manager.id} 
                      value={manager.id}
                      label={`${manager.firstName} ${manager.lastName}`}
                      data-email={manager.email}
                    >
                      <div className="flex flex-col py-1">
                        <div className="font-medium text-gray-900">
                          {manager.firstName} {manager.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {manager.position || 'No position'}
                          {manager.department && ` • ${manager.department}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          {manager.email}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <div className="flex space-x-4">
                  <Button
                    htmlType="submit"
                    loading={submitting}
                    className="bg-black text-white hover:bg-gray-800 border-none rounded-lg shadow-md transition-all transform hover:scale-105 px-4 py-2"
                  >
                    {isEdit ? 'Update' : 'Create'} Department
                  </Button>
                  <Button
                    onClick={() => navigate('/departments')}
                    className="text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg shadow-sm transition-all transform hover:scale-105 px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentForm;