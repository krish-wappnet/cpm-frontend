export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface FeedbackRatings {
  communication: number;
  teamwork: number;
  technical: number;
  [key: string]: number | undefined;
}

export interface Feedback {
  id: string;
  type: string;
  content: string;
  ratings: FeedbackRatings;
  strengths?: string;
  improvements?: string;
  status: string;
  cycleId: string | null;
  fromUserId: string;
  toUserId: string;
  requestId: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  fromUser: User | null;
  toUser: User | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
