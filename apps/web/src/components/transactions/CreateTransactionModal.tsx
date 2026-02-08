import { useState, useEffect } from 'react';
import { useTransactionsStore } from '../../stores/transactionsStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useInstancesStore } from '../../stores/instancesStore';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountInstanceId?: string;
  accountName?: string;
}

export default function CreateTransactionModal({
  isOpen,
  onClose,
  accountInstanceId: initialAccountInstanceId,
  accountName: _accountName,
}: CreateTransactionModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { createTransaction, isLoading } = useTransactionsStore();
  const { instances, fetchInstances } = useInstancesStore();

  const budgetInstances = instances.filter(i => i.account.type === 'BUDGET');

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    accountInstanceId: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Fetch instances matching the selected date's month/year
  useEffect(() => {
    if (isOpen && activeWorkspace) {
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      fetchInstances(activeWorkspace.id, year, month);
    }
  }, [isOpen, activeWorkspace, formData.date]);

  useEffect(() => {
    if (isOpen && budgetInstances.length > 0) {
      const currentId = formData.accountInstanceId;
      const currentStillValid = budgetInstances.some(i => i.id === currentId);
      if (!currentStillValid) {
        const defaultInstanceId = initialAccountInstanceId && budgetInstances.some(i => i.id === initialAccountInstanceId)
          ? initialAccountInstanceId
          : budgetInstances[0]?.id || '';
        setFormData(prev => ({
          ...prev,
          accountInstanceId: defaultInstanceId,
        }));
      }
    }
  }, [isOpen, budgetInstances.length, initialAccountInstanceId]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        accountInstanceId: '',
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeWorkspace) {
      setError('No active workspace');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.accountInstanceId) {
      setError('Selecione uma conta');
      return;
    }

    try {
      await createTransaction(activeWorkspace.id, {
        accountInstanceId: formData.accountInstanceId,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        date: new Date(formData.date + 'T12:00:00').toISOString(),
        location: formData.location || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta *
            </label>
            <select
              value={formData.accountInstanceId}
              onChange={(e) => setFormData({ ...formData, accountInstanceId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma conta</option>
              {budgetInstances.map((instance) => (
                <option key={instance.id} value={instance.id}>
                  {instance.account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Compra no supermercado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Continente - Lisboa"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'A criar...' : 'Criar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
