import type { User as BaseUser } from "./user";

export interface User
  extends Omit<BaseUser, "position" | "department" | "jobTitle"> {
  fullName?: string;
  position?: string;
  department?: string;
  jobTitle?: string;
  [key: string]: unknown;
}

export type { BaseUser };

export enum FeedbackType {
  PEER = "peer",
  MANAGER = "manager",
  SELF = "self",
  UPWARD = "upward",
  THREE_SIXTY = "360",
}

export enum FeedbackStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  ACKNOWLEDGED = "acknowledged",
}

export enum CycleStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum CycleType {
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  MONTHLY = "monthly",
  CUSTOM = "custom",
  THREE_SIXTY = "360",
}

export type RequestStatus = "pending" | "completed" | "declined" | "expired";

export interface Feedback {
  id: string;
  type: FeedbackType;
  content: string;
  ratings: Record<string, number>;
  strengths?: string;
  improvements?: string;
  status: FeedbackStatus;
  cycleId?: string;
  fromUser: User;
  fromUserId: string;
  toUser: User;
  toUserId: string;
  requestId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCycle {
  id: string;
  name: string;
  description?: string;
  type: CycleType;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  feedbackTemplates?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackRequest {
  id: string;
  type: FeedbackType;
  message?: string;
  dueDate: string;
  status: RequestStatus;
  requester: User;
  requesterId: string;
  recipient: User;
  recipientId: string;
  subject: User;
  subjectId: string;
  cycleId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback360Summary {
  averageRatings: Record<string, number>;
  strengthsSummary: string[];
  improvementsSummary: string[];
  feedbackCount: number;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  completed: number;
  categories: Record<string, number>;
}

export interface FeedbackFormData {
  type: FeedbackType;
  content: string;
  ratings: Record<string, number>;
  strengths?: string;
  improvements?: string;
  toUserId: string;
  cycleId?: string;
  isAnonymous: boolean;
}

export interface FeedbackCycleFormData {
  name: string;
  description?: string;
  type: CycleType;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  feedbackTemplates?: unknown;
}

export interface FeedbackRequestFormData {
  type: FeedbackType;
  message?: string;
  dueDate: string;
  recipientId: string;
  subjectId: string;
  cycleId?: string;
  isAnonymous: boolean;
}
