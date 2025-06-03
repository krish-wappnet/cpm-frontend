import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createKeyResultUpdate, 
  clearCurrentKeyResult,
  selectKeyResultById
} from '../../store/slices/okrSlice';
import type { CreateKeyResultUpdateDto } from '../../types/okr';
import { Form, Typography, message, Button, Card, Input } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface KeyResultUpdateFormValues {
  value: number;
  comment: string;
}

const OkrKeyResultUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Form state
  const [form] = Form.useForm<KeyResultUpdateFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get key result data from the store using the selector
  const currentKeyResult = useAppSelector((state) => 
    id ? selectKeyResultById(id)(state) : null
  );
  
  // Get loading and error states
  const { loading, error } = useAppSelector((state) => ({
    loading: state.okrs.loading,
    error: state.okrs.error as string | null,
  }));
  
  // Extract key result properties with defaults
  const { title = 'Key Result', currentValue = 0 } = currentKeyResult || {};

  // Set initial form values when currentKeyResult changes
  useEffect(() => {
    if (currentKeyResult) {
      form.setFieldsValue({ value: currentKeyResult.currentValue });
    }
  }, [currentKeyResult, form]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentKeyResult());
    };
  }, [dispatch]);

  if (loading) {
    return <div>Loading key result data...</div>;
  }

  if (error) {
    return <div>Error loading key result: {error}</div>;
  }

  if (!currentKeyResult) {
    return <div>Key result not found</div>;
  }

  // Handle form submission
  const handleFormSubmit = async (formValues: KeyResultUpdateFormValues) => {
    if (!id) {
      message.error('Key result ID is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: CreateKeyResultUpdateDto = {
        keyResultId: id,
        value: formValues.value,
        comment: formValues.comment || ''
      };

      await dispatch(createKeyResultUpdate(updateData)).unwrap();
      message.success('Key result updated successfully');
      form.resetFields();
    } catch (error) {
      console.error('Failed to update key result:', error);
      message.error('Failed to update key result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="okr-key-result-update-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ marginBottom: '4px' }}>Update Key Result</Title>
          <Text type="secondary">{title}</Text>
        </div>
        <Button 
          type="default" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ value: currentValue }}
        >
          <Form.Item
            label="Current Value"
          >
            <Text strong>{currentValue}</Text>
          </Form.Item>
          
          <Form.Item
            label="New Value"
            name="value"
            rules={[{ 
              required: true, 
              message: 'Please enter a value',
              type: 'number'
            }]}
          >
            <Input 
              type="number" 
              style={{ width: '100%' }}
              placeholder={`Enter new value (current: ${currentValue})`}
            />
          </Form.Item>
          
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ max: 500, message: 'Comment cannot exceed 500 characters' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Add a comment about this update (optional)"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={isSubmitting}
              style={{ marginRight: '8px' }}
            >
              Save Update
            </Button>
            
            <Button 
              onClick={() => form.resetFields()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OkrKeyResultUpdatePage;
