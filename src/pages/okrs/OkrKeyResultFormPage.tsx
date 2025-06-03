import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createKeyResult, 
  updateKeyResult, 
  selectKeyResultById,
  clearCurrentKeyResult
} from '../../store/slices/okrSlice';
import type { KeyResultType, KeyResultFormValues } from '../../types/okr';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Select, 
  InputNumber, 
  message,
  Divider,
  Alert
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OkrKeyResultFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams<{ id?: string; okrId?: string }>();
  const { state } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  const okrId = state?.okrId || '';
  
  const { currentKeyResult } = useAppSelector((state) => ({
    currentKeyResult: state.okrs.currentKeyResult,
  }));

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const keyResult = useAppSelector((state) => selectKeyResultById(id)(state));

  useEffect(() => {
    if (isEditing && id && keyResult) {
      dispatch({ type: 'okrs/setCurrentKeyResult', payload: keyResult });
    } else {
      form.setFieldsValue({
        type: 'number',
        startValue: 0,
        currentValue: 0,
        targetValue: 100,
        weight: 1,
      });
    }

    return () => {
      dispatch(clearCurrentKeyResult());
    };
  }, [dispatch, form, id, isEditing, keyResult]);

  useEffect(() => {
    if (isEditing && currentKeyResult) {
      form.setFieldsValue({
        title: currentKeyResult.title,
        description: currentKeyResult.description,
        type: currentKeyResult.type,
        startValue: currentKeyResult.startValue,
        targetValue: currentKeyResult.targetValue,
        currentValue: currentKeyResult.currentValue,
        weight: currentKeyResult.weight || 1,
      });
    }
  }, [currentKeyResult, form, isEditing]);

  const handleSubmit = async (values: KeyResultFormValues) => {
    try {
      setSubmitting(true);
      setFormError('');
      
      const keyResultData = {
        ...values,
        okrId: isEditing ? currentKeyResult?.okrId : okrId,
      };

      if (isEditing && id) {
        await dispatch(updateKeyResult({ id, data: keyResultData })).unwrap();
        message.success('Key result updated successfully');
      } else {
        const { okrId, ...data } = keyResultData;
        await dispatch(createKeyResult({ 
          okrId: okrId as string, 
          data: { ...data, unit: data.type === 'currency' ? 'USD' : data.type === 'percentage' ? '%' : 'units' }
        })).unwrap();
        message.success('Key result created successfully');
      }
      
      navigate(-1);
    } catch (error) {
      const err = error as Error;
      console.error('Failed to save key result:', err);
      setFormError(err.message || 'Failed to save key result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (type: KeyResultType) => {
    // Reset values when type changes
    form.setFieldsValue({
      startValue: 0,
      currentValue: 0,
      targetValue: type === 'percentage' ? 100 : 1,
    });
  };

  return (
    <div className="okr-key-result-form-page">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Back
      </Button>

      <Title level={3} className="mb-6">
        {isEditing ? 'Edit Key Result' : 'Create New Key Result'}
      </Title>

      {formError && (
        <Alert
          message="Error"
          description={formError}
          type="error"
          showIcon
          className="mb-6"
          closable
          onClose={() => setFormError('')}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'number',
            startValue: 0,
            currentValue: 0,
            targetValue: 1,
            weight: 1,
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter key result title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select onChange={handleTypeChange}>
              <Option value="number">Number</Option>
              <Option value="percentage">Percentage</Option>
              <Option value="currency">Currency</Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="startValue"
              label="Start Value"
              rules={[{ required: true, message: 'Please enter start value' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                step={form.getFieldValue('type') === 'currency' ? 0.01 : 1}
              />
            </Form.Item>

            <Form.Item
              name="currentValue"
              label="Current Value"
              rules={[{ required: true, message: 'Please enter current value' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                step={form.getFieldValue('type') === 'currency' ? 0.01 : 1}
              />
            </Form.Item>

            <Form.Item
              name="targetValue"
              label="Target Value"
              rules={[{ 
                required: true, 
                message: 'Please enter target value',
              },{
                validator: (_, value) => {
                  const startValue = form.getFieldValue('startValue');
                  if (value <= startValue) {
                    return Promise.reject('Target value must be greater than start value');
                  }
                  return Promise.resolve();
                },
              }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                step={form.getFieldValue('type') === 'currency' ? 0.01 : 1}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="weight"
            label={
              <span>
                Weight <Text type="secondary">(1-10, higher means more important)</Text>
              </span>
            }
            initialValue={1}
            rules={[
              { required: true, message: 'Please enter weight' },
              { type: 'number', min: 1, max: 10, message: 'Weight must be between 1 and 10' },
            ]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Divider />

          <div className="flex justify-end gap-4">
            <Button onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              icon={<SaveOutlined />}
            >
              {isEditing ? 'Update' : 'Create'} Key Result
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default OkrKeyResultFormPage;
