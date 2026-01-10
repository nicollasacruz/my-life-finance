import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useInstancesStore } from '@/stores/instancesStore';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

export function Dashboard() {
  const { activeWorkspace, fetchWorkspaces, isLoading } = useWorkspaceStore();
  const { stats, instances, fetchStats, fetchInstances } = useInstancesStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      const now = new Date();
      fetchStats(activeWorkspace.id, now.getFullYear(), now.getMonth() + 1);
      fetchInstances(activeWorkspace.id, now.getFullYear(), now.getMonth() + 1);
    }
  }, [activeWorkspace]);

  return (
    <AuthenticatedLayout>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Instâncias</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Este mês</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Por Pagar</h3>
                <p className="text-3xl font-bold text-orange-600">
                  €{Number(stats?.pendingAmount || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stats?.open || 0} abertas</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pago</h3>
                <p className="text-3xl font-bold text-green-600">
                  €{Number(stats?.paidAmount || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stats?.paid || 0} pagas</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vencidas</h3>
                <p className="text-3xl font-bold text-red-600">{stats?.overdue || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Requerem atenção</p>
              </div>
            </div>

            {/* Recent Instances */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Próximos Vencimentos</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {instances.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">Nenhum vencimento para este mês</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Crie contas fixas para gerar vencimentos automaticamente
                    </p>
                  </div>
                ) : (
                  instances.slice(0, 10).map((instance) => (
                    <div key={instance.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                            style={{ backgroundColor: instance.account.color || instance.account.category?.color || '#6B7280' }}
                          >
                            {instance.account.icon || instance.account.category?.icon || instance.account.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{instance.account.name}</p>
                            <p className="text-sm text-gray-500">
                              Vencimento: {new Date(instance.dueDate).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              €{Number(instance.amount || instance.paidAmount || 0).toFixed(2)}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                instance.status === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : instance.isOverdue
                                  ? 'bg-red-100 text-red-800'
                                  : instance.status === 'EXEMPT'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {instance.status === 'PAID'
                                ? 'Pago'
                                : instance.isOverdue
                                ? 'Vencida'
                                : instance.status === 'EXEMPT'
                                ? 'Isenta'
                                : 'Aberta'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
    </AuthenticatedLayout>
  );
}
