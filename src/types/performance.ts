import type { User } from './user';

export interface PerformanceReview {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  type: 'SELF' | 'MANAGER' | 'PEER' | 'UPWARD';
  reviewee: User;
  reviewer: User;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  createdBy: User;
}

export interface CreatePerformanceReviewDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  revieweeId: string;
  reviewerId: string;
}

export interface UpdatePerformanceReviewDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}
