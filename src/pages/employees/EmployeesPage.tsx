import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store/store";
import {
  fetchUsers,
  selectUsers,
  selectUsersLoading,
  selectTotalUsers,
  type User,
} from "../../store/slices/userSlice";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;




const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const total = useSelector(selectTotalUsers);

  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchEmployees = useCallback(
    (page: number, pageSize: number) => {
      dispatch(fetchUsers({ page, limit: pageSize }));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchEmployees(1, 10);
  }, [fetchEmployees]);

  const handleTableChange = (tablePagination: {
    current?: number;
    pageSize?: number;
  }) => {
    const currentPage = tablePagination?.current || 1;
    const pageSize = tablePagination?.pageSize || 10;

    setPagination({
      current: currentPage,
      pageSize: pageSize,
    });

    fetchEmployees(currentPage, pageSize);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      position: user.position,
      department: user.department,
      role: user.roles?.[0] || "employee",
    });
    setEditModalVisible(true);
  };

  interface UpdateUserFormValues {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    role: string;
  }

  const handleUpdate = async (values: UpdateUserFormValues) => {
    if (!selectedUser) return;
    try {
      setUpdateLoading(true);
      const updatedUser = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        position: values.position,
        department: values.department,
        roles: [values.role],
      };
      await api.patch(`/users/${selectedUser.id}`, updatedUser);
      message.success("Employee updated successfully", 3);
      setEditModalVisible(false);
      fetchEmployees(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Failed to update employee", 3);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("Employee deleted successfully", 3);
      fetchEmployees(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete employee", 3);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Employee",
      key: "name",
      render: (_: unknown, record: User) => {
        const displayName = `${record.firstName || ""} ${
          record.lastName || ""
        }`.trim();
        return (
          <Link to={`/employees/${record.id}`}>
            <Space>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#2563eb" }}
                className="flex-shrink-0"
              >
                {record.firstName?.[0]?.toUpperCase()}
                {record.lastName?.[0]?.toUpperCase()}
              </Avatar>
              <span className="text-gray-900 font-medium">
                {displayName || record.email}
              </span>
            </Space>
          </Link>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"] as "md"[],
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (position: string) => position || "N/A",
      responsive: ["lg"] as "lg"[],
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string) => department || "N/A",
      responsive: ["lg"] as "lg"[],
    },
    {
      title: "Role",
      key: "role",
      render: (_: unknown, record: User) => {
        const role = (record.roles?.[0] || "employee").toLowerCase();
        const roleColors: Record<string, string> = {
          admin: "red",
          manager: "blue",
          employee: "green",
        };
        return (
          <Tag color={roleColors[role] || "default"} className="font-medium">
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Manager",
      key: "manager",
      render: (_: unknown, record: User) => (
        <span>{record.manager?.name || "N/A"}</span>
      ),
      responsive: ["xl"] as "xl"[],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => {
        return (
          <Space size="small">
           
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit employee"
                onClick={() => handleEdit(record)}
              />
              <Popconfirm
                title="Are you sure you want to delete this employee?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                overlayClassName="rounded-lg"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  className="hover:text-red-800 transition-colors"
                  title="Delete employee"
                />
              </Popconfirm>
            </>
          </Space>
        );
      },
    },
  ];

  const tableData: User[] = Array.isArray(users) ? users : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-blue-900 mb-4 sm:mb-0 tracking-tight">
              Employees
            </h2>
            <Link to="/employees/new">
              <Button
                type="primary"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none rounded-lg shadow-md transition-all transform hover:scale-105 h-10 text-base font-semibold"
              >
                Add Employee
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={Array.isArray(tableData) ? tableData : []}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: total || 0,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} employees`,
                responsive: true,
                pageSizeOptions: ["10", "20", "50"],
              }}
              loading={loading}
              onChange={handleTableChange}
              className="custom-table"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
              scroll={{ x: "max-content" }}
            />
          </div>
        </Card>
      </div>
      <Modal
        title="Edit Employee"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="firstName"
              label={
                <span className="text-gray-700 font-semibold text-sm">
                  First Name
                </span>
              }
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 mr-3" />}
                className="border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 px-4 py-3 text-base"
              />
            </Form.Item>
            <Form.Item
              name="lastName"
              label={
                <span className="text-gray-700 font-semibold text-sm">
                  Last Name
                </span>
              }
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 mr-3" />}
                className="border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 px-4 py-3 text-base"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={
                <span className="text-gray-700 font-semibold text-sm">
                  Email
                </span>
              }
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
              className="md:col-span-2"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 mr-3" />}
                className="border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 px-4 py-3 text-base"
              />
            </Form.Item>
            <Form.Item
              name="position"
              label={
                <span className="text-gray-700 font-semibold text-sm">
                  Position
                </span>
              }
              rules={[{ required: true, message: "Please enter position" }]}
            >
              <Input className="border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 px-4 py-3 text-base" />
            </Form.Item>
            <Form.Item
              name="department"
              label={
                <span className="text-gray-700 font-semibold text-sm">
                  Department
                </span>
              }
              rules={[{ required: true, message: "Please enter department" }]}
            >
              <Input className="border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 px-4 py-3 text-base" />
            </Form.Item>
            <Form.Item
              name="role"
              label={
                <span className="text-gray-700 font-semibold text-sm">
                  Role
                </span>
              }
              rules={[{ required: true, message: "Please select a role" }]}
              className="md:col-span-2"
            >
              <Select
                className="border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 h-12"
                dropdownClassName="rounded-lg shadow-md"
              >
                <Option value="employee">Employee</Option>
                <Option value="manager">Manager</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item className="mt-6">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none rounded-lg shadow-md transition-all transform hover:scale-105 h-10 text-base font-semibold"
              >
                Update Employee
              </Button>
              <Button
                onClick={() => setEditModalVisible(false)}
                className="border-gray-200 rounded-lg shadow-md transition-all h-10 text-base font-semibold"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
