import { create } from 'zustand';
import api from '../lib/api';

export enum InstanceStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  EXEMPT = 'EXEMPT',
}

interface AccountInstance {
  id: string;
  accountId: string;
  year: number;
  month: number;
  dueDate: string;
  amount?: number;
  paidAmount?: number;
  status: InstanceStatus;
  paidAt?: string;
  notes?: string;
  isOverdue: boolean;
  account: {
    id: string;
    name: string;
    type: string;
    color?: string;
    icon?: string;
    category?: {
      id: string;
      name: string;
      color: string;
      icon?: string;
    };
  };
}

interface DashboardStats {
  total: number;
  paid: number;
  open: number;
  overdue: number;
  exempt: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

interface InstancesState {
  instances: AccountInstance[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchInstances: (workspaceId: string, year?: number, month?: number) => Promise<void>;
  fetchStats: (workspaceId: string, year?: number, month?: number) => Promise<void>;
  generateInstances: (workspaceId: string, year?: number, month?: number) => Promise<void>;
  markPaid: (workspaceId: string, id: string, confirmedAmount?: number, paidAt?: string) => Promise<void>;
  markExempt: (workspaceId: string, id: string) => Promise<void>;
  reopen: (workspaceId: string, id: string) => Promise<void>;
  updateInstance: (workspaceId: string, id: string, data: any) => Promise<void>;
}

export const useInstancesStore = create<InstancesState>((set, get) => ({
  instances: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchInstances: async (workspaceId: string, year?: number, month?: number) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const { data } = await api.get(`/workspaces/${workspaceId}/account-instances`, { params });
      set({ instances: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch instances', isLoading: false });
    }
  },

  fetchStats: async (workspaceId: string, year?: number, month?: number) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const { data } = await api.get(`/workspaces/${workspaceId}/account-instances/stats`, { params });
      set({ stats: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch stats', isLoading: false });
    }
  },

  generateInstances: async (workspaceId: string, year?: number) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (year) params.year = year;
      await api.post(`/workspaces/${workspaceId}/account-instances/generate`, {}, { params });
      // Re-fetch instances after generation
      const now = new Date();
      await get().fetchInstances(workspaceId, year || now.getFullYear(), now.getMonth() + 1);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to generate instances', isLoading: false });
      throw error;
    }
  },

  markPaid: async (workspaceId: string, id: string, confirmedAmount?: number, paidAt?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/account-instances/${id}/mark-paid`, {
        confirmedAmount,
        paidAt,
      });
      set({
        instances: get().instances.map((i) => (i.id === id ? data : i)),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark as paid', isLoading: false });
      throw error;
    }
  },

  markExempt: async (workspaceId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/account-instances/${id}/mark-exempt`);
      set({
        instances: get().instances.map((i) => (i.id === id ? data : i)),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark as exempt', isLoading: false });
      throw error;
    }
  },

  reopen: async (workspaceId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/account-instances/${id}/reopen`);
      set({
        instances: get().instances.map((i) => (i.id === id ? data : i)),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to reopen instance', isLoading: false });
      throw error;
    }
  },

  updateInstance: async (workspaceId: string, id: string, instanceData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}/account-instances/${id}`, instanceData);
      set({
        instances: get().instances.map((i) => (i.id === id ? data : i)),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update instance', isLoading: false });
      throw error;
    }
  },
}));
