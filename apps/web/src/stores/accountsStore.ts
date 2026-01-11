import { create } from 'zustand';
import api from '../lib/api';

export enum AccountType {
  FIXED = 'FIXED',
  BUDGET = 'BUDGET',
  FINANCING = 'FINANCING',
}

export enum RecurrenceType {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
}

interface Account {
  id: string;
  name: string;
  description?: string;
  type: AccountType;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  color?: string;
  icon?: string;
  isAmountFixed?: boolean;
  fixedAmount?: number;
  dueDay?: number;
  recurrence?: RecurrenceType;
  budgetAmount?: number;
  totalInstallments?: number;
  principalAmount?: number;
  interestRate?: number;
  alertDaysBefore?: number;
  alertBudgetPercent?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    instances: number;
    paidInstances?: number;
  };
}

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: (workspaceId: string, type?: AccountType) => Promise<void>;
  createAccount: (workspaceId: string, data: any) => Promise<void>;
  updateAccount: (workspaceId: string, id: string, data: any) => Promise<void>;
  deleteAccount: (workspaceId: string, id: string) => Promise<void>;
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetchAccounts: async (workspaceId: string, type?: AccountType) => {
    set({ isLoading: true, error: null });
    try {
      const params = type ? { type } : {};
      const { data } = await api.get(`/workspaces/${workspaceId}/accounts`, { params });
      set({ accounts: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch accounts', isLoading: false });
    }
  },

  createAccount: async (workspaceId: string, accountData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/accounts`, accountData);
      set({ accounts: [...get().accounts, data], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create account', isLoading: false });
      throw error;
    }
  },

  updateAccount: async (workspaceId: string, id: string, accountData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}/accounts/${id}`, accountData);
      set({
        accounts: get().accounts.map((a) => (a.id === id ? data : a)),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update account', isLoading: false });
      throw error;
    }
  },

  deleteAccount: async (workspaceId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workspaces/${workspaceId}/accounts/${id}`);
      set({
        accounts: get().accounts.filter((a) => a.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete account', isLoading: false });
      throw error;
    }
  },
}));
