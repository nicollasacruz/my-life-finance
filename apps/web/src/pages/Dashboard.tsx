import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

export function Dashboard() {
  const { activeWorkspace, fetchWorkspaces, isLoading } = useWorkspaceStore();
  const { monthlyOverview, fetchMonthlyOverview } = useDashboardStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMonthlyOverview(activeWorkspace.id, selectedYear, selectedMonth);
    }
  }, [activeWorkspace, selectedYear, selectedMonth]);

  const fixed = monthlyOverview?.fixed || { total: 0, paid: 0, pending: 0, count: 0 };
  const budget = monthlyOverview?.budget || { total: 0, spent: 0, remaining: 0, percentage: 0, count: 0 };
  const financing = monthlyOverview?.financing || { total: 0, paid: 0, pending: 0, count: 0 };
  const categoryBreakdown = monthlyOverview?.categoryBreakdown || [];
  const upcomingInstances = monthlyOverview?.upcomingInstances || [];

  return (
    <AuthenticatedLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : activeWorkspace ? (
        <div className="px-4 py-6 sm:px-0">
          {/* Header with Month/Year Selector */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activeWorkspace.name}</h2>
              <p className="text-gray-600">{activeWorkspace.description || 'Sem descrição'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleDateString('pt-PT', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contas Fixas</h3>
              <p className="text-3xl font-bold text-gray-900">€{fixed.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{fixed.count} contas</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Financiamentos</h3>
              <p className="text-3xl font-bold text-purple-600">€{financing.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{financing.count} financiamentos</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Orçamento Total</h3>
              <p className="text-3xl font-bold text-blue-600">€{budget.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{budget.count} categorias</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Gasto</h3>
              <p className="text-3xl font-bold text-orange-600">€{budget.spent.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{budget.percentage.toFixed(0)}% do orçamento</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Disponível</h3>
              <p className={`text-3xl font-bold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{budget.remaining.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Orçamento restante</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Gastos no mês</h3>
              </div>
              <div className="p-5">
                {categoryBreakdown.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma categoria com orçamento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.map((category, index) => {
                      const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                                style={{ backgroundColor: category.color || '#6B7280' }}
                              >
                                {category.icon || category.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                €{category.spent.toFixed(2)} / €{category.budget.toFixed(2)}
                              </p>
                              <p className={`text-xs ${
                                percentage >= 100 ? 'text-red-600' :
                                percentage >= 80 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {percentage.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 100 ? 'bg-red-600' :
                                percentage >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Próximos Vencimentos</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingInstances.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="text-gray-500">Nenhum vencimento próximo</p>
                  </div>
                ) : (
                  upcomingInstances.slice(0, 5).map((instance) => (
                    <div key={instance.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                            style={{ backgroundColor: instance.account.color || instance.account.category?.color || '#6B7280' }}
                          >
                            {instance.account.icon || instance.account.category?.icon || instance.account.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{instance.account.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(instance.dueDate).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">€{instance.amount.toFixed(2)}</p>
                          {instance.isOverdue && (
                            <span className="text-xs text-red-600 font-medium">Vencida</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
