// Type definitions for the Redux store

// Define the shape of the entire Redux state
export interface RootState {
  okr: {
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
  };
}

// Define the TopPerformingOkr interface
export interface TopPerformingOkr {
  title: string;
  progress: number;
  description: string;
  dueDate: string;
  status: string;
}

// Define the AppDispatch type for use with useDispatch
export type AppDispatch = (action: { 
  type: string; 
  payload?: unknown 
}) => Promise<unknown> | void;
