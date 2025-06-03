import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Spin, message, Avatar, Row, Col, Typography } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store/store';
import { selectAuthUser } from '../../store/slices/authSlice';

const { Title, Text } = Typography;
import type { ColumnsType } from 'antd/es/table';
import api from '../../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  roles: string[];
  department: string;
}

const DepartmentEmployeesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<User[]>([]);
  const [departmentName, setDepartmentName] = useState('');
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      try {
        setLoading(true);
        if (user?.department) {
          const response = await api.get(`/users/department/${user.department}`);
          setEmployees(response.data);
          setDepartmentName(user.department);
        }
      } catch (error) {
        console.error('Error fetching department employees:', error);
        message.error('Failed to load department employees');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentEmployees();
  }, [user?.department]);

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            style={{ backgroundColor: '#1890ff' }} 
            icon={<UserOutlined />} 
            className="mr-2"
          />
          <span>{record.firstName} {record.lastName}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <Text type="secondary">{email}</Text>,
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position: string) => <Tag color="blue">{position}</Tag>,
    },
    {
      title: 'Role',
      key: 'roles',
      dataIndex: 'roles',
      render: (roles: string[]) => {
        const isManager = roles.includes('manager');
        const isAdmin = roles.includes('admin');
        return (
          <Tag 
            color={isAdmin ? 'red' : isManager ? 'gold' : 'green'}
            icon={isManager ? <CrownOutlined /> : undefined}
          >
            {isAdmin ? 'ADMIN' : isManager ? 'MANAGER' : 'EMPLOYEE'}
          </Tag>
        );
      },
    },
  ];

  // Separate managers from employees
  const managers = employees.filter(user => user.roles.includes('manager'));
  const regularEmployees = employees.filter(user => !user.roles.includes('manager'));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>
        <div className="flex items-center mb-2">
          <TeamOutlined className="text-2xl mr-2 text-blue-600" />
          <Title level={3} className="!mb-0">
            {departmentName} Department
          </Title>
        </div>
        <Text type="secondary">
          Viewing all team members in the {departmentName} department
        </Text>
      </div>

      {/* Managers Section */}
      {managers.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-50 p-2 rounded-lg mr-3">
              <CrownOutlined className="text-2xl text-yellow-500" />
            </div>
            <div>
              <Title level={3} className="!mb-0">Department Leadership</Title>
              <Text type="secondary">Our dedicated team leads</Text>
            </div>
          </div>
          
          <Row gutter={[24, 24]}>
            {managers.map((manager) => (
              <Col xs={24} sm={12} lg={8} key={manager.id}>
                <Card 
                  hoverable
                  className="relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col"
                  bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  {/* Decorative Header */}
                  <div className="h-2 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                  
                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start mb-4">
                      <div className="relative">
                        <Avatar 
                          size={64} 
                          icon={<UserOutlined />} 
                          className="bg-blue-50 text-blue-600 text-2xl border-2 border-white shadow-sm"
                          style={{ width: 64, height: 64 }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                          <CrownOutlined className="text-white text-xs" />
                        </div>
                      </div>
                      
                      <div className="ml-5 flex-1">
                        <div className="flex items-center justify-between">
                          <Title level={4} className="!mb-1 !text-gray-800">
                            {manager.firstName} {manager.lastName}
                          </Title>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <Tag 
                            color="gold" 
                            className="border-0 font-medium px-3 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#d97706' }}
                          >
                            {manager.roles.includes('admin') ? 'ADMIN' : 'MANAGER'}
                          </Tag>
                        </div>
                        
                        <div className="mb-4">
                          <Text strong className="text-gray-600 block">
                            {manager.position}
                          </Text>
                          <Text type="secondary" className="text-sm">
                            {manager.department} Department
                          </Text>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${manager.email}`} className="hover:text-blue-600 transition-colors">
                          {manager.email}
                        </a>
                      </div>
                      
                      <div className="flex space-x-3 mt-4">
                        <Button 
                          type="primary" 
                          icon={<CrownOutlined />}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 border-0 hover:shadow-md transition-all"
                          href={`mailto:${manager.email}`}
                        >
                          Contact Manager
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Employees Section */}
      <div>
        <Title level={4} className="mb-4">
          <TeamOutlined className="mr-2" />
          Team Members
        </Title>
        <Card>
          <Table 
            columns={columns} 
            dataSource={regularEmployees}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} team members`
            }}
            loading={loading}
            rowClassName={(record) => 
              record.roles.includes('admin') ? 'bg-red-50' : ''
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default DepartmentEmployeesPage;
