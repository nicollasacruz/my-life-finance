import { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useInstancesStore } from '../../stores/instancesStore';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: any;
}

export default function MarkPaidModal({ isOpen, onClose, instance }: MarkPaidModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { markPaid } = useInstancesStore();

  const [confirmedAmount, setConfirmedAmount] = useState(
    instance?.amount ? Number(instance.amount).toFixed(2) : '0.00'
  );
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !instance) return;

    setIsSubmitting(true);
    setError('');

    try {
      await markPaid(
        activeWorkspace.id,
        instance.id,
        parseFloat(confirmedAmount),
        paidAt
      );
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao marcar como pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !instance) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Marcar como Pago</h3>
              <p className="mt-1 text-sm text-gray-500">{instance.account.name}</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Pago *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">€</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={confirmedAmount}
                    onChange={(e) => setConfirmedAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {instance.amount && Number(confirmedAmount) !== Number(instance.amount) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Valor estimado: €{Number(instance.amount).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Pagamento *
                </label>
                <input
                  type="date"
                  required
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Marcando...' : 'Marcar como Pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
