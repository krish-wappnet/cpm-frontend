import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchCategories, deleteCategory } from '../../store/slices/kpiSlice';
import { Table, Button, Space, Card, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';



const CategoriesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.kpis);
  const isAdmin = true; // Always enable delete functionality

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Link
          to={`/categories/${record.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span className="text-gray-700">{text || '-'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Link to={`/categories/edit/${record.id}`}>
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-blue-600 hover:text-blue-800 transition-colors border-none shadow-none"
              title="Edit category"
            />
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
            overlayClassName="rounded-lg"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800 transition-colors border-none shadow-none"
              title="Delete category"
              disabled={false}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = async (categoryId: string) => {
    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      message.success('Category deleted successfully');
      // Refresh the categories list
      dispatch(fetchCategories());
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Failed to delete category');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Categories
          </h2>
          {isAdmin && (
            <Link to="/categories/new">
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none rounded-lg shadow-md transition-all transform hover:scale-105 px-4 py-2 h-10 text-base font-semibold text-white"
                icon={<PlusOutlined />}
              >
                Add Category
              </Button>
            </Link>
          )}
        </div>

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} categories`,
                className: "mt-4",
              }}
              className="custom-table"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
              scroll={{ x: "max-content" }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CategoriesListPage;
