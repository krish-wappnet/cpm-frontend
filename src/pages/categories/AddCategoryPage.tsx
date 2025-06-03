import React, { useState } from 'react';
import { useAppDispatch } from '../../store/store';
import { createCategory } from '../../store/slices/kpiSlice';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface CategoryFormValues {
  name: string;
  description?: string;
}

const AddCategoryPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CategoryFormValues) => {
    try {
      setLoading(true);
      await dispatch(createCategory(values)).unwrap();
      message.success('Category created successfully');
      navigate('/categories');
    } catch {
      message.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Add New Category</Title>
      </div>
      
      <Card className="max-w-2xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter category description (optional)" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Category
            </Button>
            <Button 
              type="text" 
              className="ml-2"
              onClick={() => navigate('/categories')}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddCategoryPage;
