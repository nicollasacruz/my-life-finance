import { useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { MembersSection } from '../components/workspaces/MembersSection';
import type { WorkspaceType } from '@my-life-finance/shared-types';

const workspaceTypes: { value: WorkspaceType; label: string }[] = [
  { value: 'PERSONAL', label: 'Pessoal' },
  { value: 'HOUSEHOLD', label: 'Casa' },
  { value: 'BUSINESS', label: 'Negócio' },
];

export default function Workspace() {
  const { workspaces, activeWorkspace, fetchWorkspaces, setActiveWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, isLoading } =
    useWorkspaceStore();

  const [form, setForm] = useState<{
    name: string;
    slug: string;
    type: WorkspaceType;
    description: string;
  }>({
    name: '',
    slug: '',
    type: 'PERSONAL',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const current = useMemo(() => activeWorkspace, [activeWorkspace]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (current) {
      setForm({
        name: current.name,
        slug: current.slug,
        type: current.type || 'PERSONAL',
        description: current.description || '',
      });
    }
  }, [current]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setIsSaving(true);
    setError('');
    try {
      await updateWorkspace(current.id, {
        name: form.name,
        slug: form.slug,
        type: form.type,
        description: form.description || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    setError('');
    try {
      const name = 'Novo workspace';
      const slug = `${slugify(name)}-${Date.now()}`;
      const ws = await createWorkspace({ name, slug, type: 'PERSONAL', description: '' });
      setActiveWorkspace(ws);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    const ok = confirm('Deseja excluir este workspace? Isto removerá acesso aos dados dele.');
    if (!ok) return;
    setIsSaving(true);
    setError('');
    try {
      await deleteWorkspace(current.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir workspace');
    } finally {
      setIsSaving(false);
    }
  };

  if (!current && !isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="px-4 py-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Nenhum workspace</h1>
            <p className="mt-2 text-sm text-gray-600">Crie um workspace para começar.</p>
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Criar workspace
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
            <p className="mt-1 text-sm text-gray-500">Edite dados do workspace e troque entre eles.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={current?.id || ''}
              onChange={(e) => {
                const next = workspaces.find((w) => w.id === e.target.value);
                if (next) setActiveWorkspace(next);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              + Novo workspace
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug ? prev.slug : slugify(name),
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as WorkspaceType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workspaceTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opcional"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                Excluir workspace
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>

        <MembersSection />
      </div>
    </AuthenticatedLayout>
  );
}
