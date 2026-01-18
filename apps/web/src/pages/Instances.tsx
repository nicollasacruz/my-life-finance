import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useInstancesStore, InstanceStatus } from '../stores/instancesStore';
import MarkPaidModal from '../components/instances/MarkPaidModal';
import CreateTransactionModal from '../components/transactions/CreateTransactionModal';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export default function Instances() {
  const { activeWorkspace } = useWorkspaceStore();
  const { instances, fetchInstances, markExempt, reopen, isLoading } = useInstancesStore();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [filterStatus, setFilterStatus] = useState<InstanceStatus | 'ALL' | 'OVERDUE'>('ALL');
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);
  const [selectedTransactionInstance, setSelectedTransactionInstance] = useState<any>(null);

  useEffect(() => {
    if (activeWorkspace) {
      fetchInstances(activeWorkspace.id, selectedYear, selectedMonth);
    }
  }, [activeWorkspace, selectedYear, selectedMonth]);

  const filteredInstances = filterStatus === 'ALL'
    ? instances
    : filterStatus === 'OVERDUE'
    ? instances.filter(i => i.isOverdue)
    : instances.filter(i => i.status === filterStatus);

  const handleMarkPaid = (instance: any) => {
    setSelectedInstance(instance);
    setIsMarkPaidOpen(true);
  };

  const handleMarkExempt = async (id: string) => {
    if (!activeWorkspace) return;
    if (confirm('Marcar esta instância como isenta?')) {
      try {
        await markExempt(activeWorkspace.id, id);
      } catch (error) {
        console.error('Failed to mark as exempt:', error);
      }
    }
  };

  const handleReopen = async (id: string) => {
    if (!activeWorkspace) return;
    try {
      await reopen(activeWorkspace.id, id);
    } catch (error) {
      console.error('Failed to reopen:', error);
    }
  };

  const handleAddTransaction = (instance: any) => {
    setSelectedTransactionInstance(instance);
    setIsCreateTransactionOpen(true);
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (!activeWorkspace) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Selecione um workspace</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vencimentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os pagamentos mensais das suas contas fixas
          </p>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto px-1">
          <nav className="-mb-px flex min-w-max gap-4">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'OPEN', label: 'Abertas' },
              { key: 'OVERDUE', label: 'Vencidas' },
              { key: 'PAID', label: 'Pagas' },
              { key: 'EXEMPT', label: 'Isentas' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`${
                  filterStatus === filter.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {filter.label}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                  {filter.key === 'ALL'
                    ? instances.length
                    : filter.key === 'OVERDUE'
                    ? instances.filter(i => i.isOverdue).length
                    : instances.filter(i => i.status === filter.key).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

      {/* Instances List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredInstances.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum vencimento</h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há vencimentos para este período
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conta
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold mr-3"
                          style={{ backgroundColor: instance.account.color || instance.account.category?.color || '#6B7280' }}
                        >
                          {instance.account.icon || instance.account.category?.icon || instance.account.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{instance.account.name}</div>
                          {instance.account.category && (
                            <div className="text-sm text-gray-500">{instance.account.category.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(instance.dueDate).toLocaleDateString('pt-PT')}
                      </div>
                      {instance.paidAt && (
                        <div className="text-xs text-gray-500">
                          Pago em: {new Date(instance.paidAt).toLocaleDateString('pt-PT')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        €{Number(instance.paidAmount || instance.amount || 0).toFixed(2)}
                      </div>
                      {instance.paidAmount && instance.amount &&
                       instance.paidAmount !== instance.amount && (
                        <div className="text-xs text-gray-500">
                          Estimado: €{Number(instance.amount).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {instance.account.type === 'BUDGET' && (
                        <button
                          onClick={() => handleAddTransaction(instance)}
                          className="text-blue-600 hover:text-blue-900 font-medium mr-3"
                        >
                          + Transação
                        </button>
                      )}
                      {instance.status === 'OPEN' && instance.account.type !== 'BUDGET' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleMarkPaid(instance)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Pagar
                          </button>
                          <button
                            onClick={() => handleMarkExempt(instance.id)}
                            className="text-gray-600 hover:text-gray-900 font-medium"
                          >
                            Isentar
                          </button>
                        </div>
                      )}
                      {(instance.status === 'PAID' || instance.status === 'EXEMPT') && (
                        <button
                          onClick={() => handleReopen(instance.id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Reabrir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {selectedInstance && (
        <MarkPaidModal
          isOpen={isMarkPaidOpen}
          onClose={() => {
            setIsMarkPaidOpen(false);
            setSelectedInstance(null);
          }}
          instance={selectedInstance}
        />
      )}

      {/* Create Transaction Modal */}
      {selectedTransactionInstance && (
        <CreateTransactionModal
          isOpen={isCreateTransactionOpen}
          onClose={() => {
            setIsCreateTransactionOpen(false);
            setSelectedTransactionInstance(null);
            if (activeWorkspace) {
              fetchInstances(activeWorkspace.id, selectedYear, selectedMonth);
            }
          }}
          accountInstanceId={selectedTransactionInstance.id}
          accountName={selectedTransactionInstance.account.name}
        />
      )}
      </div>
    </AuthenticatedLayout>
  );
}
