import { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useAccountsStore, AccountType, RecurrenceType } from '../../stores/accountsStore';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string; color: string; icon?: string }>;
}

export default function CreateAccountModal({ isOpen, onClose, categories }: CreateAccountModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { createAccount } = useAccountsStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: AccountType.FIXED,
    categoryId: '',
    color: '#3B82F6',
    icon: '',
    isAmountFixed: true,
    fixedAmount: '',
    dueDay: '',
    recurrence: RecurrenceType.MONTHLY,
    budgetAmount: '',
    totalInstallments: '',
    principalAmount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    alertDaysBefore: '3',
    alertBudgetPercent: '80',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        categoryId: formData.categoryId || undefined,
        color: formData.color,
        icon: formData.icon || undefined,
        isActive: formData.isActive,
      };

      if (formData.type === AccountType.FIXED) {
        payload.isAmountFixed = formData.isAmountFixed;
        if (formData.isAmountFixed && formData.fixedAmount) {
          payload.fixedAmount = parseFloat(formData.fixedAmount);
        }
        if (formData.dueDay) {
          payload.dueDay = parseInt(formData.dueDay);
        }
        payload.recurrence = formData.recurrence;
        payload.alertDaysBefore = parseInt(formData.alertDaysBefore);
      } else if (formData.type === AccountType.BUDGET) {
        if (formData.budgetAmount) {
          payload.budgetAmount = parseFloat(formData.budgetAmount);
        }
        payload.alertBudgetPercent = parseInt(formData.alertBudgetPercent);
      } else if (formData.type === AccountType.FINANCING) {
        if (formData.fixedAmount) {
          payload.fixedAmount = parseFloat(formData.fixedAmount);
        }
        if (formData.totalInstallments) {
          payload.totalInstallments = parseInt(formData.totalInstallments);
        }
        if (formData.principalAmount) {
          payload.principalAmount = parseFloat(formData.principalAmount);
        }
        if (formData.interestRate) {
          payload.interestRate = parseFloat(formData.interestRate);
        }
        if (formData.dueDay) {
          payload.dueDay = parseInt(formData.dueDay);
        }
        if (formData.startDate) {
          payload.startDate = new Date(formData.startDate).toISOString();
        }
        // Calculate end date based on totalInstallments
        if (formData.totalInstallments && formData.startDate) {
          const endDate = new Date(formData.startDate);
          endDate.setMonth(endDate.getMonth() + parseInt(formData.totalInstallments));
          payload.endDate = endDate.toISOString();
        }
        payload.recurrence = RecurrenceType.MONTHLY;
        payload.alertDaysBefore = parseInt(formData.alertDaysBefore);
      }

      await createAccount(activeWorkspace.id, payload);

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: AccountType.FIXED,
        categoryId: '',
        color: '#3B82F6',
        icon: '',
        isAmountFixed: true,
        fixedAmount: '',
        dueDay: '',
        recurrence: RecurrenceType.MONTHLY,
        budgetAmount: '',
        totalInstallments: '',
        principalAmount: '',
        interestRate: '',
        startDate: new Date().toISOString().split('T')[0],
        alertDaysBefore: '3',
        alertBudgetPercent: '80',
        isActive: true,
      });

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Nova Conta</h3>
            </div>

            <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Renda, Supermercado, Luz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição opcional"
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: AccountType.FIXED })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === AccountType.FIXED
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📅</div>
                    <div className="font-semibold text-gray-900 text-sm">Fixa</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Contas recorrentes
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: AccountType.BUDGET })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === AccountType.BUDGET
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">💰</div>
                    <div className="font-semibold text-gray-900 text-sm">Variável</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Orçamento mensal
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: AccountType.FINANCING })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === AccountType.FINANCING
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🏦</div>
                    <div className="font-semibold text-gray-900 text-sm">Financiamento</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Parcelado
                    </div>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* FIXED Account Fields */}
              {formData.type === AccountType.FIXED && (
                <>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isAmountFixed}
                        onChange={(e) => setFormData({ ...formData, isAmountFixed: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Valor fixo (mesma quantia todos os meses)
                      </span>
                    </label>
                  </div>

                  {formData.isAmountFixed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Fixo *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">€</span>
                        <input
                          type="number"
                          step="0.01"
                          required={formData.isAmountFixed}
                          value={formData.fixedAmount}
                          onChange={(e) => setFormData({ ...formData, fixedAmount: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dia de Vencimento
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dueDay}
                        onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1-31"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alerta (dias antes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.alertDaysBefore}
                        onChange={(e) => setFormData({ ...formData, alertDaysBefore: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* BUDGET Account Fields */}
              {formData.type === AccountType.BUDGET && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orçamento Mensal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">€</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.budgetAmount}
                        onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alerta quando atingir (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.alertBudgetPercent}
                      onChange={(e) => setFormData({ ...formData, alertBudgetPercent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* FINANCING Account Fields */}
              {formData.type === AccountType.FINANCING && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor da Parcela *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">€</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.fixedAmount}
                          onChange={(e) => setFormData({ ...formData, fixedAmount: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.totalInstallments}
                        onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 12, 24, 36"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Total Financiado
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.principalAmount}
                          onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa de Juros (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 2.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dia do Vencimento *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={formData.dueDay}
                        onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 5, 15, 25"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alertar X dias antes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.alertDaysBefore}
                      onChange={(e) => setFormData({ ...formData, alertDaysBefore: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando...' : 'Criar Conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
