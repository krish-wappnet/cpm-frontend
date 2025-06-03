import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store, persistor, useAppDispatch } from './store/store';
import AppRoutes from './routes';
import { loadUser } from './store/slices/authSlice';
import api from './services/api';

// Auth Initialization Component
const AuthInitializer: React.FC<{ onInitialized: () => void }> = ({ onInitialized }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthInitializer useEffect running');
    const initAuth = async () => {
      console.log('initAuth started');
      try {
        // Check for existing token in localStorage
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'exists' : 'does not exist');
        
        if (token) {
          // Set the token in the API headers before loading user
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          console.log('Dispatching loadUser...');
          const resultAction = await dispatch(loadUser());
          console.log('loadUser result:', resultAction);
          
          // If loading user fails, clear the token
          if (loadUser.rejected.match(resultAction)) {
            console.log('loadUser failed, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            navigate('/login');
          }
        } else {
          console.log('No token, not loading user');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        console.log('Auth initialization complete');
        onInitialized();
      }
    };

    initAuth();
  }, [dispatch, navigate, onInitialized]);

  return null; // This component doesn't render anything
};

// App Content Component
const AppContent: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

// Main App component
const App: React.FC = () => {
  console.log('App component rendering');
  const [appReady, setAppReady] = React.useState(false);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AuthInitializer onInitialized={() => setAppReady(true)} />
          {appReady ? <AppContent /> : (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;