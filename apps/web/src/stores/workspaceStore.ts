import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '@my-life-finance/shared-types';
import { api } from '@/lib/api';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (data: {
    name: string;
    slug: string;
    type?: string;
    description?: string;
  }) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/workspaces');
          set({ workspaces: data, isLoading: false });

          // If no active workspace, set the first one
          if (!get().activeWorkspace && data.length > 0) {
            set({ activeWorkspace: data[0] });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setActiveWorkspace: (workspace: Workspace) => {
        set({ activeWorkspace: workspace });
      },

      createWorkspace: async (data) => {
        const { data: workspace } = await api.post('/workspaces', data);
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspace: workspace,
        }));
        return workspace;
      },

      updateWorkspace: async (id, data) => {
        const { data: updated } = await api.patch(`/workspaces/${id}`, data);
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
          activeWorkspace: state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
        }));
      },

      deleteWorkspace: async (id) => {
        await api.delete(`/workspaces/${id}`);
        set((state) => {
          const filtered = state.workspaces.filter((w) => w.id !== id);
          return {
            workspaces: filtered,
            activeWorkspace: state.activeWorkspace?.id === id ? filtered[0] || null : state.activeWorkspace,
          };
        });
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ activeWorkspace: state.activeWorkspace }),
    }
  )
);
