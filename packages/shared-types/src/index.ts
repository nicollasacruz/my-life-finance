// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Workspace types
export type WorkspaceType = 'PERSONAL' | 'HOUSEHOLD' | 'BUSINESS';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  description?: string;
  avatarUrl?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  user?: User;
  joinedAt: Date;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: MemberRole;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
}

// Category types
export interface Category {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  icon?: string;
}

// Account types
export type AccountType = 'FIXED' | 'BUDGET';
export type RecurrenceType = 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';
export type FixedAccountStatus = 'OPEN' | 'PAID' | 'EXEMPT';

export interface Account {
  id: string;
  workspaceId: string;
  categoryId?: string;
  category?: Category;
  name: string;
  description?: string;
  type: AccountType;
  icon?: string;
  color?: string;
  // FIXED specific
  isAmountFixed: boolean;
  fixedAmount?: number;
  dueDay?: number;
  recurrence: RecurrenceType;
  // BUDGET specific
  budgetAmount?: number;
  // Alerts
  alertDaysBefore: number;
  alertBudgetPercent: number;
  // Status
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountInstance {
  id: string;
  accountId: string;
  account?: Account;
  year: number;
  month: number;
  // FIXED
  amount?: number;
  dueDate?: Date;
  status: FixedAccountStatus;
  paidAt?: Date;
  paidAmount?: number;
  // BUDGET
  budgetAmount?: number;
  // Computed (not stored)
  isOverdue?: boolean;
  totalSpent?: number;
  // Meta
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountInstanceId: string;
  amount: number;
  description?: string;
  date: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard types
export interface FixedSummary {
  totalConfirmed: number;
  totalEstimated: number;
  totalPaid: number;
  totalOpen: number;
  overdueCount: number;
  pendingConfirmationCount: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  overBudgetCount: number;
}

export interface DashboardData {
  fixed: FixedSummary;
  budget: BudgetSummary;
  upcomingDue: AccountInstance[];
  recentTransactions: Transaction[];
}

// Notification types
export type NotificationType =
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'BUDGET_WARNING'
  | 'BUDGET_EXCEEDED'
  | 'INVITE_RECEIVED'
  | 'MEMBER_JOINED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
