import { create } from 'zustand';
import type { User } from '@my-life-finance/shared-types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
