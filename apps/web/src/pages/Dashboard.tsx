import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function Dashboard() {
  const navigate = useNavigate();
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
  }, [activeWorkspace, selectedYear, selectedMonth, fetchMonthlyOverview]);

  const fixed = monthlyOverview?.fixed || { total: 0, paid: 0, pending: 0, count: 0 };
  const budget = monthlyOverview?.budget || { total: 0, spent: 0, remaining: 0, percentage: 0, count: 0 };
  const financing = monthlyOverview?.financing || { total: 0, paid: 0, pending: 0, count: 0 };
  const monthlyTotal = monthlyOverview?.monthlyTotal || 0;
  const categoryBreakdown = monthlyOverview?.categoryBreakdown || [];
  const upcomingInstances = monthlyOverview?.upcomingInstances || [];

  // Previous/Next month navigation
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
  };

  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();

  return (
    <AuthenticatedLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Carregando...</p>
          </div>
        </div>
      ) : activeWorkspace ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Visão geral das suas finanças em {activeWorkspace.name}
              </p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  {months.map((month, i) => (
                    <option key={i + 1} value={i + 1}>{month}</option>
                  ))}
                </select>
                <span className="text-gray-300">|</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {!isCurrentMonth && (
                <button
                  onClick={goToCurrentMonth}
                  className="ml-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Hoje
                </button>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total previsto para {months[selectedMonth - 1]}</p>
                <p className="text-4xl font-bold mt-1">€{monthlyTotal.toFixed(2)}</p>
                <p className="text-blue-200 text-sm mt-2">
                  Fixas + Orçamento + Financiamentos
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{fixed.count + financing.count}</p>
                  <p className="text-blue-200 text-sm">Contas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{budget.count}</p>
                  <p className="text-blue-200 text-sm">Categorias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fixed */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Contas Fixas</span>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">€{fixed.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{fixed.count} contas</p>
            </div>

            {/* Financing */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Financiamentos</span>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">€{financing.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{financing.count} financiamentos</p>
            </div>

            {/* Budget */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Orçamento</span>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">€{budget.total.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.percentage >= 100 ? 'bg-red-500' :
                      budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{budget.percentage.toFixed(0)}%</span>
              </div>
            </div>

            {/* Remaining */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Disponível</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  budget.remaining >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-4 h-4 ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className={`text-2xl font-bold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{budget.remaining.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {budget.remaining >= 0 ? 'Orçamento restante' : 'Acima do orçamento'}
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Gastos por Categoria</h3>
                <button
                  onClick={() => navigate('/categories')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas
                </button>
              </div>
              <div className="p-5">
                {categoryBreakdown.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Nenhuma categoria com orçamento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.slice(0, 5).map((category, index) => {
                      const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: category.color || '#6B7280' }}
                              >
                                {category.icon || category.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                €{category.spent.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                de €{category.budget.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 100 ? 'bg-red-500' :
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
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Próximos Vencimentos</h3>
                <button
                  onClick={() => navigate('/instances')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todos
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingInstances.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Nenhum vencimento próximo</p>
                  </div>
                ) : (
                  upcomingInstances.filter((i) => i.dueDate).slice(0, 5).map((instance) => {
                    const dueDate = new Date(instance.dueDate);
                    const today = new Date();
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div key={instance.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: instance.account.color || instance.account.category?.color || '#6B7280' }}
                            >
                              {instance.account.icon || instance.account.category?.icon || instance.account.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{instance.account.name}</p>
                              <p className="text-xs text-gray-500">
                                {dueDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                                {instance.isOverdue ? (
                                  <span className="ml-2 text-red-600 font-medium">Vencida</span>
                                ) : diffDays <= 3 ? (
                                  <span className="ml-2 text-yellow-600 font-medium">
                                    {diffDays === 0 ? 'Hoje' : diffDays === 1 ? 'Amanhã' : `Em ${diffDays} dias`}
                                  </span>
                                ) : null}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">€{instance.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum Workspace</h2>
            <p className="text-gray-500 mb-6">
              Crie o seu primeiro workspace para começar a organizar suas finanças.
            </p>
            <button
              onClick={() => navigate('/workspace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar workspace
            </button>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
