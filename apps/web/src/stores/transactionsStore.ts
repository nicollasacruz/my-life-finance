import { create } from 'zustand';
import api from '../lib/api';

interface Transaction {
  id: string;
  accountInstanceId: string;
  amount: number;
  description?: string;
  date: string;
  location?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  accountInstance?: {
    id: string;
    year: number;
    month: number;
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
  };
}

interface CreateTransactionData {
  accountInstanceId: string;
  amount: number;
  description?: string;
  date: string;
  location?: string;
  attachmentUrl?: string;
}

interface UpdateTransactionData {
  amount?: number;
  description?: string;
  date?: string;
  location?: string;
  attachmentUrl?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (
    workspaceId: string,
    accountId?: string,
    year?: number,
    month?: number,
  ) => Promise<void>;
  createTransaction: (
    workspaceId: string,
    data: CreateTransactionData,
  ) => Promise<Transaction>;
  updateTransaction: (
    workspaceId: string,
    id: string,
    data: UpdateTransactionData,
  ) => Promise<Transaction>;
  deleteTransaction: (workspaceId: string, id: string) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (
    workspaceId: string,
    accountId?: string,
    year?: number,
    month?: number,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (accountId) params.append('accountId', accountId);
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());

      const { data } = await api.get(
        `/workspaces/${workspaceId}/transactions?${params.toString()}`,
      );
      set({ transactions: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  createTransaction: async (
    workspaceId: string,
    transactionData: CreateTransactionData,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(
        `/workspaces/${workspaceId}/transactions`,
        transactionData,
      );
      set((state) => ({
        transactions: [data, ...state.transactions],
        isLoading: false,
      }));
      return data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create transaction',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTransaction: async (
    workspaceId: string,
    id: string,
    transactionData: UpdateTransactionData,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(
        `/workspaces/${workspaceId}/transactions/${id}`,
        transactionData,
      );
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? data : t)),
        isLoading: false,
      }));
      return data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update transaction',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTransaction: async (workspaceId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workspaces/${workspaceId}/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete transaction',
        isLoading: false,
      });
      throw error;
    }
  },
}));
