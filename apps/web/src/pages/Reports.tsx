import { useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useDashboardStore } from '../stores/dashboardStore';

export default function Reports() {
  const { activeWorkspace, fetchWorkspaces, isLoading: isWorkspaceLoading } = useWorkspaceStore();
  const { yearlyOverview, categoryReport, fetchYearlyOverview, fetchCategoryReport, isLoading } =
    useDashboardStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchYearlyOverview(activeWorkspace.id, selectedYear);
      fetchCategoryReport(activeWorkspace.id, selectedYear);
    }
  }, [activeWorkspace, selectedYear, fetchYearlyOverview, fetchCategoryReport]);

  const summary = useMemo(() => {
    if (!yearlyOverview) return { budgetTotal: 0, budgetSpent: 0, fixedTotal: 0, total: 0 };
    const budgetTotal = yearlyOverview.monthlyData.reduce((sum, m) => sum + (m.budgetTotal || 0), 0);
    const budgetSpent = yearlyOverview.monthlyData.reduce((sum, m) => sum + (m.budgetSpent || 0), 0);
    const fixedTotal = yearlyOverview.monthlyData.reduce((sum, m) => sum + (m.fixedTotal || 0), 0);
    const total = yearlyOverview.yearTotal || 0;
    return { budgetTotal, budgetSpent, fixedTotal, total };
  }, [yearlyOverview]);

  if (isWorkspaceLoading || !activeWorkspace) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visão anual com orçamento mensal aplicado por instância.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Orçamento total do ano</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">€{summary.budgetTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Gasto em variáveis</p>
            <p className="text-2xl font-bold text-blue-600 tabular-nums">€{summary.budgetSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Fixas + financiamentos</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">€{summary.fixedTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total anual (fixas + gasto variável)</p>
            <p className="text-2xl font-bold text-green-600 tabular-nums">€{summary.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Monthly Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Mensal (orçamento vs gasto)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% do orçamento</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fixas/Financ.</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total mês</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading || !yearlyOverview ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-6 text-center text-gray-500">
                      {isLoading ? 'Carregando...' : 'Sem dados para este ano'}
                    </td>
                  </tr>
                ) : (
                  yearlyOverview.monthlyData.map((m) => {
                    const budgetTotal = Number(m.budgetTotal ?? 0);
                    const budgetSpent = Number(m.budgetSpent ?? 0);
                    const fixedTotal = Number(m.fixedTotal ?? 0);
                    const total = Number(m.total ?? 0);
                    const monthLabel = new Date(selectedYear, m.month - 1).toLocaleDateString('pt-PT', { month: 'short' });
                    const percent = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;
                    return (
                      <tr key={m.month} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900">{monthLabel}</td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm text-gray-900 tabular-nums">€{budgetTotal.toFixed(2)}</td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm text-gray-900 tabular-nums">€{budgetSpent.toFixed(2)}</td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm font-medium tabular-nums">
                          <span className={percent >= 100 ? 'text-red-600' : percent >= 80 ? 'text-yellow-600' : 'text-green-600'}>
                            {percent.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm text-gray-900 tabular-nums">€{fixedTotal.toFixed(2)}</td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm font-semibold text-gray-900 tabular-nums">€{total.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Report */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Por categoria (ano)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orçamento acumulado
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gasto acumulado
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % do orçamento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!categoryReport || categoryReport.categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-6 text-center text-gray-500">
                      {isLoading ? 'Carregando...' : 'Sem dados para este ano'}
                    </td>
                  </tr>
                ) : (
                  categoryReport.categories.map((c) => {
                    const budgetTotal = Number(c.budgetTotal ?? 0);
                    const spent = Number(c.spent ?? 0);
                    const percent = budgetTotal > 0 ? (spent / budgetTotal) * 100 : 0;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ backgroundColor: c.color || '#6B7280' }}
                          ></span>
                          {c.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm text-gray-900 tabular-nums">
                          €{budgetTotal.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm text-gray-900 tabular-nums">
                          €{spent.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm font-medium tabular-nums">
                          <span className={percent >= 100 ? 'text-red-600' : percent >= 80 ? 'text-yellow-600' : 'text-green-600'}>
                            {percent.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
