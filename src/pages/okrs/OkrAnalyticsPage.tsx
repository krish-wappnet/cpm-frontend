import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { Card, Row, Col, Typography, Progress, Spin, message } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  BarChartOutlined
} from '@ant-design/icons';

// ===== Types =====
// Data interfaces
interface TopPerformingOkr {
  title: string;
  progress: number;
  description: string;
  dueDate: string;
  status: string;
}

interface UserProgress {
  activeOkrs: number;
  averageProgress: number;
  atRisk?: number;
  topPerformingOkr: TopPerformingOkr | null;
}

interface CompletionRate {
  total: number;
  completed: number;
  rate: number;
}

// Redux state interfaces
interface OkrState {
  completionRate?: {
    total: number;
    completed: number;
    rate: number;
  };
  userProgress?: {
    activeOkrs: number;
    averageProgress: number;
    atRisk?: number;
    topPerformingOkr: TopPerformingOkr | null;
  };
}

interface RootState {
  okr: OkrState;
}

// Action types
const FETCH_COMPLETION_RATE = 'okr/fetchCompletionRate';
const FETCH_USER_PROGRESS = 'okr/fetchUserProgress';

// Action interfaces
interface FetchCompletionRateAction {
  type: typeof FETCH_COMPLETION_RATE;
}

interface FetchUserProgressAction {
  type: typeof FETCH_USER_PROGRESS;
  payload: { userId: string };
}

type OkrAction = FetchCompletionRateAction | FetchUserProgressAction;

// ===== Redux Setup =====
// Define thunk action type
type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  OkrAction
>;

// Define AppDispatch type that works with thunks
type AppDispatch = ThunkDispatch<RootState, unknown, OkrAction>;

// Create typed hooks
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// ===== Selectors =====
const selectCompletionRate = (state: RootState): CompletionRate => ({
  total: state.okr?.completionRate?.total ?? 0,
  completed: state.okr?.completionRate?.completed ?? 0,
  rate: state.okr?.completionRate?.rate ?? 0,
});

const selectUserProgress = (state: RootState): UserProgress => ({
  activeOkrs: state.okr?.userProgress?.activeOkrs ?? 0,
  averageProgress: state.okr?.userProgress?.averageProgress ?? 0,
  atRisk: state.okr?.userProgress?.atRisk ?? 0,
  topPerformingOkr: state.okr?.userProgress?.topPerformingOkr ?? null,
});

// ===== Action Creators =====
const fetchCompletionRate = (): AppThunk<void> => {
  return async (dispatch) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      const action: FetchCompletionRateAction = {
        type: FETCH_COMPLETION_RATE
      };
      dispatch(action);
    } catch (error) {
      const err = error as Error;
      console.error('Failed to fetch completion rate:', err);
      message.error('Failed to load completion rate data');
    }
  };
};

const fetchUserProgress = (payload: { userId: string }): AppThunk<void> => {
  return async (dispatch) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      const action: FetchUserProgressAction = {
        type: FETCH_USER_PROGRESS,
        payload
      };
      dispatch(action);
    } catch (error) {
      const err = error as Error;
      console.error('Failed to fetch user progress:', err);
      message.error('Failed to load user progress data');
    }
  };
};

const { Title, Text } = Typography;

const OkrAnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const completionRate = useTypedSelector(selectCompletionRate);
  const userProgress = useTypedSelector(selectUserProgress);
  
  // Ensure completionRate has all required properties with defaults
  const safeCompletionRate: CompletionRate = {
    total: completionRate?.total ?? 0,
    completed: completionRate?.completed ?? 0,
    rate: completionRate?.rate ?? 0
  };
  
  const defaultTopPerformingOkr: TopPerformingOkr = {
    title: 'No OKR data',
    progress: 0,
    description: 'No top performing OKR data available',
    dueDate: '',
    status: ''
  };

  // Create safe user progress with defaults
  const safeUserProgress: UserProgress = {
    activeOkrs: userProgress.activeOkrs,
    averageProgress: userProgress.averageProgress,
    atRisk: userProgress.atRisk,
    topPerformingOkr: userProgress.topPerformingOkr ?? defaultTopPerformingOkr
  };
  
  // This will always have a value due to the fallback above
  const safeTopPerformingOkr = safeUserProgress.topPerformingOkr ?? defaultTopPerformingOkr;

  useEffect(() => {
    const loadData = () => {
      // Dispatch actions sequentially to avoid race conditions
      dispatch(fetchCompletionRate());
      dispatch(fetchUserProgress({ userId: 'current' }));
    };
    
    loadData();
  }, [dispatch]);

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => {
    let styledIcon = icon;
    if (React.isValidElement(icon)) {
      const iconProps = { 
        style: { 
          color, 
          fontSize: '20px',
          ...(icon.props as { style?: React.CSSProperties })?.style 
        } 
      };
      styledIcon = React.cloneElement(icon, iconProps);
    }
    
    return (
      <Card className="shadow-sm">
        <div className="flex items-center">
          <div 
            className="mr-4 p-3 rounded-full" 
            style={{ backgroundColor: `${color}20` }}
          >
            {styledIcon}
          </div>
          <div>
            <Text type="secondary" className="block text-sm">{title}</Text>
            <Title level={3} className="mt-1 mb-0" style={{ color }}>{value}</Title>
          </div>
        </div>
      </Card>
    );
  };

  const renderChartPlaceholder = (title: string, icon: React.ReactNode) => (
    <Card title={title}>
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-4xl text-gray-300 mb-4">
          {icon}
        </div>
        <Text type="secondary">Chart visualization coming soon</Text>
      </div>
    </Card>
  );

  if (!safeUserProgress) {
    return <Spin size="large" className="flex items-center justify-center h-64" />;
  }

  const { activeOkrs, averageProgress, atRisk } = safeUserProgress;
  const { completed } = safeCompletionRate;
  const okrsAtRisk = atRisk !== undefined ? atRisk : 0;
  return (
    <div className="okr-analytics-page">
      <Title level={3} className="mb-6">OKR Analytics</Title>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            'Active OKRs', 
            activeOkrs,
            <BarChartOutlined />,
            '#1890ff'
          )}
        </Col>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            'Avg. Progress', 
            `${averageProgress}%`,
            <CheckCircleOutlined />,
            '#52c41a'
          )}
        </Col>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            'Completion Rate', 
            `${completed}%`,
            <CheckCircleOutlined />,
            '#722ed1'
          )}
        </Col>
        <Col xs={24} sm={12} md={6}>
          {renderStatCard(
            'At Risk', 
            okrsAtRisk,
            <ExclamationCircleOutlined />,
            '#faad14'
          )}
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          {renderChartPlaceholder('OKR Progress', <BarChartOutlined />)}
        </Col>
        <Col xs={24} lg={12}>
          {renderChartPlaceholder('Completion Trend', <BarChartOutlined />)}
        </Col>
      </Row>

      <Card title="Top Performing OKR" className="mb-6">
        <div>
          <Title level={5} className="mb-2">{safeTopPerformingOkr.title}</Title>
          <Text type="secondary" className="block mb-4">
            {safeTopPerformingOkr.description}
          </Text>
          <div className="flex items-center">
            <div className="flex-1">
              <Progress 
                percent={safeTopPerformingOkr.progress} 
                status={safeTopPerformingOkr.progress === 100 ? 'success' : 'active'}
              />
            </div>
            <Text strong className="ml-4">
              {safeTopPerformingOkr.progress}% Complete
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OkrAnalyticsPage;
