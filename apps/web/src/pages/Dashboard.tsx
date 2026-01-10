import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/Button';
import { WorkspaceSelector } from '@/components/workspaces/WorkspaceSelector';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { activeWorkspace, fetchWorkspaces, isLoading } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">My Life Finance</h1>
              <WorkspaceSelector />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Olá, {user?.name}</span>
              <Button variant="ghost" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : activeWorkspace ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{activeWorkspace.name}</h2>
              <p className="text-gray-600">{activeWorkspace.description || 'Sem descrição'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Contas</h3>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Por Pagar</h3>
                <p className="text-3xl font-bold text-orange-600">€0.00</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pago Este Mês</h3>
                <p className="text-3xl font-bold text-green-600">€0.00</p>
              </div>
            </div>

            <div className="border-4 border-dashed border-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Contas e Dashboard
                </h3>
                <p className="text-gray-600">Fase 3: Implementação de contas e instâncias</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Nenhum Workspace
                </h2>
                <p className="text-gray-600 mb-4">
                  Cria o teu primeiro workspace para começar
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
