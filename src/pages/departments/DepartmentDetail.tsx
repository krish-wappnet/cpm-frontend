import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Descriptions, Button, Space, message, Divider, Spin } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { Department } from '../../services/departmentService';
import api from '../../services/api';

const { Title, Text } = Typography;

const DepartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await api.get(`/departments/${id}`, {
            params: { include: 'manager' },
          });
          setDepartment(response.data);
        }
      } catch (error) {
        console.error('Error fetching department:', error);
        message.error('Failed to load department details');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-64" />;
  }

  if (!department) {
    return (
      <Card>
        <Title level={4}>Department not found</Title>
        <Link to="/departments">
          <Button type="link" icon={<ArrowLeftOutlined />}>
            Back to Departments
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="department-detail">
      <Space className="mb-6" align="center">
        <Link to="/departments">
          <Button type="text" icon={<ArrowLeftOutlined />} />
        </Link>
        <Title level={2} className="mb-0">
          {department.name}
        </Title>
      </Space>

      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <Title level={4} className="mb-4">
              Department Information
            </Title>
            <Text type="secondary">
              Created on {new Date(department.createdAt).toLocaleDateString()}
            </Text>
          </div>
          <Link to={`/departments/${department.id}/edit`}>
            <Button type="primary" icon={<EditOutlined />}>
              Edit Department
            </Button>
          </Link>
        </div>

        <Divider />

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Department Name">
            {department.name}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {department.description || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Manager">
            {department.manager ? (
              <div>
                <div>{`${department.manager.firstName} ${department.manager.lastName}`}</div>
                <Text type="secondary">{department.manager.email}</Text>
              </div>
            ) : (
              'No manager assigned'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(department.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(department.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default DepartmentDetail;
