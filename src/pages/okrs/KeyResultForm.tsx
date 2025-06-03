import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Modal, Select, InputNumber, message, Slider } from 'antd';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { 
  createKeyResult, 
  updateKeyResult, 
  fetchOKRById 
} from '../../store/slices/okrSlice';
import type { KeyResult, CreateKeyResultDto, KeyResultType } from '../../types/okr';
import { isAxiosError } from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface KeyResultFormProps {
  visible: boolean;
  onClose: () => void;
  okrId: string;
  keyResult?: KeyResult;
}

interface KeyResultFormValues {
  title: string;
  description?: string;
  type: KeyResultType;
  startValue: string | number;
  targetValue: string | number;
  currentValue: string | number;
  weight: string | number;
  unit: string;
}

const KeyResultForm: React.FC<KeyResultFormProps> = ({
  visible,
  onClose,
  okrId,
  keyResult,
}) => {
  const [form] = Form.useForm<KeyResultFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const isEditing = !!keyResult?.id;

  useEffect(() => {
    if (keyResult) {
      form.setFieldsValue({
        ...keyResult,
        targetValue: keyResult.targetValue?.toString(),
      });
    } else {
      form.resetFields();
    }
  }, [form, keyResult]);

  const handleSubmit = async (values: KeyResultFormValues) => {
    try {
      setSubmitting(true);
      setFormError(null);
      const keyResultData: Omit<CreateKeyResultDto, 'okrId'> = {
        title: values.title,
        description: values.description,
        type: values.type,
        startValue: Number(values.startValue),
        targetValue: Number(values.targetValue),
        currentValue: Number(values.currentValue),
        weight: Number(values.weight),
        unit: values.unit
      };

      if (isEditing && keyResult?.id) {
        await dispatch(updateKeyResult({ id: keyResult.id, data: keyResultData })).unwrap();
        message.success('Key result updated successfully');
      } else {
        await dispatch(createKeyResult({ okrId, data: keyResultData })).unwrap();
        message.success('Key result created successfully');
      }
      await dispatch(fetchOKRById(okrId));
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to save key result';
        setFormError(errorMessage);
      } else {
        const err = error as Error;
        setFormError(err.message || 'Failed to save key result');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`${isEditing ? 'Edit' : 'Add'} Key Result`}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={submitting}
          onClick={() => form.submit()}
        >
          {isEditing ? 'Update' : 'Create'} Key Result
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'Not Started',
          progress: 0,
          targetValue: '100',
          unit: '%',
        }}
        onFinish={handleSubmit}
        onFinishFailed={(error) => {
          console.error('Failed to submit form:', error);
          message.error(error.errorFields[0]?.errors?.[0] || 'Failed to submit form');
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input placeholder="Enter key result title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <TextArea rows={3} placeholder="Enter key result description" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            name="targetValue"
            label="Target Value"
            rules={[{ required: true, message: 'Please input the target value!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Enter target value"
              min={0}
              step={1}
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: 'Please select a unit!' }]}
          >
            <Select placeholder="Select unit">
              <Option value="%">%</Option>
              <Option value="$">$</Option>
              <Option value="#">#</Option>
              <Option value="days">days</Option>
              <Option value="hours">hours</Option>
              <Option value="units">units</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="progress"
            label="Current Progress"
            rules={[{ required: true, message: 'Please input the progress!' }]}
          >
            <Slider
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={1}
              marks={{
                0: '0%',
                50: '50%',
                100: '100%'
              }}
              tooltip={{ formatter: (value: number | undefined) => `${value}%` }}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Select placeholder="Select status">
            <Option value="Not Started">Not Started</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="At Risk">At Risk</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Form.Item>

        {formError && (
          <Form.Item
            name="error"
            rules={[{ required: true, message: formError }]}
          >
            <Input.Password placeholder="Error" disabled />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default KeyResultForm;
