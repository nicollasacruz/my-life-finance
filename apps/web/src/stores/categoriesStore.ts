import { create } from 'zustand';
import api from '../lib/api';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  _count?: {
    accounts: number;
  };
}

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (workspaceId: string) => Promise<void>;
  createCategory: (workspaceId: string, data: { name: string; color?: string; icon?: string }) => Promise<void>;
  updateCategory: (workspaceId: string, id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (workspaceId: string, id: string) => Promise<void>;
  seedDefaults: (workspaceId: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/categories`);
      set({ categories: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  createCategory: async (workspaceId: string, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/categories`, categoryData);
      set({ categories: [...get().categories, data], isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create category', isLoading: false });
      throw error;
    }
  },

  updateCategory: async (workspaceId: string, id: string, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}/categories/${id}`, categoryData);
      set({
        categories: get().categories.map((c) => (c.id === id ? data : c)),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update category', isLoading: false });
      throw error;
    }
  },

  deleteCategory: async (workspaceId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workspaces/${workspaceId}/categories/${id}`);
      set({
        categories: get().categories.filter((c) => c.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete category', isLoading: false });
      throw error;
    }
  },

  seedDefaults: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/workspaces/${workspaceId}/categories/seed-defaults`);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to seed categories', isLoading: false });
      throw error;
    }
  },
}));
