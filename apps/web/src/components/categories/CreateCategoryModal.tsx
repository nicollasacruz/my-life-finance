import { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useCategoriesStore } from '../../stores/categoriesStore';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emojiOptions = [
  '🏠', '🏢', '🏘️', '⚡', '💧', '🔥', '📡', '📱',
  '⛽', '🚇', '🅿️', '🚗', '🔧', '🛒', '🍽️', '☕',
  '💊', '🏥', '👨‍⚕️', '💪', '🎓', '📚', '✏️', '🛡️',
  '❤️', '📺', '🎬', '✈️', '👔', '💇', '🧴', '🧹',
  '🔨', '🛋️', '🏦', '💳', '💰', '🐕', '🎁', '📌',
];

const colorOptions = [
  '#EF4444', '#F97316', '#F59E0B', '#FBBF24', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6',
  '#6366F1', '#8B5CF6', '#A78BFA', '#EC4899', '#F472B6',
  '#64748B', '#6B7280', '#9CA3AF',
];

export default function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { createCategory } = useCategoriesStore();

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📌',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;

    setIsSubmitting(true);
    setError('');

    try {
      await createCategory(activeWorkspace.id, formData);

      // Reset form
      setFormData({
        name: '',
        color: '#3B82F6',
        icon: '📌',
      });

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Nova Categoria</h3>
            </div>

            <div className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Preview */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-lg"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Renda, Supermercado, Combustível"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        formData.icon === emoji
                          ? 'bg-blue-100 ring-2 ring-blue-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-gray-400'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando...' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
