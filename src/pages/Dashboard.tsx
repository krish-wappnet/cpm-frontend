import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logout, selectAuthUser, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import RoleBasedDashboard from './dashboard/RoleBasedDashboard';


const Dashboard: React.FC = () => {
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [dispatch, navigate]);

  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    // Hide the modal if it's showing
    setShowTimeoutModal(false);
    
    // Set a new inactivity timer (30 minutes of inactivity)
    inactivityTimerRef.current = setTimeout(() => {
      // Show the timeout modal
      setShowTimeoutModal(true);
      setTimeLeft(60);
      
      // Start countdown
      countdownTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 30 * 60 * 1000); // 30 minutes
  }, [handleLogout]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetInactivityTimer();
    };
    
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Initialize the timer
    resetInactivityTimer();
    
    // Clean up event listeners and timers
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [user, resetInactivityTimer]);

  // Handle stay logged in
  const handleStayLoggedIn = useCallback(() => {
    setShowTimeoutModal(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 w-full max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <RoleBasedDashboard />
        </div>
      </div>

      {/* Session Timeout Modal */}
      <Modal
        isOpen={showTimeoutModal}
        onClose={() => setShowTimeoutModal(false)}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session Timeout</h3>
          <p className="text-gray-600 mb-4">
            Your session will expire in {timeLeft} seconds due to inactivity.
          </p>
          <p className="text-sm text-gray-500">
            Would you like to stay logged in?
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleStayLoggedIn}
          >
            Stay Logged In
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleLogout}
          >
            Logout Now
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
