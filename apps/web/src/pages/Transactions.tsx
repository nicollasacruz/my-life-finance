import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useTransactionsStore } from '../stores/transactionsStore';
import { useAccountsStore, AccountType } from '../stores/accountsStore';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export default function Transactions() {
  const { activeWorkspace } = useWorkspaceStore();
  const { transactions, fetchTransactions, deleteTransaction, isLoading } = useTransactionsStore();
  const { accounts, fetchAccounts } = useAccountsStore();

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (activeWorkspace) {
      fetchAccounts(activeWorkspace.id, AccountType.BUDGET);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchTransactions(
        activeWorkspace.id,
        selectedAccountId || undefined,
        selectedYear,
        selectedMonth,
      );
    }
  }, [activeWorkspace, selectedAccountId, selectedYear, selectedMonth]);

  const budgetAccounts = accounts.filter(a => a.type === 'BUDGET');

  const handleDelete = async (id: string) => {
    if (!activeWorkspace) return;
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(activeWorkspace.id, id);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };


  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('pt-PT');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe seus gastos nas contas variáveis
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as contas</option>
                {budgetAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleDateString('pt-PT', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700">Total Gasto:</span>
              <span className="text-2xl font-bold text-orange-600">€{totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma transação</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando gastos às suas contas variáveis
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date} className="bg-white rounded-lg shadow">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">{date}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {dayTransactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                            style={{
                              backgroundColor:
                                transaction.accountInstance?.account.color ||
                                transaction.accountInstance?.account.category?.color ||
                                '#6B7280',
                            }}
                          >
                            {transaction.accountInstance?.account.icon ||
                              transaction.accountInstance?.account.category?.icon ||
                              transaction.accountInstance?.account.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {transaction.description || 'Sem descrição'}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{transaction.accountInstance?.account.name}</span>
                              {transaction.location && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-semibold text-gray-900">
                            €{transaction.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
