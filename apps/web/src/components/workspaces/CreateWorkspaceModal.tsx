import { useState, FormEvent } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  const [name, setName] = useState('');
  const [type, setType] = useState<'PERSONAL' | 'HOUSEHOLD' | 'BUSINESS'>('PERSONAL');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const slug = generateSlug(name);
      await createWorkspace({ name, slug, type, description });
      onClose();
      setName('');
      setType('PERSONAL');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar workspace');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Criar Workspace</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="Nome"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Casa, Empresa..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="PERSONAL">Pessoal</option>
              <option value="HOUSEHOLD">Casa</option>
              <option value="BUSINESS">Empresa</option>
            </select>
          </div>

          <Input
            label="Descrição (opcional)"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Despesas da casa..."
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
