import { create } from 'zustand';
import api from '../lib/api';

interface CategoryBreakdown {
  name: string;
  spent: number;
  budget: number;
  color?: string;
  icon?: string;
}

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  account: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
      color: string;
      icon?: string;
    };
  };
}

interface UpcomingInstance {
  id: string;
  dueDate: string;
  amount: number;
  isOverdue: boolean;
  account: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    category?: {
      id: string;
      name: string;
      color: string;
      icon?: string;
    };
  };
}

interface MonthlyOverview {
  month: number;
  year: number;
  fixed: {
    total: number;
    paid: number;
    pending: number;
    count: number;
  };
  budget: {
    total: number;
    spent: number;
    remaining: number;
    percentage: number;
    count: number;
  };
  financing: {
    total: number;
    paid: number;
    pending: number;
    count: number;
  };
  oneTime: {
    total: number;
    paid: number;
    pending: number;
    count: number;
  };
  monthlyTotal: number;
  categoryBreakdown: CategoryBreakdown[];
  recentTransactions: RecentTransaction[];
  upcomingInstances: UpcomingInstance[];
}

interface YearlyOverview {
  year: number;
  monthlyData: Array<{
    month: number;
    fixedTotal: number;
    budgetTotal: number;
    budgetSpent: number;
    total: number;
  }>;
  yearTotal: number;
}

interface CategoryReport {
  year: number;
  categories: Array<{
    id: string;
    name: string;
    color?: string;
    icon?: string;
    budgetTotal: number;
    spent: number;
    percentage: number;
  }>;
}

interface DashboardState {
  monthlyOverview: MonthlyOverview | null;
  yearlyOverview: YearlyOverview | null;
  categoryReport: CategoryReport | null;
  isLoading: boolean;
  error: string | null;
  fetchMonthlyOverview: (workspaceId: string, year: number, month: number) => Promise<void>;
  fetchYearlyOverview: (workspaceId: string, year: number) => Promise<void>;
  fetchCategoryReport: (workspaceId: string, year: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  monthlyOverview: null,
  yearlyOverview: null,
  categoryReport: null,
  isLoading: false,
  error: null,

  fetchMonthlyOverview: async (workspaceId: string, year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(
        `/workspaces/${workspaceId}/dashboard/monthly?year=${year}&month=${month}`
      );
      set({ monthlyOverview: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch monthly overview',
        isLoading: false
      });
    }
  },

  fetchYearlyOverview: async (workspaceId: string, year: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(
        `/workspaces/${workspaceId}/dashboard/yearly?year=${year}`
      );
      set({ yearlyOverview: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch yearly overview',
        isLoading: false
      });
    }
  },

  fetchCategoryReport: async (workspaceId: string, year: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(
        `/workspaces/${workspaceId}/dashboard/category-report?year=${year}`
      );
      set({ categoryReport: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch category report',
        isLoading: false
      });
    }
  },
}));
