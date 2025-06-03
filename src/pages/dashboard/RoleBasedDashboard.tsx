import React from 'react';
import { useAppSelector } from '../../store/store';
import { selectAuthUser } from '../../store/slices/authSlice';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

const RoleBasedDashboard: React.FC = () => {
  const user = useAppSelector(selectAuthUser);

  // If user is not loaded yet, show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check user role and render appropriate dashboard
  if (user.roles?.includes('admin')) {
    return <AdminDashboard />;
  }

  if (user.roles?.includes('manager')) {
    return <ManagerDashboard />;
  }

  // Default to employee dashboard
  return <EmployeeDashboard />;
};

export default RoleBasedDashboard;
