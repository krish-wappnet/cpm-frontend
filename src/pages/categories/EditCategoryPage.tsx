import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { updateCategory, fetchCategories } from '../../store/slices/kpiSlice';
import { Form, Input, Button, Card, Typography, message } from 'antd';

const { Title } = Typography;

const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { categories } = useAppSelector((state) => state.kpis);
  const category = categories.find((cat) => cat.id === id);

  useEffect(() => {
    if (!category && id) {
      // If category not found in the store, try to fetch it
      dispatch(fetchCategories());
    }
  }, [category, id, dispatch]);

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description || ''
      });
    }
  }, [category, form]);

  const onFinish = async (values) => {
    if (!id) return;
    
    try {
      setLoading(true);
      await dispatch(updateCategory({
        id,
        name: values.name,
        description: values.description || ''
      })).unwrap();
      
      message.success('Category updated successfully');
      navigate('/categories');
    } catch {
      message.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Edit Category</Title>
      </div>
      
      <Card className="max-w-2xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            name: category.name,
            description: category.description || ''
          }}
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
              Update Category
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

export default EditCategoryPage;
