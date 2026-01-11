import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useAccountsStore, AccountType } from '../stores/accountsStore';
import { useCategoriesStore } from '../stores/categoriesStore';
import CreateAccountModal from '../components/accounts/CreateAccountModal';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';

export default function Accounts() {
  const { activeWorkspace } = useWorkspaceStore();
  const { accounts, fetchAccounts, deleteAccount, isLoading } = useAccountsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [filterType, setFilterType] = useState<AccountType | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchAccounts(activeWorkspace.id);
      fetchCategories(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const filteredAccounts = filterType === 'ALL'
    ? accounts
    : accounts.filter(a => a.type === filterType);

  const handleDelete = async (id: string) => {
    if (!activeWorkspace) return;
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteAccount(activeWorkspace.id, id);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas contas fixas e variáveis
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Conta
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['ALL', 'FIXED', 'BUDGET', 'FINANCING'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`${
                filterType === type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {type === 'ALL' ? 'Todas' : type === 'FIXED' ? 'Fixas' : type === 'BUDGET' ? 'Variáveis' : 'Financiamentos'}
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                {type === 'ALL'
                  ? accounts.length
                  : accounts.filter(a => a.type === type).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma conta</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando uma nova conta {filterType !== 'ALL' && (filterType === 'FIXED' ? 'fixa' : 'variável')}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Conta
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-semibold"
                      style={{ backgroundColor: account.color || account.category?.color || '#6B7280' }}
                    >
                      {account.icon || account.category?.icon || account.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                      {account.category && (
                        <p className="text-xs text-gray-500">{account.category.name}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.type === 'FIXED'
                        ? 'bg-purple-100 text-purple-800'
                        : account.type === 'BUDGET'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {account.type === 'FIXED' ? 'Fixa' : account.type === 'BUDGET' ? 'Variável' : 'Financiamento'}
                  </span>
                </div>

                {account.description && (
                  <p className="text-sm text-gray-600 mb-4">{account.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {account.type === 'FIXED' && (
                    <>
                      {account.isAmountFixed && account.fixedAmount && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Valor:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            €{Number(account.fixedAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {account.dueDay && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Vencimento:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            Dia {account.dueDay}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {account.type === 'BUDGET' && account.budgetAmount && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500">Orçamento:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        €{Number(account.budgetAmount).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {account.type === 'FINANCING' && (
                    <>
                      {account.fixedAmount && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Parcela:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            €{Number(account.fixedAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {account.totalInstallments && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Parcelas:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {account.totalInstallments}x
                          </span>
                        </div>
                      )}
                      {account.principalAmount && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Valor Total:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            €{Number(account.principalAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {account.endDate && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500">Término:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(account.endDate).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
      />
      </div>
    </AuthenticatedLayout>
  );
}
