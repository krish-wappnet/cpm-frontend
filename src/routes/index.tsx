import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/store";
import { selectAuthUser, selectAuthLoading } from "../store/slices/authSlice";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Auth from "../components/auth/Auth";
import Dashboard from "../pages/Dashboard";
import EmployeesPage from "../pages/employees/EmployeesPage";
import AddEmployeePage from "../pages/employees/AddEmployeePage";
import DepartmentEmployeesPage from "../pages/employees/DepartmentEmployeesPage";
import { KpiListPage, KpiFormPage, KpiDetailPage } from "../pages/kpis";
import {
  DepartmentList,
  DepartmentForm,
  DepartmentDetail,
} from "../pages/departments";
import {
  CategoriesListPage,
  AddCategoryPage,
  EditCategoryPage,
} from "../pages/categories";
import OkrListPage from "../pages/okrs/OkrListPage";
import OkrFormPage from "../pages/okrs/OkrFormPage";
import OkrDetailPage from "../pages/okrs/OkrDetailPage";
import OkrAnalyticsPage from "../pages/okrs/OkrAnalyticsPage";
import NotFound from "../pages/NotFound";

// Feedback Components
import FeedbackList from "../pages/feedback/FeedbackList";
import FeedbackForm from "../pages/feedback/FeedbackForm";
import FeedbackDetail from "../pages/feedback/FeedbackDetail";
import FeedbackCycles from "../pages/feedback/FeedbackCycles";
import AllFeedback from "../pages/feedback/AllFeedback";
import FeedbackCycleForm from "../pages/feedback/FeedbackCycleForm";
import FeedbackRequests from "../pages/feedback/FeedbackRequests";
import FeedbackRequestForm from "../pages/feedback/FeedbackRequestForm";
import FeedbackRequestsAdmin from "../pages/feedback/FeedbackRequestsAdmin";
import KpiAnalyticsPage from "@/pages/kpis/KpiAnalyticsPage";
import FeedbackReceived from "@/pages/feedback/FeedbackReceived";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectAuthLoading);
  const isAuthenticated = !!user;

  console.log('ProtectedRoute - Auth state:', { isAuthenticated, loading, user, path: location.pathname });
  console.log('Allowed roles for this route:', allowedRoles);
  console.log('User roles:', user?.roles);

  if (loading) {
    console.log('Loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route has role restrictions
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
    console.log('Checking roles - User roles:', userRoles, 'Required roles:', allowedRoles, 'Has access:', hasRequiredRole);
    
    if (!hasRequiredRole) {
      console.log('Access denied - Insufficient permissions');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('Access granted');
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* OKR Routes */}
      <Route
        path="/okrs"
        element={
          <ProtectedRoute>
            <Layout>
              <OkrListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/okrs/new"
        element={
          <ProtectedRoute>
            <Layout>
              <OkrFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/okrs/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OkrDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/okrs/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <OkrFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/okr-analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <OkrAnalyticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/department/employees"
        element={
          <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
            <Layout>
              <DepartmentEmployeesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/new"
        element={
          <ProtectedRoute>
            <Layout>
              <AddEmployeePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Category Routes */}
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Layout>
              <CategoriesListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories/new"
        element={
          <ProtectedRoute>
            <Layout>
              <AddCategoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories/edit/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EditCategoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* KPI Routes */}
      <Route
        path="/kpis"
        element={
          <ProtectedRoute>
            <Layout>
              <KpiListPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kpis/new"
        element={
          <ProtectedRoute>
            <Layout>
              <KpiFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kpis/edit/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <KpiFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kpis/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <KpiDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics/kpis"
        element={
          <ProtectedRoute>
            <Layout>
              <KpiAnalyticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />  

      {/* Department Routes */}
      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <Layout>
              <DepartmentList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments/new"
        element={
          <ProtectedRoute>
            <Layout>
              <DepartmentForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <DepartmentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <DepartmentForm isEdit />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Feedback Management */}
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/all"
        element={
          <ProtectedRoute>
            <Layout>
              <AllFeedback />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/new"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Feedback Cycles */}
      <Route
        path="/feedback/cycles"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackCycles />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/cycles/new"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackCycleForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/cycles/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackCycleForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/cycles/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackCycleForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Feedback Received */}
      <Route
        path="/feedback/received"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackReceived />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Feedback Requests */}
      <Route
        path="/feedback/requests"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/requests/new"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackRequestForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/requests/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackRequestForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback/requests"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackRequestsAdmin />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/requests/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <FeedbackRequestForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <NotFound />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
