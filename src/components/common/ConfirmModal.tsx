import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonProps?;
  cancelButtonProps?;
  loading?: boolean;
  width?: number | string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonProps = {},
  cancelButtonProps = {},
  loading = false,
  width = 520,
}) => {
  const handleOk = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      title={
        <div className="flex items-center">
          <ExclamationCircleOutlined className="mr-2 text-yellow-500" />
          <span>{title}</span>
        </div>
      }
      onOk={handleOk}
      onCancel={handleCancel}
      width={width}
      footer={[
        <Button key="back" onClick={handleCancel} {...cancelButtonProps}>
          {cancelText}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          loading={loading}
          {...confirmButtonProps}
        >
          {confirmText}
        </Button>,
      ]}
      className="confirm-modal"
    >
      <div className="py-4">
        {typeof content === 'string' ? (
          <p className="mb-0">{content}</p>
        ) : (
          content
        )}
      </div>
    </Modal>
  );
};
